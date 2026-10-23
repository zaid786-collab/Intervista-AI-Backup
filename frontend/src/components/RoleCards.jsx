import React from 'react';
import { Code, Briefcase, BarChart3, PenTool, ArrowUpRight } from 'lucide-react';

export default function RoleCards({ onSelectRole }) {
  const roles = [
    {
      id: 'swe',
      title: 'Software Engineer',
      desc: 'DSA, system design, coding rounds and more.',
      tags: ['SDE', 'Backend', 'Frontend'],
      icon: Code,
    },
    {
      id: 'pm',
      title: 'Product Manager',
      desc: 'Product sense, case studies, strategy and more.',
      tags: ['Product', 'Strategy', 'Analytics'],
      icon: Briefcase,
    },
    {
      id: 'da',
      title: 'Data Analyst',
      desc: 'SQL, data analysis, case studies and more.',
      tags: ['SQL', 'Analytics', 'Business'],
      icon: BarChart3,
    },
    {
      id: 'ux',
      title: 'UX Designer',
      desc: 'Design thinking, case studies, portfolio discussion and more.',
      tags: ['Design', 'Research', 'Product'],
      icon: PenTool,
    },
  ];

  return (
    <section id="roles" className="section-wrapper" style={{ padding: '9.5rem 0', position: 'relative' }}>
      <div className="container">
        {/* Section Header with "View all roles" link */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: '5.5rem',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}
        >
          <div>
            <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '0.75rem' }}>
              Practice for your next role
            </h2>
            <p className="section-subtitle" style={{ textAlign: 'left', margin: 0, fontSize: '1.05rem', lineHeight: 1.6 }}>
              Choose from a wide range of roles and start practicing with role-specific questions.
            </p>
          </div>

          <button
            onClick={() => onSelectRole('all')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              color: 'var(--text-secondary)',
              background: 'none',
              border: 'none',
              fontSize: '0.88rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'color var(--transition-fast)',
              padding: '0.4rem 0',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-gold)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            <span>View all roles</span>
            <span style={{ fontSize: '1.05rem', lineHeight: 1 }}>→</span>
          </button>
        </div>

        {/* 4 Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '2rem',
          }}
          className="roles-grid"
        >
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <div
                key={role.id}
                onClick={() => onSelectRole(role.title)}
                className="glass-card role-card"
                style={{
                  padding: '2.5rem 2.15rem',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  position: 'relative',
                  minHeight: '315px',
                }}
              >
                {/* Top: Distinctive icon & Upper-right Arrow */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    marginBottom: '1.75rem',
                  }}
                >
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent-gold)',
                    }}
                  >
                    <Icon size={20} />
                  </div>

                  <div
                    className="role-arrow"
                    style={{
                      color: 'var(--text-tertiary)',
                      transition: 'all 0.25s ease',
                      marginTop: '4px',
                    }}
                  >
                    <ArrowUpRight size={18} />
                  </div>
                </div>

                {/* Role Title */}
                <h3
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '1.15rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: '0.6rem',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {role.title}
                </h3>

                {/* Role Description */}
                <p
                  style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.86rem',
                    lineHeight: 1.55,
                    marginBottom: '1.8rem',
                  }}
                >
                  {role.desc}
                </p>

                {/* Skill Tags */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.45rem',
                    marginTop: 'auto',
                  }}
                >
                  {role.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 500,
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                        color: 'var(--text-secondary)',
                        padding: '0.28rem 0.65rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .role-card:hover .role-arrow {
          color: var(--accent-gold);
          transform: translate(2px, -2px);
        }
        @media (max-width: 1024px) {
          .roles-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 580px) {
          .roles-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
