/**
 * Simple, secure, client-side authentication utility for Intervista.
 *
 * - Never stores plaintext passwords: hashes credentials with browser Web Crypto (SHA-256 + salt).
 * - Real registration and login validation.
 * - Stores registered accounts in localStorage under 'intervista_users'.
 * - Manages active session in localStorage under 'intervista_current_user'.
 */

const USERS_KEY = 'intervista_users';
const SESSION_KEY = 'intervista_current_user';

// Hash password with user's email as salt using Web Crypto API
export async function hashPassword(password, email) {
  const salt = email.trim().toLowerCase();
  const input = `${salt}:${password}`;

  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const data = new TextEncoder().encode(input);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // Fallback simple bitwise hash if subtle is unavailable
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return 'fb_' + Math.abs(hash).toString(16);
}

// Get all registered users
export function getRegisteredUsers() {
  try {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// Get active session
export function getCurrentUser() {
  try {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

// Register a new user
export async function registerUser({ name, email, password }) {
  const cleanName = (name || '').trim();
  const cleanEmail = (email || '').trim().toLowerCase();

  if (!cleanName || cleanName.length < 2) {
    throw new Error('Please enter your full name (at least 2 characters).');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    throw new Error('Please enter a valid email address.');
  }

  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }

  const users = getRegisteredUsers();
  const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    throw new Error('An account with this email already exists. Please log in.');
  }

  const passwordHash = await hashPassword(password, cleanEmail);
  const newUser = {
    id: 'user_' + Date.now().toString(36),
    name: cleanName,
    email: cleanEmail,
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  // Auto-login session
  const sessionUser = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    token: 'tok_' + Math.random().toString(36).substring(2),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));

  return sessionUser;
}

// Log in an existing user
export async function loginUser({ email, password }) {
  const cleanEmail = (email || '').trim().toLowerCase();

  if (!cleanEmail) {
    throw new Error('Please enter your email address.');
  }

  if (!password) {
    throw new Error('Please enter your password.');
  }

  const users = getRegisteredUsers();
  const user = users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (!user) {
    throw new Error('Invalid email or password.');
  }

  const passwordHash = await hashPassword(password, cleanEmail);
  if (user.passwordHash !== passwordHash) {
    throw new Error('Invalid email or password.');
  }

  const sessionUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    token: 'tok_' + Math.random().toString(36).substring(2),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));

  return sessionUser;
}

// Sign out
export function logoutUser() {
  localStorage.removeItem(SESSION_KEY);
}
