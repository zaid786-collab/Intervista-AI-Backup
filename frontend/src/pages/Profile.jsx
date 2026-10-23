import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProfilePage from '../components/ProfilePage';
import { useAuth } from '../context/useAuth';

export default function Profile({ onStartInterview, onViewReport }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ paddingTop: 'var(--nav-height, 76px)', backgroundColor: 'var(--bg-base, #090909)', minHeight: '100vh' }}>
      <ProfilePage
        currentUser={user}
        onStartInterview={onStartInterview || (() => navigate('/interview'))}
        onNavigate={(page) => navigate(`/${page}`)}
        onViewReport={onViewReport}
        onLogout={() => {
          logout();
          navigate('/');
        }}
      />
    </div>
  );
}