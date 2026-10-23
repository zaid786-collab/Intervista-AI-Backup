import React from 'react';
import { useNavigate } from 'react-router-dom';
import HistoryPage from '../components/HistoryPage';

export default function Analysis({ onStartInterview, onViewReport }) {
  const navigate = useNavigate();

  return (
    <div style={{ paddingTop: 'var(--nav-height, 76px)', backgroundColor: 'var(--bg-base, #090909)', minHeight: '100vh' }}>
      <HistoryPage
        onStartInterview={onStartInterview || (() => navigate('/interview'))}
        onViewReport={onViewReport}
        onBackToHome={() => navigate('/dashboard')}
      />
    </div>
  );
}
