import React, { useState } from 'react';

export default function CompanyLogos({ onSelectCompany }) {
  const [hovered, setHovered] = useState(null);

  const handleClickCompany = (companyId) => {
    if (onSelectCompany) {
      onSelectCompany(companyId);
    }
    const el = document.getElementById('companies');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="trusted-companies"
      style={{
        paddingTop: '5rem',
        paddingBottom: '7.5rem',
        position: 'relative',
      }}
    >
      <div className="container">
        {/* Thin divider with centered caption */}
        <div
          style={{
            position: 'relative',
            textAlign: 'center',
            marginBottom: '3.5rem',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              right: 0,
              height: '1px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              zIndex: 0,
            }}
          />
          <span
            style={{
              position: 'relative',
              backgroundColor: 'var(--bg-base)',
              padding: '0 1.25rem',
              color: 'var(--text-tertiary)',
              fontSize: '0.68rem',
              fontWeight: 600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              zIndex: 1,
            }}
          >
            TRUSTED BY LEADING COMPANIES
          </span>
        </div>

        {/* Logos Strip with Brand Hover Colors */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '2.5rem',
            flexWrap: 'wrap',
          }}
          className="logos-container"
        >
          {/* 1. Google */}
          <div
            className="company-logo-item"
            onClick={() => handleClickCompany('google')}
            onMouseEnter={() => setHovered('google')}
            onMouseLeave={() => setHovered(null)}
            title="Google (Click to view preparation guide)"
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              transform: hovered === 'google' ? 'translateY(-2px) scale(1.04)' : 'none',
              transition: 'transform 0.25s ease',
            }}
          >
            <svg height="24" viewBox="0 0 272 92">
              {/* G */}
              <path
                d="M35.29 41.41V32H67c.31 1.64.47 3.58.47 5.68 0 7.06-1.93 15.79-8.15 22.01-6.05 6.3-13.78 9.66-24.02 9.66C16.32 69.35.36 53.89.36 34.91.36 15.93 16.32.47 35.3.47c10.42 0 17.72 4.03 23.35 9.41l-6.55 6.55c-4.03-3.78-9.49-6.72-16.8-6.72-13.86 0-24.7 11.17-24.7 25.2s10.84 25.2 24.7 25.2c8.99 0 14.11-3.61 17.39-6.89 2.69-2.68 4.45-6.47 5.12-11.84H35.29z"
                fill={hovered === 'google' ? '#4285F4' : '#888888'}
                style={{ transition: 'fill 0.25s ease' }}
              />
              {/* o */}
              <path
                d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"
                fill={hovered === 'google' ? '#EA4335' : '#888888'}
                style={{ transition: 'fill 0.25s ease' }}
              />
              {/* o */}
              <path
                d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"
                fill={hovered === 'google' ? '#FBBC05' : '#888888'}
                style={{ transition: 'fill 0.25s ease' }}
              />
              {/* g */}
              <path
                d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.66-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.51 11.84-13v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.62h9.25zm-8.86 21.01c0-7.73-5.21-13.44-11.93-13.44-6.8 0-12.51 5.71-12.51 13.44 0 7.64 5.71 13.36 12.51 13.36 6.72 0 11.93-5.72 11.93-13.36z"
                fill={hovered === 'google' ? '#4285F4' : '#888888'}
                style={{ transition: 'fill 0.25s ease' }}
              />
              {/* l */}
              <path
                d="M225 3v65.23h-9.5V3h9.5z"
                fill={hovered === 'google' ? '#34A853' : '#888888'}
                style={{ transition: 'fill 0.25s ease' }}
              />
              {/* e */}
              <path
                d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.98 14.11l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.14zm-23.27-7.98l19.82-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.95 0-11.84 4.37-11.59 12.93z"
                fill={hovered === 'google' ? '#EA4335' : '#888888'}
                style={{ transition: 'fill 0.25s ease' }}
              />
            </svg>
          </div>

          {/* 2. Microsoft */}
          <div
            className="company-logo-item"
            onClick={() => handleClickCompany('microsoft')}
            onMouseEnter={() => setHovered('microsoft')}
            onMouseLeave={() => setHovered(null)}
            title="Microsoft (Click to view preparation guide)"
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transform: hovered === 'microsoft' ? 'translateY(-2px) scale(1.04)' : 'none',
              transition: 'transform 0.25s ease',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 21 21">
              <rect x="1" y="1" width="9" height="9" fill={hovered === 'microsoft' ? '#F25022' : '#888888'} style={{ transition: 'fill 0.25s ease' }} />
              <rect x="11" y="1" width="9" height="9" fill={hovered === 'microsoft' ? '#7FBA00' : '#888888'} style={{ transition: 'fill 0.25s ease' }} />
              <rect x="1" y="11" width="9" height="9" fill={hovered === 'microsoft' ? '#00A4EF' : '#888888'} style={{ transition: 'fill 0.25s ease' }} />
              <rect x="11" y="11" width="9" height="9" fill={hovered === 'microsoft' ? '#FFB900' : '#888888'} style={{ transition: 'fill 0.25s ease' }} />
            </svg>
            <span
              style={{
                fontWeight: 600,
                fontSize: '1.05rem',
                letterSpacing: '-0.02em',
                color: hovered === 'microsoft' ? '#FFFFFF' : '#888888',
                transition: 'color 0.25s ease',
              }}
            >
              Microsoft
            </span>
          </div>

          {/* 3. Amazon */}
          <div
            className="company-logo-item"
            onClick={() => handleClickCompany('amazon')}
            onMouseEnter={() => setHovered('amazon')}
            onMouseLeave={() => setHovered(null)}
            title="Amazon (Click to view preparation guide)"
            style={{
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
              transform: hovered === 'amazon' ? 'translateY(-2px) scale(1.04)' : 'none',
              transition: 'transform 0.25s ease',
            }}
          >
            <span
              style={{
                fontWeight: 700,
                fontSize: '1.25rem',
                letterSpacing: '-0.05em',
                color: hovered === 'amazon' ? '#FFFFFF' : '#888888',
                transition: 'color 0.25s ease',
                lineHeight: 1,
              }}
            >
              amazon
            </span>
            <svg width="42" height="12" viewBox="0 0 100 28" fill="none" style={{ marginTop: '2px' }}>
              <path
                d="M5 12 C 35 28, 65 28, 95 10"
                stroke={hovered === 'amazon' ? '#FF9900' : '#888888'}
                strokeWidth="4"
                strokeLinecap="round"
                style={{ transition: 'stroke 0.25s ease' }}
              />
              <path
                d="M88 6 L 96 11 L 91 19 Z"
                fill={hovered === 'amazon' ? '#FF9900' : '#888888'}
                style={{ transition: 'fill 0.25s ease' }}
              />
            </svg>
          </div>

          {/* 4. Apple */}
          <div
            className="company-logo-item"
            onClick={() => handleClickCompany('apple')}
            onMouseEnter={() => setHovered('apple')}
            onMouseLeave={() => setHovered(null)}
            title="Apple (Click to view preparation guide)"
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              transform: hovered === 'apple' ? 'translateY(-2px) scale(1.04)' : 'none',
              transition: 'transform 0.25s ease',
            }}
          >
            <svg
              width="20"
              height="24"
              viewBox="0 0 170 170"
              fill={hovered === 'apple' ? '#FFFFFF' : '#888888'}
              style={{
                transition: 'fill 0.25s ease, filter 0.25s ease',
                filter: hovered === 'apple' ? 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.75))' : 'none',
              }}
            >
              <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.05-7.66-7.85-11.87-14.39-5.76-8.91-10.28-18.78-13.56-29.62-3.28-10.83-4.92-21.41-4.92-31.74 0-13.88 3.53-25.5 10.59-34.85 7.06-9.35 16.03-14.19 26.91-14.52 4.46 0 9.43 1.14 14.9 3.42 5.48 2.29 9.38 3.48 11.72 3.58 1.95 0 6.09-1.28 12.4-3.83 6.31-2.56 11.64-3.68 15.99-3.37 12.63.87 22.53 5.76 29.7 14.67-11.09 6.74-16.53 16.08-16.32 28.02.22 9.35 3.81 17.17 10.77 23.47 4.13 3.8 8.91 6.52 14.33 8.15-2.28 6.63-4.99 13.25-8.13 19.88zM119.22 31.84c0-7.28 2.66-14.13 7.99-20.54 5.33-6.41 12.01-10.43 20.03-12.07.22 1.09.33 2.07.33 2.94 0 7.28-2.83 14.29-8.48 21.03-5.65 6.74-12.44 10.76-20.37 12.07-.33-1.09-.5-2.23-.5-3.43z" />
            </svg>
          </div>

          {/* 5. Meta */}
          <div
            className="company-logo-item"
            onClick={() => handleClickCompany('meta')}
            onMouseEnter={() => setHovered('meta')}
            onMouseLeave={() => setHovered(null)}
            title="Meta (Click to view preparation guide)"
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transform: hovered === 'meta' ? 'translateY(-2px) scale(1.04)' : 'none',
              transition: 'transform 0.25s ease',
            }}
          >
            <svg
              width="24"
              height="16"
              viewBox="0 0 24 16"
              fill={hovered === 'meta' ? '#0081FB' : '#888888'}
              style={{
                transition: 'fill 0.25s ease, filter 0.25s ease',
                filter: hovered === 'meta' ? 'drop-shadow(0 0 8px rgba(0, 129, 251, 0.5))' : 'none',
              }}
            >
              <path d="M16.64 0C14.71 0 13.06.91 12 2.34 10.94.91 9.29 0 7.36 0 3.29 0 0 3.58 0 8s3.29 8 7.36 8c1.93 0 3.58-.91 4.64-2.34C13.06 15.09 14.71 16 16.64 16c4.07 0 7.36-3.58 7.36-8s-3.29-8-7.36-8zm0 13.28c-2.73 0-4.94-2.37-4.94-5.28s2.21-5.28 4.94-5.28 4.94 2.37 4.94 5.28-2.21 5.28-4.94 5.28zM7.36 13.28C4.63 13.28 2.42 10.91 2.42 8s2.21-5.28 4.94-5.28 4.94 2.37 4.94 5.28-2.21 5.28-4.94 5.28z" />
            </svg>
            <span
              style={{
                fontWeight: 700,
                fontSize: '1.05rem',
                letterSpacing: '-0.02em',
                color: hovered === 'meta' ? '#0081FB' : '#888888',
                transition: 'color 0.25s ease',
              }}
            >
              Meta
            </span>
          </div>

          {/* 6. Tesla */}
          <div
            className="company-logo-item"
            onMouseEnter={() => setHovered('tesla')}
            onMouseLeave={() => setHovered(null)}
            title="Tesla"
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              transform: hovered === 'tesla' ? 'translateY(-2px) scale(1.04)' : 'none',
              transition: 'transform 0.25s ease',
            }}
          >
            <span
              style={{
                fontWeight: 800,
                fontSize: '1.1rem',
                letterSpacing: '0.24em',
                textTransform: 'uppercase',
                color: hovered === 'tesla' ? '#E82127' : '#888888',
                textShadow: hovered === 'tesla' ? '0 0 14px rgba(232, 33, 39, 0.6)' : 'none',
                transition: 'color 0.25s ease, text-shadow 0.25s ease',
              }}
            >
              TESLA
            </span>
          </div>

          {/* 7. Adobe */}
          <div
            className="company-logo-item"
            onClick={() => handleClickCompany('adobe')}
            onMouseEnter={() => setHovered('adobe')}
            onMouseLeave={() => setHovered(null)}
            title="Adobe (Click to view preparation guide)"
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transform: hovered === 'adobe' ? 'translateY(-2px) scale(1.04)' : 'none',
              transition: 'transform 0.25s ease',
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill={hovered === 'adobe' ? '#FF0000' : '#888888'}
              style={{
                transition: 'fill 0.25s ease, filter 0.25s ease',
                filter: hovered === 'adobe' ? 'drop-shadow(0 0 8px rgba(255, 0, 0, 0.5))' : 'none',
              }}
            >
              <path d="M13.96 4.39h5.81L16.27 19.6h-5.81l3.5-15.21zm-3.92 0H4.23l3.5 15.21h5.81L10.04 4.39zM12 9.94l2.12 9.66h-4.24L12 9.94z" />
            </svg>
            <span
              style={{
                fontWeight: 700,
                fontSize: '1.05rem',
                letterSpacing: '0.02em',
                color: hovered === 'adobe' ? '#FF0000' : '#888888',
                transition: 'color 0.25s ease',
              }}
            >
              Adobe
            </span>
          </div>

          {/* 8. Shopify */}
          <div
            className="company-logo-item"
            onMouseEnter={() => setHovered('shopify')}
            onMouseLeave={() => setHovered(null)}
            title="Shopify"
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transform: hovered === 'shopify' ? 'translateY(-2px) scale(1.04)' : 'none',
              transition: 'transform 0.25s ease',
            }}
          >
            <svg
              width="18"
              height="20"
              viewBox="0 0 24 27"
              fill={hovered === 'shopify' ? '#95BF47' : '#888888'}
              style={{
                transition: 'fill 0.25s ease, filter 0.25s ease',
                filter: hovered === 'shopify' ? 'drop-shadow(0 0 8px rgba(149, 191, 71, 0.55))' : 'none',
              }}
            >
              <path d="M19.98 5.48c-.04-.26-.24-.46-.5-.49-.26-.03-2.73-.24-2.73-.24s-1.81-1.81-2.02-2.02c-.21-.21-.63-.16-.78-.11l-1.07.36c-.46-1.39-1.29-2.61-2.67-2.92-.31-.07-.63-.07-.94 0-1.8.44-2.8 2.1-3.23 3.65l-1.95.65c-.42.14-.44.2-.49.56L.01 22.84c-.03.22.06.44.22.58.16.14.38.19.59.13l13.16-3.8 9.98-2.31c.25-.06.44-.27.46-.53l1.56-11.43zM10.74 3.7c.36-.88 1.15-1.92 2.37-1.92.17 0 .34.03.5.09.84.28 1.35 1.15 1.64 2.22l-4.51 1.5c.16-.71.4-1.35.77-1.89h-.77z" />
            </svg>
            <span
              style={{
                fontWeight: 600,
                fontSize: '1.05rem',
                letterSpacing: '-0.02em',
                color: hovered === 'shopify' ? '#95BF47' : '#888888',
                transition: 'color 0.25s ease',
              }}
            >
              shopify
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .logos-container {
            justify-content: center !important;
            gap: 2rem !important;
          }
        }
      `}</style>
    </section>
  );
}
