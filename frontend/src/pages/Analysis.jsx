import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import HistoryPage from '../components/HistoryPage';
import InterviewDNAView from '../components/InterviewDNAView';
import { Dna, History } from 'lucide-react';

export default function Analysis({ defaultTab, onStartInterview, onViewReport }) {
  const navigate = useNavigate();
  const location = useLocation();
  const initialTab = defaultTab || (location?.pathname === '/history' ? 'history' : 'dna');
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    } else if (location?.pathname === '/history') {
      setActiveTab('history');
    }
  }, [defaultTab, location?.pathname]);

  return (
    <div
      style={{
        paddingTop: 'var(--nav-height, 76px)',
        backgroundColor: 'var(--bg-base, #090909)',
        minHeight: '100vh',
        color: 'var(--text-primary)',
      }}
    >
      <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '2rem 2.5rem' }}>
        {/* Top Header & Tab Toggle */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: '0 0 0.35rem 0' }}>
              Performance Analytics &amp; DNA
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', margin: 0 }}>
              Track demonstrated competency, historical progression, and target role readiness.
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '0.4rem',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              padding: '0.35rem',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <button
              onClick={() => setActiveTab('dna')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.55rem 1.15rem',
                borderRadius: '8px',
                border: activeTab === 'dna' ? '1px solid rgba(217, 183, 122, 0.35)' : '1px solid transparent',
                backgroundColor: activeTab === 'dna' ? 'rgba(217, 183, 122, 0.15)' : 'transparent',
                color: activeTab === 'dna' ? 'var(--accent-gold)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'dna' ? 600 : 500,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <Dna size={16} />
              <span>Interview DNA</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.55rem 1.15rem',
                borderRadius: '8px',
                border: activeTab === 'history' ? '1px solid rgba(217, 183, 122, 0.35)' : '1px solid transparent',
                backgroundColor: activeTab === 'history' ? 'rgba(217, 183, 122, 0.15)' : 'transparent',
                color: activeTab === 'history' ? 'var(--accent-gold)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'history' ? 600 : 500,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <History size={16} />
              <span>Session History</span>
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'dna' ? (
          <InterviewDNAView onStartInterview={onStartInterview || (() => navigate('/interview'))} />
        ) : (
          <HistoryPage
            onStartInterview={onStartInterview || (() => navigate('/interview'))}
            onViewReport={onViewReport}
            onBackToOverview={() => navigate('/dashboard')}
            onNavigateToCompanies={() => navigate('/companies')}
          />
        )}
      </div>
    </div>
  );
}
