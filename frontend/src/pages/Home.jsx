import React from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';
import CompanyLogos from '../components/CompanyLogos';
import HowItWorks from '../components/HowItWorks';
import RoleCards from '../components/RoleCards';
import ReviewsSection from '../components/ReviewsSection';
import CtaBanner from '../components/CtaBanner';

export default function Home({
  onStartInterview,
  onOpenDemo,
  onOpenContact,
  onSelectCompany,
}) {
  const navigate = useNavigate();

  const handleStart = (role) => {
    if (onStartInterview) {
      onStartInterview(role);
    } else {
      navigate('/interview');
    }
  };

  const handleSelectCompany = (companyId) => {
    if (onSelectCompany) {
      onSelectCompany(companyId);
    } else {
      navigate('/companies');
    }
  };

  const handleNavigate = (page, anchorId) => {
    if (anchorId) {
      const el = document.getElementById(anchorId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    if (page === 'dashboard') navigate('/dashboard');
    else if (page === 'companies') navigate('/companies');
    else if (page === 'plans' || page === 'pricing') navigate('/plans');
    else if (page === 'resources') navigate('/resources');
    else if (page === 'profile') navigate('/profile');
    else if (page === 'admin') navigate('/admin');
    else navigate('/');
  };

  return (
    <div className="home-page">
      <main>
        {/* 1. Hero Section with dynamic 3D card swap/laptop */}
        <Hero
          onStartInterview={handleStart}
          onWatchDemo={onOpenDemo}
          onNavigate={handleNavigate}
        />

        {/* 2. Trusted Companies Marquee */}
        <CompanyLogos onSelectCompany={handleSelectCompany} />

        {/* 3. Architectural Pipeline / How It Works */}
        <HowItWorks />

        {/* 4. Practice for Your Next Role */}
        <RoleCards onSelectRole={handleStart} />

        {/* 5. Infinite Review Loop / Testimonials */}
        <ReviewsSection />

        {/* 6. Final CTA Banner */}
        <CtaBanner onStartInterview={handleStart} />
      </main>
    </div>
  );
}