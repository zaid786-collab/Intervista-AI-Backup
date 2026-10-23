import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Mail, User, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { apiLogin, apiRegister } from '../utils/api';
import './AuthPage.css';

export default function AuthPage({ mode = 'login' }) {
  const [currentMode, setCurrentMode] = useState(mode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const { login: authContextLogin, updateUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectDest = searchParams.get('redirect') || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setError('Please provide both email and password.');
      return;
    }

    if (currentMode === 'signup') {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setLoading(true);
    try {
      let authenticatedUser;
      if (currentMode === 'signup') {
        authenticatedUser = await apiRegister({ name: name.trim(), email: cleanEmail, password });
        setSuccessMsg(`Account created! Welcome, ${authenticatedUser.name || 'Candidate'}. Redirecting to Dashboard...`);
      } else {
        authenticatedUser = await apiLogin({ email: cleanEmail, password });
        setSuccessMsg(`Welcome back, ${authenticatedUser.name || 'Candidate'}! Redirecting to Dashboard...`);
      }

      if (updateUser) {
        updateUser(authenticatedUser);
      }

      setTimeout(() => {
        navigate(redirectDest, { replace: true });
      }, 600);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="authPage">
      <div className="authCard">
        <div className="authIntro">
          <span className="eyebrow">INTERVISTA AI</span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', marginTop: '0.5rem', color: 'var(--text-primary)' }}>
            {currentMode === 'login' ? 'Welcome Back' : 'Create Your Account'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.4rem' }}>
            {currentMode === 'login'
              ? 'Sign in to access your VR Mock Interview Simulator & Dashboard.'
              : 'Prepare like it is the real interview with high-fidelity AI feedback.'}
          </p>
        </div>

        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              padding: '0.75rem 1rem',
              color: '#EF4444',
              fontSize: '0.86rem',
              marginBottom: '1.25rem',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              backgroundColor: 'rgba(34, 197, 94, 0.12)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '12px',
              padding: '0.75rem 1rem',
              color: '#22C55E',
              fontSize: '0.86rem',
              marginBottom: '1.25rem',
            }}
          >
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {currentMode === 'signup' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Chen"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#191919',
                    border: '1px solid var(--border-card)',
                    borderRadius: '10px',
                    padding: '0.75rem 1rem 0.75rem 2.6rem',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: '#191919',
                  border: '1px solid var(--border-card)',
                  borderRadius: '10px',
                  padding: '0.75rem 1rem 0.75rem 2.6rem',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: '#191919',
                  border: '1px solid var(--border-card)',
                  borderRadius: '10px',
                  padding: '0.75rem 2.6rem',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-tertiary)',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {currentMode === 'signup' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#191919',
                    border: '1px solid var(--border-card)',
                    borderRadius: '10px',
                    padding: '0.75rem 1rem 0.75rem 2.6rem',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '0.85rem',
              marginTop: '0.5rem',
              fontSize: '0.92rem',
              fontWeight: 600,
              cursor: loading ? 'wait' : 'pointer',
            }}
          >
            <span>{loading ? 'Authenticating...' : currentMode === 'login' ? 'Sign In to Dashboard' : 'Create Account & Enter'}</span>
            {!loading && <ArrowRight size={16} />}
          </button>

          {currentMode === 'login' && (
            <div style={{ marginTop: '0.25rem', textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  setEmail('demo@intervista.ai');
                  setPassword('demo123');
                  setError('');
                }}
                style={{
                  background: 'rgba(217, 183, 122, 0.08)',
                  border: '1px solid rgba(217, 183, 122, 0.22)',
                  borderRadius: '6px',
                  color: 'var(--accent-gold)',
                  fontSize: '0.78rem',
                  padding: '0.35rem 0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                ⚡ Fill Demo Account (demo@intervista.ai)
              </button>
            </div>
          )}
        </form>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '1.5rem', textAlign: 'center' }}>
          {currentMode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setCurrentMode('signup');
                  setError('');
                }}
                style={{ background: 'none', border: 'none', color: 'var(--accent-gold)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => {
                  setCurrentMode('login');
                  setError('');
                }}
                style={{ background: 'none', border: 'none', color: 'var(--accent-gold)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
