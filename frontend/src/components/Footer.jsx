import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Footer({ onOpenLegal, onNavigate, onOpenContact, onSelectRole }) {
  let navigate = null;
  try {
    navigate = useNavigate();
  } catch (_) {}

  const handleNav = (page, sectionId) => {
    if (page === 'contact') {
      if (onOpenContact) onOpenContact();
      return;
    }
    if (onNavigate) {
      onNavigate(page, sectionId);
      return;
    }
    if (navigate) {
      if (page === 'plans' || page === 'pricing') navigate('/plans');
      else if (page === 'companies') navigate('/companies');
      else if (page === 'dashboard') navigate('/dashboard');
      else if (page === 'resources') navigate('/resources');
      else if (page === 'faq') navigate('/faq');
      else navigate('/');
      return;
    }
    if (page === 'plans') window.location.hash = '#plans';
    else if (page === 'companies') window.location.hash = '#companies';
    else if (page === 'dashboard') window.location.hash = '#dashboard';
    else window.location.hash = '#home';
  };

  return (
    <footer
      style={{
        backgroundColor: '#070707',
        borderTop: '1px solid rgba(255, 255, 255, 0.07)',
        padding: '3.2rem 0 2.2rem 0',
        position: 'relative',
      }}
    >
      <div className="container">
        {/* Main Minimalist Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem',
            paddingBottom: '2rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          }}
          className="footer-top-row"
        >
          {/* Brand */}
          <div style={{ display: 'inline-flex', alignItems: 'center', flexWrap: 'wrap' }}>
            <div
              style={{
                position: 'relative',
                height: '28px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginRight: '1px',
              }}
            >
              <img
                src="/logo-emblem.png"
                alt="I"
                style={{
                  height: '26px',
                  width: 'auto',
                  objectFit: 'contain',
                  display: 'block',
                  filter: 'drop-shadow(0 0 8px rgba(217, 183, 122, 0.45))',
                }}
              />
            </div>
            <span
              style={{
                fontFamily: "'Cinzel', 'Playfair Display', serif",
                fontSize: '1.22rem',
                fontWeight: 700,
                letterSpacing: '0.11em',
                textTransform: 'uppercase',
                background: 'linear-gradient(180deg, #FFFFFF 0%, #F6ECD8 22%, #DDB86C 60%, #9B7023 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 10px rgba(217, 183, 122, 0.35))',
                display: 'inline-block',
                lineHeight: 1,
                marginTop: '1px',
              }}
            >
              NTERVISTA
            </span>
            <span
              style={{
                color: 'var(--text-tertiary)',
                fontSize: '0.82rem',
                marginLeft: '0.3rem',
              }}
            >
              · Voice-first AI mock interview practice
            </span>
          </div>

          {/* Clean Essential Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '1.75rem', flexWrap: 'wrap' }}>
            {[
              { label: 'Home', page: 'home', id: 'hero' },
              { label: 'Dashboard', page: 'dashboard' },
              { label: 'Companies', page: 'companies' },
              { label: 'Plans', page: 'plans' },
              { label: 'Contact', page: 'contact' },
            ].map((link) => (
              <button
                key={link.label}
                onClick={() => handleNav(link.page, link.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'color var(--transition-fast)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                {link.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.8rem',
            color: 'var(--text-tertiary)',
          }}
          className="footer-bottom-row"
        >
          <div>
            © {new Date().getFullYear()} Intervista AI. All rights reserved.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            {['Privacy Policy', 'Terms of Service'].map((legal) => (
              <button
                key={legal}
                onClick={() => onOpenLegal && onOpenLegal(legal)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-tertiary)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'color var(--transition-fast)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
              >
                {legal}
              </button>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .footer-top-row, .footer-bottom-row {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 1.25rem !important;
          }
        }
      `}</style>
    </footer>
  );
}
