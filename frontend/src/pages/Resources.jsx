import React from 'react';
import { useNavigate } from 'react-router-dom';
import CareerPrepDSAPage from '../components/CareerPrepDSAPage';

export default function Resources({ onStartInterview }) {
  const navigate = useNavigate();

  return (
    <div style={{ paddingTop: 'var(--nav-height, 76px)', backgroundColor: 'var(--bg-base, #090909)', minHeight: '100vh' }}>
      <CareerPrepDSAPage
        onStartInterview={onStartInterview || (() => navigate('/interview'))}
        onBackToHome={() => navigate('/dashboard')}
      />
    </div>
  );
}