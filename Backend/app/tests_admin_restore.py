"""Isolated Unit and Integration Tests for Restored Make Admin Functionality.
Uses an isolated in-memory/temporary SQLite database to guarantee safety and isolation.
"""

import unittest
from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base
from app import models, schemas
from app.auth import hash_password, create_access_token
from app.dependencies import get_current_admin, get_current_user, MASTER_ADMIN_EMAIL
from app.routers import admin as admin_router


class TestAdminRestore(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Create an in-memory SQLite DB isolated for testing
        cls.engine = create_engine(
            "sqlite:///:memory:",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        Base.metadata.create_all(bind=cls.engine)
        cls.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=cls.engine)

    def setUp(self):
        # Clear tables between tests
        self.db = self.SessionLocal()
        self.db.query(models.User).delete()
        self.db.commit()

        # Seed master admin
        self.master_admin = models.User(
            name="Master Admin",
            email=MASTER_ADMIN_EMAIL,
            hashed_password=hash_password("masterpass123"),
            is_admin=True,
            is_active=True,
        )
        # Seed a second admin (e.g. team member already promoted)
        self.team_admin = models.User(
            name="Team Admin",
            email="teamadmin@example.com",
            hashed_password=hash_password("teampass123"),
            is_admin=True,
            is_active=True,
        )
        # Seed an ordinary user
        self.member_user = models.User(
            name="Member User",
            email="member@example.com",
            hashed_password=hash_password("memberpass123"),
            is_admin=False,
            is_active=True,
        )
        # Seed another member
        self.second_member = models.User(
            name="Second Member",
            email="second@example.com",
            hashed_password=hash_password("secondpass123"),
            is_admin=False,
            is_active=True,
        )

        self.db.add_all([self.master_admin, self.team_admin, self.member_user, self.second_member])
        self.db.commit()
        self.db.refresh(self.master_admin)
        self.db.refresh(self.team_admin)
        self.db.refresh(self.member_user)
        self.db.refresh(self.second_member)

    def tearDown(self):
        self.db.close()

    # --- 1. Test authorized admin promoting an eligible user ---
    def test_admin_promotes_eligible_user_success(self):
        payload = schemas.UserUpdateByAdmin(is_admin=True)
        updated = admin_router.update_user(
            user_id=self.member_user.id,
            payload=payload,
            db=self.db,
            admin=self.team_admin,
        )
        self.assertTrue(updated.is_admin)

        # Verify database persistence
        persisted = self.db.query(models.User).filter(models.User.id == self.member_user.id).first()
        self.assertTrue(persisted.is_admin)

    # --- 2. Test promoted admin can pass get_current_admin dependency ---
    def test_promoted_admin_passes_admin_dependency(self):
        # Promote member_user
        self.member_user.is_admin = True
        self.db.commit()

        # Check get_current_admin authorization
        admin_ref = get_current_admin(current_user=self.member_user)
        self.assertEqual(admin_ref.id, self.member_user.id)

    # --- 3. Test ordinary user is blocked from get_current_admin dependency ---
    def test_ordinary_user_fails_admin_dependency(self):
        with self.assertRaises(HTTPException) as ctx:
            get_current_admin(current_user=self.member_user)
        self.assertEqual(ctx.exception.status_code, 403)
        self.assertIn("Admin access required", ctx.exception.detail)

    # --- 4. Test self-promotion or self-demotion is blocked ---
    def test_prevent_self_role_modification(self):
        payload = schemas.UserUpdateByAdmin(is_admin=False)
        with self.assertRaises(HTTPException) as ctx:
            admin_router.update_user(
                user_id=self.team_admin.id,
                payload=payload,
                db=self.db,
                admin=self.team_admin,
            )
        self.assertEqual(ctx.exception.status_code, 400)
        self.assertIn("You cannot modify your own administrator privileges", ctx.exception.detail)

    # --- 5. Test self-disabling is blocked ---
    def test_prevent_self_disabling(self):
        payload = schemas.UserUpdateByAdmin(is_active=False)
        with self.assertRaises(HTTPException) as ctx:
            admin_router.update_user(
                user_id=self.team_admin.id,
                payload=payload,
                db=self.db,
                admin=self.team_admin,
            )
        self.assertEqual(ctx.exception.status_code, 400)
        self.assertIn("You cannot disable your own account", ctx.exception.detail)

    # --- 6. Test self-deletion is blocked ---
    def test_prevent_self_deletion(self):
        with self.assertRaises(HTTPException) as ctx:
            admin_router.delete_user(
                user_id=self.team_admin.id,
                db=self.db,
                admin=self.team_admin,
            )
        self.assertEqual(ctx.exception.status_code, 400)
        self.assertIn("You cannot delete your own account", ctx.exception.detail)

    # --- 7. Test master admin protection against demotion, disabling, and deletion ---
    def test_master_admin_protections(self):
        # Attempt to demote master admin
        with self.assertRaises(HTTPException) as ctx:
            admin_router.update_user(
                user_id=self.master_admin.id,
                payload=schemas.UserUpdateByAdmin(is_admin=False),
                db=self.db,
                admin=self.team_admin,
            )
        self.assertEqual(ctx.exception.status_code, 400)
        self.assertIn("master administrator account cannot be demoted", ctx.exception.detail)

        # Attempt to disable master admin
        with self.assertRaises(HTTPException) as ctx:
            admin_router.update_user(
                user_id=self.master_admin.id,
                payload=schemas.UserUpdateByAdmin(is_active=False),
                db=self.db,
                admin=self.team_admin,
            )
        self.assertEqual(ctx.exception.status_code, 400)
        self.assertIn("master administrator account cannot be disabled", ctx.exception.detail)

        # Attempt to delete master admin
        with self.assertRaises(HTTPException) as ctx:
            admin_router.delete_user(
                user_id=self.master_admin.id,
                db=self.db,
                admin=self.team_admin,
            )
        self.assertEqual(ctx.exception.status_code, 400)
        self.assertIn("master administrator account cannot be deleted", ctx.exception.detail)

    # --- 8. Test already-admin handling ---
    def test_already_admin_handling(self):
        with self.assertRaises(HTTPException) as ctx:
            admin_router.update_user(
                user_id=self.team_admin.id,
                payload=schemas.UserUpdateByAdmin(is_admin=True),
                db=self.db,
                admin=self.master_admin,
            )
        self.assertEqual(ctx.exception.status_code, 400)
        self.assertIn("already an administrator", ctx.exception.detail)

    # --- 9. Test already-member handling ---
    def test_already_member_handling(self):
        with self.assertRaises(HTTPException) as ctx:
            admin_router.update_user(
                user_id=self.member_user.id,
                payload=schemas.UserUpdateByAdmin(is_admin=False),
                db=self.db,
                admin=self.master_admin,
            )
        self.assertEqual(ctx.exception.status_code, 400)
        self.assertIn("not an administrator", ctx.exception.detail)

    # --- 10. Test missing user ID ---
    def test_missing_user_returns_404(self):
        with self.assertRaises(HTTPException) as ctx:
            admin_router.update_user(
                user_id=999999,
                payload=schemas.UserUpdateByAdmin(is_admin=True),
                db=self.db,
                admin=self.master_admin,
            )
        self.assertEqual(ctx.exception.status_code, 404)
        self.assertIn("User not found", ctx.exception.detail)

    # --- 11. Test revoking admin from a promoted user when other admins exist ---
    def test_revoke_admin_success(self):
        # Demote team_admin by master_admin (other admin exists: master_admin)
        updated = admin_router.update_user(
            user_id=self.team_admin.id,
            payload=schemas.UserUpdateByAdmin(is_admin=False),
            db=self.db,
            admin=self.master_admin,
        )
        self.assertFalse(updated.is_admin)

    # --- 12. Test cannot demote the last remaining active administrator ---
    def test_prevent_demoting_last_admin(self):
        # Delete team_admin so only master_admin is left
        self.db.delete(self.team_admin)
        self.db.commit()

        # Even if master_admin wasn't protected by email, last-admin check would trigger:
        # Create a solo admin with a non-master email for testing this exact check
        solo_admin = models.User(
            name="Solo Admin",
            email="solo@example.com",
            hashed_password=hash_password("solopass"),
            is_admin=True,
            is_active=True,
        )
        self.db.add(solo_admin)
        self.db.delete(self.master_admin)
        self.db.commit()

        # Another user tries to demote solo_admin
        caller_admin = models.User(
            name="Caller Admin",
            email="caller@example.com",
            hashed_password=hash_password("callerpass"),
            is_admin=True,
            is_active=True,
        )
        self.db.add(caller_admin)
        self.db.commit()
        # Now remove caller_admin so solo_admin is the only admin
        self.db.delete(caller_admin)
        self.db.commit()

        # Let's verify other active admin count is 0
        with self.assertRaises(HTTPException) as ctx:
            admin_router.update_user(
                user_id=solo_admin.id,
                payload=schemas.UserUpdateByAdmin(is_admin=False),
                db=self.db,
                admin=models.User(id=999, is_admin=True, email="temp@example.com"),
            )
        self.assertEqual(ctx.exception.status_code, 400)
        self.assertIn("last remaining active administrator", ctx.exception.detail)


if __name__ == "__main__":
    unittest.main()
