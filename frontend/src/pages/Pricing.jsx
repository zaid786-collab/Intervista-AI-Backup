import React from 'react';
import { useNavigate } from 'react-router-dom';
import PlansPage from '../components/PlansPage';

export default function Pricing({ onStartInterview }) {
  const navigate = useNavigate();

  return (
    <PlansPage
      onStartInterview={onStartInterview || (() => navigate('/interview'))}
      onBackToHome={() => navigate('/')}
    />
  );
}