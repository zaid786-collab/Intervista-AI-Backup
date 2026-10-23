import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CompaniesSection from '../components/CompaniesSection';
import companyData from './companyData';

export default function Companies({ onStartInterview }) {
  const navigate = useNavigate();
  const [activeCompany, setActiveCompany] = useState('google');

  const handleStart = (roleOrCompany) => {
    if (onStartInterview) {
      onStartInterview(roleOrCompany);
    } else {
      navigate('/interview');
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="companies-page-wrapper" style={{ minHeight: '80vh', paddingTop: 'var(--nav-height, 76px)', backgroundColor: 'var(--bg-base, #090909)' }}>
      <CompaniesSection
        activeCompanyId={activeCompany}
        onCompanyChange={setActiveCompany}
        onStartInterview={handleStart}
        onBackToHome={handleBackToHome}
      />
    </div>
  );
}