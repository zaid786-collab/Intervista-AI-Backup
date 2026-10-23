import React, { useState } from 'react';
import {
  Check,
  Sparkles,
  Zap,
  ShieldCheck,
  ArrowRight,
  ChevronDown,
  Lock,
  Award,
  Tag,
} from 'lucide-react';
import CheckoutModal from './CheckoutModal';

const PLANS_DATA = [
  {
    id: 'starter',
    name: 'Free Starter',
    badge: null,
    tagline: 'Essential drills for exploring voice mock interviews.',
    monthlyPrice: 0,
    yearlyPrice: 0,
    monthlyDisplay: '₹0',
    yearlyDisplay: '₹0',
    periodLabel: 'forever free',
    isPopular: false,
    ctaText: 'Start Free Practice',
    features: [
      '2 AI Voice Mocks / month',
      'Standard question library',
      'Instant session scorecard',
      'Web voice speech input',
    ],
  },
  {
    id: 'pro',
    name: 'Pro Candidate',
    badge: 'MOST POPULAR · BEST VALUE',
    tagline: 'Everything to crack Tier-1, FAANG, and top global startups.',
    monthlyPrice: 999,
    yearlyPrice: 8990,
    monthlyDisplay: '₹999',
    yearlyDisplay: '₹749',
    periodLabel: 'per month',
    isPopular: true,
    ctaText: 'Upgrade to Pro',
    features: [
      'Unlimited Voice Mock Interviews',
      'Adaptive follow-ups based on your answers',
      'Company Packs (Google, Amazon, Meta)',
      'Speech Analytics (Pacing, filler words)',
      'Downloadable PDF Performance Reports',
    ],
  },
  {
    id: 'elite',
    name: 'Elite Executive',
    badge: 'VIP CAREER EDGE',
    tagline: 'Masterclass prep for Senior, Lead & Executive roles.',
    monthlyPrice: 2499,
    yearlyPrice: 22490,
    monthlyDisplay: '₹2,499',
    yearlyDisplay: '₹1,875',
    periodLabel: 'per month',
    isPopular: false,
    ctaText: 'Get Elite Access',
    features: [
      'Everything in Pro Candidate',
      '1-on-1 Monthly Senior Mentor review',
      'Custom Job Description (JD) Matcher',
      'System Design & Screen-share mocks',
      '24/7 Priority VIP Concierge',
    ],
  },
];

const FAQS = [
  {
    q: 'How does UPI payment & instant verification work?',
    a: 'Simply scan the QR code or send to 9310664653@ptsbi via Google Pay, PhonePe, Paytm, or BHIM. Enter your 12-digit UTR/UPI Ref number from your receipt to instantly verify and activate your plan.',
  },
  {
    q: 'Can I cancel or switch my plan anytime?',
    a: 'Yes, absolutely. You can cancel or upgrade your subscription anytime. If you cancel, your access stays active until the end of your billing cycle.',
  },
  {
    q: 'Is my audio and interview video kept private?',
    a: 'Yes. We strictly adhere to privacy-by-design. Your audio is processed in encrypted memory solely for generating your report. We never sell or share candidate data.',
  },
  {
    q: 'How realistic are the AI mock interview questions?',
    a: 'Our questions and follow-up prompts are modeled on real interview loops from Google, Amazon, Microsoft, Meta, Uber, and top YC startups.',
  },
];

export default function PricingSection({ onStartInterview }) {
  const [isYearly, setIsYearly] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState(null);

  const handleSelectPlan = (plan) => {
    if (plan.id === 'starter') {
      if (onStartInterview) onStartInterview();
    } else {
      setSelectedPlanForCheckout(plan);
      setCheckoutModalOpen(true);
    }
  };

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <section
      id="pricing"
      style={{
        paddingTop: '2rem',
        paddingBottom: '5rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '1160px' }}>
        {/* Promotional Coupon Strip */}
        <div
          onClick={() => {
            setSelectedPlanForCheckout(PLANS_DATA[1]);
            setCheckoutModalOpen(true);
          }}
          style={{
            backgroundColor: 'rgba(217, 183, 122, 0.08)',
            border: '1px solid rgba(217, 183, 122, 0.3)',
            borderRadius: '9999px',
            padding: '8px 18px',
            margin: '0 auto 2.5rem auto',
            maxWidth: '560px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
          }}
          className="coupon-pill-glow"
        >
          <Tag size={15} color="var(--accent-gold)" />
          <span style={{ fontSize: '0.84rem', color: 'var(--text-primary)' }}>
            Use code <strong style={{ color: 'var(--accent-gold)', letterSpacing: '0.04em' }}>NEW10</strong> at checkout for <strong style={{ color: '#4ADE80' }}>25% OFF</strong> any plan!
          </span>
          <ArrowRight size={14} color="var(--accent-gold)" />
        </div>

        {/* Billing Switcher */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#121212',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '9999px',
              padding: '5px',
            }}
          >
            <button
              onClick={() => setIsYearly(false)}
              style={{
                background: !isYearly ? 'var(--text-primary)' : 'transparent',
                color: !isYearly ? '#0C0C0C' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '9999px',
                padding: '0.45rem 1.25rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              Monthly
            </button>

            <button
              onClick={() => setIsYearly(true)}
              style={{
                background: isYearly ? 'var(--text-primary)' : 'transparent',
                color: isYearly ? '#0C0C0C' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '9999px',
                padding: '0.45rem 1.25rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>Annual</span>
              <span
                style={{
                  backgroundColor: isYearly ? 'var(--accent-gold)' : 'rgba(217, 183, 122, 0.2)',
                  color: isYearly ? '#090909' : 'var(--accent-gold)',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '9999px',
                }}
              >
                SAVE 25%
              </span>
            </button>
          </div>
        </div>

        {/* 3 Animated Pricing Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1.75rem',
            alignItems: 'stretch',
            marginBottom: '4rem',
          }}
          className="pricing-cards-columns"
        >
          {PLANS_DATA.map((plan) => {
            const isPop = plan.isPopular;
            const priceDisplay = isYearly ? plan.yearlyDisplay : plan.monthlyDisplay;

            return (
              <div
                key={plan.id}
                className={`classy-pricing-column ${isPop ? 'pop-column' : ''}`}
                style={{
                  backgroundColor: isPop ? '#131313' : '#0F0F0F',
                  borderRadius: '24px',
                  padding: '2.4rem 2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  border: isPop ? '1px solid transparent' : '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                {/* Popular ribbon */}
                {plan.badge && (
                  <div className="popular-badge-pill">
                    <Sparkles size={11} fill="#090909" />
                    <span>{plan.badge}</span>
                  </div>
                )}

                {/* Plan Title & Tagline */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3
                    style={{
                      fontSize: '1.4rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      marginBottom: '0.35rem',
                    }}
                  >
                    {plan.name}
                  </h3>
                  <p
                    style={{
                      color: 'var(--text-secondary)',
                      fontSize: '0.84rem',
                      lineHeight: 1.45,
                      minHeight: '38px',
                    }}
                  >
                    {plan.tagline}
                  </p>
                </div>

                {/* Price */}
                <div style={{ marginBottom: '1.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                    <span
                      style={{
                        fontSize: '3rem',
                        fontWeight: 700,
                        color: isPop ? 'var(--accent-gold)' : 'var(--text-primary)',
                        lineHeight: 1,
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {priceDisplay}
                    </span>
                    <span style={{ color: 'var(--text-tertiary)', fontSize: '0.86rem' }}>
                      {plan.monthlyPrice === 0 ? '' : isYearly ? '/ month (billed yearly)' : '/ month'}
                    </span>
                  </div>
                  {isYearly && plan.monthlyPrice > 0 && (
                    <div style={{ fontSize: '0.78rem', color: '#4ADE80', marginTop: '6px' }}>
                      Billed ₹{plan.yearlyPrice.toLocaleString('en-IN')}/year
                    </div>
                  )}
                  {plan.monthlyPrice === 0 && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: '6px' }}>
                      Free forever · No credit card
                    </div>
                  )}
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handleSelectPlan(plan)}
                  className={isPop ? 'btn-primary' : 'btn-secondary'}
                  style={{
                    width: '100%',
                    padding: '0.82rem',
                    fontSize: '0.94rem',
                    fontWeight: 600,
                    borderRadius: '12px',
                    backgroundColor: isPop ? 'var(--accent-gold)' : 'rgba(255, 255, 255, 0.05)',
                    color: isPop ? '#090909' : 'var(--text-primary)',
                    borderColor: isPop ? 'var(--accent-gold)' : 'rgba(255, 255, 255, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginBottom: '1.8rem',
                    cursor: 'pointer',
                    boxShadow: isPop ? '0 6px 25px rgba(217, 183, 122, 0.35)' : 'none',
                    transition: 'all 0.25s ease',
                  }}
                >
                  <span>{plan.ctaText}</span>
                  <ArrowRight size={16} />
                </button>

                {/* Concise Feature List */}
                <div style={{ flex: 1, borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '1.25rem' }}>
                  <div
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      color: 'var(--text-tertiary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      marginBottom: '0.9rem',
                    }}
                  >
                    Features included:
                  </div>

                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {plan.features.map((feat, idx) => (
                      <li
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          fontSize: '0.85rem',
                          color: 'var(--text-secondary)',
                          lineHeight: 1.4,
                        }}
                      >
                        <div
                          style={{
                            color: isPop ? 'var(--accent-gold)' : '#22C55E',
                            flexShrink: 0,
                          }}
                        >
                          <Check size={16} strokeWidth={2.5} />
                        </div>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* 4 Minimal Trust Badges */}
        <div
          style={{
            backgroundColor: '#0E0E0E',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '18px',
            padding: '1.6rem 2rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1.5rem',
            marginBottom: '4rem',
          }}
          className="trust-badges-strip"
        >
          {[
            { icon: ShieldCheck, title: '7-Day Guarantee', desc: '100% refund if not satisfied.' },
            { icon: Zap, title: 'Instant Activation', desc: 'Unlimited rounds in 30 seconds.' },
            { icon: Lock, title: 'Audio Privacy', desc: 'Zero recording retention.' },
            { icon: Award, title: '89% Placement', desc: 'Candidates clear target rounds.' },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(217, 183, 122, 0.1)',
                    border: '1px solid rgba(217, 183, 122, 0.22)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-gold)',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={17} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
                    {item.title}
                  </h4>
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ Accordion */}
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.8rem' }}>
            <span className="eyebrow-tag" style={{ color: 'var(--accent-gold)' }}>
              PAYMENT & MEMBERSHIP
            </span>
            <h3
              className="serif-heading"
              style={{
                fontSize: '1.75rem',
                color: 'var(--text-primary)',
                marginTop: '0.4rem',
              }}
            >
              Frequently Asked <span className="gold-italic">Questions</span>
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {FAQS.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  style={{
                    backgroundColor: '#111111',
                    border: isOpen ? '1px solid rgba(217, 183, 122, 0.35)' : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    transition: 'border-color 0.2s ease',
                  }}
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    style={{
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      padding: '1.1rem 1.4rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      textAlign: 'left',
                      color: isOpen ? 'var(--accent-gold)' : 'var(--text-primary)',
                      fontSize: '0.92rem',
                      fontWeight: 600,
                    }}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={18}
                      style={{
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                        flexShrink: 0,
                        marginLeft: '1rem',
                        color: isOpen ? 'var(--accent-gold)' : 'var(--text-tertiary)',
                      }}
                    />
                  </button>
                  {isOpen && (
                    <div
                      style={{
                        padding: '0 1.4rem 1.15rem 1.4rem',
                        color: 'var(--text-secondary)',
                        fontSize: '0.86rem',
                        lineHeight: 1.55,
                        borderTop: '1px solid rgba(255, 255, 255, 0.04)',
                        paddingTop: '0.75rem',
                      }}
                    >
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Interactive Checkout Modal (UPI QR Only with UTR verification) */}
      <CheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        plan={selectedPlanForCheckout}
        isYearly={isYearly}
        onStartInterview={onStartInterview}
      />

      {/* Classy Animated Styles */}
      <style>{`
        .classy-pricing-column {
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s ease, border-color 0.35s ease;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
        }

        .classy-pricing-column:hover {
          transform: translateY(-5px);
          border-color: rgba(217, 183, 122, 0.45) !important;
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.7);
        }

        /* Animated Shimmering Border for Popular Pro column */
        .pop-column {
          position: relative;
          background: linear-gradient(#131313, #131313) padding-box,
                      linear-gradient(135deg, rgba(217, 183, 122, 0.8), rgba(255, 255, 255, 0.1), rgba(217, 183, 122, 0.8)) border-box !important;
          border: 1.5px solid transparent !important;
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.7), 0 0 30px rgba(217, 183, 122, 0.15) !important;
        }

        .pop-column:hover {
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.85), 0 0 45px rgba(217, 183, 122, 0.28) !important;
        }

        .popular-badge-pill {
          position: absolute;
          top: -13px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #D9B77A, #EAD6AF);
          color: #090909;
          padding: 4px 14px;
          border-radius: 9999px;
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 5px;
          box-shadow: 0 4px 15px rgba(217, 183, 122, 0.45);
          white-space: nowrap;
        }

        .coupon-pill-glow:hover {
          background-color: rgba(217, 183, 122, 0.16) !important;
          border-color: var(--accent-gold) !important;
          transform: scale(1.02);
        }

        @media (max-width: 960px) {
          .pricing-cards-columns {
            grid-template-columns: 1fr !important;
            gap: 2.2rem !important;
          }
          .trust-badges-strip {
            grid-template-columns: 1fr 1fr !important;
          }
        }

        @media (max-width: 580px) {
          .trust-badges-strip {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
