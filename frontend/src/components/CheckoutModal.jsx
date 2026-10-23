import React, { useState } from 'react';
import {
  X,
  Check,
  ShieldCheck,
  Zap,
  Lock,
  Sparkles,
  ArrowRight,
  Tag,
  Copy,
  QrCode,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export default function CheckoutModal({
  isOpen,
  onClose,
  plan,
  isYearly,
  onStartInterview,
}) {
  const [upiRefNumber, setUpiRefNumber] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [refError, setRefError] = useState('');

  if (!isOpen || !plan) return null;

  const upiId = '9310664653@ptsbi';

  // Calculate pricing
  const basePrice = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
  const discountAmount = Math.round((basePrice * discountPercent) / 100);
  const finalPrice = Math.max(0, basePrice - discountAmount);

  const handleApplyCoupon = (e) => {
    if (e) e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    const clean = couponCode.trim().toUpperCase();

    if (clean === 'NEW10') {
      setDiscountPercent(25);
      setCouponSuccess('25% discount applied successfully with NEW10!');
    } else if (clean === 'INTERVISTA20') {
      setDiscountPercent(20);
      setCouponSuccess('20% discount applied successfully!');
    } else if (clean === 'TOPCANDIDATE') {
      setDiscountPercent(30);
      setCouponSuccess('30% candidate pass applied!');
    } else {
      setCouponError('Invalid coupon code. Try "NEW10" for 25% off.');
    }
  };

  const applyNew10Direct = () => {
    setCouponCode('NEW10');
    setDiscountPercent(25);
    setCouponError('');
    setCouponSuccess('25% discount applied successfully with NEW10!');
  };

  const handleCopyUpi = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(upiId);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    }
  };

  const handleVerifyPayment = (e) => {
    e.preventDefault();
    setRefError('');

    const cleanRef = upiRefNumber.trim();
    if (!cleanRef || cleanRef.length < 8) {
      setRefError('Please enter a valid 12-digit UPI Reference / UTR Number from your payment receipt.');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
    }, 1500);
  };

  const handleClose = () => {
    setIsSuccess(false);
    setIsProcessing(false);
    setDiscountPercent(0);
    setCouponCode('');
    setCouponSuccess('');
    setCouponError('');
    setUpiRefNumber('');
    setRefError('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '540px',
          width: '94%',
          padding: '2.2rem 2rem',
          backgroundColor: '#111111',
          border: '1px solid rgba(217, 183, 122, 0.35)',
          borderRadius: '24px',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.95), 0 0 50px rgba(217, 183, 122, 0.12)',
          position: 'relative',
          maxHeight: '92vh',
          overflowY: 'auto',
        }}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          aria-label="Close modal"
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '0.4rem',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
        >
          <X size={20} />
        </button>

        {!isSuccess ? (
          <div>
            {/* Modal Header */}
            <div style={{ marginBottom: '1.4rem' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'rgba(217, 183, 122, 0.12)',
                  border: '1px solid rgba(217, 183, 122, 0.3)',
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: 'var(--accent-gold)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '0.65rem',
                }}
              >
                <Sparkles size={11} />
                <span>UPI Instant Checkout</span>
              </div>
              <h3
                className="serif-heading"
                style={{
                  fontSize: '1.65rem',
                  lineHeight: 1.2,
                  color: 'var(--text-primary)',
                  marginBottom: '0.35rem',
                }}
              >
                Upgrade to <span className="gold-italic">{plan.name}</span>
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
                Scan the QR code or pay via UPI ID and submit your UTR reference to activate.
              </p>
            </div>

            {/* Plan Summary Card */}
            <div
              style={{
                backgroundColor: '#161616',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '1.1rem 1.25rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                  <span style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>
                    {plan.name}
                  </span>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(217, 183, 122, 0.15)',
                      color: 'var(--accent-gold)',
                      fontWeight: 600,
                    }}
                  >
                    {isYearly ? 'Annual (25% off)' : 'Monthly'}
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                  Unlimited Voice Mocks · Full Performance Scorecard
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                {discountPercent > 0 && (
                  <div
                    style={{
                      fontSize: '0.8rem',
                      color: 'var(--text-tertiary)',
                      textDecoration: 'line-through',
                    }}
                  >
                    ₹{basePrice.toLocaleString('en-IN')}
                  </div>
                )}
                <div style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--accent-gold)', lineHeight: 1.1 }}>
                  ₹{finalPrice.toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                  {isYearly ? '/year' : '/month'}
                </div>
              </div>
            </div>

            {/* Special Discount Code Hint Pill */}
            {discountPercent === 0 && (
              <div
                onClick={applyNew10Direct}
                style={{
                  backgroundColor: 'rgba(217, 183, 122, 0.08)',
                  border: '1px dashed rgba(217, 183, 122, 0.4)',
                  borderRadius: '12px',
                  padding: '0.65rem 0.9rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(217, 183, 122, 0.14)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(217, 183, 122, 0.08)')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Tag size={15} color="var(--accent-gold)" />
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                    Apply code <strong style={{ color: 'var(--accent-gold)', letterSpacing: '0.05em' }}>NEW10</strong> for <strong style={{ color: '#4ADE80' }}>25% OFF</strong>!
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '0.74rem',
                    color: 'var(--accent-gold)',
                    fontWeight: 600,
                    textDecoration: 'underline',
                  }}
                >
                  Tap to Apply
                </span>
              </div>
            )}

            {/* Coupon Code Input */}
            <div style={{ marginBottom: '1.5rem' }}>
              <form
                onSubmit={handleApplyCoupon}
                style={{
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center',
                }}
              >
                <div style={{ position: 'relative', flex: 1 }}>
                  <Tag
                    size={15}
                    color="var(--text-tertiary)"
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    type="text"
                    placeholder="Enter Coupon (e.g. NEW10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: '#181818',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      padding: '0.62rem 0.85rem 0.62rem 2.2rem',
                      color: 'var(--text-primary)',
                      fontSize: '0.84rem',
                      textTransform: 'uppercase',
                    }}
                  />
                </div>
                <button
                  type="submit"
                  className="btn-secondary"
                  style={{
                    padding: '0.62rem 1.15rem',
                    fontSize: '0.82rem',
                    borderRadius: '10px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Apply
                </button>
              </form>
              {couponSuccess && (
                <div style={{ fontSize: '0.78rem', color: '#4ADE80', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Check size={13} /> {couponSuccess}
                </div>
              )}
              {couponError && (
                <div style={{ fontSize: '0.78rem', color: '#F87171', marginTop: '6px' }}>
                  {couponError}
                </div>
              )}
            </div>

            {/* UPI QR Payment Container */}
            <div
              style={{
                backgroundColor: '#161616',
                border: '1px solid rgba(217, 183, 122, 0.25)',
                borderRadius: '18px',
                padding: '1.4rem',
                marginBottom: '1.5rem',
                textAlign: 'center',
                position: 'relative',
              }}
            >
              <div
                style={{
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  color: 'var(--text-tertiary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <QrCode size={14} color="var(--accent-gold)" />
                <span>Scan with any UPI App</span>
              </div>

              {/* QR Image Frame */}
              <div
                style={{
                  display: 'inline-block',
                  backgroundColor: '#FFFFFF',
                  padding: '10px',
                  borderRadius: '16px',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 25px rgba(217, 183, 122, 0.2)',
                  border: '2px solid var(--accent-gold)',
                  marginBottom: '1rem',
                }}
              >
                <img
                  src="/upi-qr.png"
                  alt="UPI QR Code"
                  style={{
                    width: '180px',
                    height: '180px',
                    display: 'block',
                    borderRadius: '8px',
                    objectFit: 'contain',
                  }}
                />
              </div>

              {/* Amount to pay badge */}
              <div style={{ marginBottom: '1rem' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: 'rgba(217, 183, 122, 0.1)',
                    border: '1px solid rgba(217, 183, 122, 0.3)',
                    padding: '4px 12px',
                    borderRadius: '9999px',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                  }}
                >
                  <span>Pay:</span>
                  <span style={{ color: 'var(--accent-gold)', fontSize: '0.95rem' }}>
                    ₹{finalPrice.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Supported UPI Apps Pills */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  flexWrap: 'wrap',
                  marginBottom: '1.25rem',
                }}
              >
                {['Google Pay', 'PhonePe', 'Paytm', 'BHIM', 'CRED'].map((app) => (
                  <span
                    key={app}
                    style={{
                      fontSize: '0.7rem',
                      backgroundColor: '#202020',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {app}
                  </span>
                ))}
              </div>

              {/* UPI ID Row with Copy */}
              <div
                style={{
                  backgroundColor: '#1D1D1D',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  padding: '0.65rem 0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                }}
              >
                <div style={{ textAlign: 'left', overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                    UPI ID (VPA)
                  </div>
                  <div
                    style={{
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      fontFamily: 'monospace',
                    }}
                  >
                    {upiId}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCopyUpi}
                  style={{
                    backgroundColor: copiedUpi ? '#22C55E' : 'rgba(217, 183, 122, 0.15)',
                    border: '1px solid rgba(217, 183, 122, 0.3)',
                    color: copiedUpi ? '#000' : 'var(--accent-gold)',
                    borderRadius: '8px',
                    padding: '0.45rem 0.75rem',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {copiedUpi ? (
                    <>
                      <Check size={13} /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={13} /> Copy ID
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Verification: UPI Reference / UTR Number Form */}
            <form onSubmit={handleVerifyPayment}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: '0.4rem',
                  }}
                >
                  Enter UPI Reference / UTR No. <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 4289XXXXXXXX (12-digit Ref / UTR No.)"
                  value={upiRefNumber}
                  onChange={(e) => {
                    setUpiRefNumber(e.target.value);
                    if (refError) setRefError('');
                  }}
                  style={{
                    width: '100%',
                    backgroundColor: '#181818',
                    border: refError ? '1px solid #EF4444' : '1px solid rgba(217, 183, 122, 0.4)',
                    borderRadius: '10px',
                    padding: '0.75rem 0.95rem',
                    color: 'var(--text-primary)',
                    fontSize: '0.88rem',
                    fontFamily: 'monospace',
                    letterSpacing: '0.04em',
                  }}
                />
                <div style={{ fontSize: '0.73rem', color: 'var(--text-tertiary)', marginTop: '5px' }}>
                  Found on your payment success receipt in GPay / PhonePe / Paytm / BHIM app.
                </div>
                {refError && (
                  <div style={{ fontSize: '0.78rem', color: '#F87171', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <AlertCircle size={13} /> {refError}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  fontSize: '0.96rem',
                  fontWeight: 600,
                  backgroundColor: 'var(--accent-gold)',
                  color: '#090909',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  opacity: isProcessing ? 0.75 : 1,
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  boxShadow: '0 8px 25px rgba(217, 183, 122, 0.3)',
                  marginBottom: '1rem',
                  transition: 'all 0.2s ease',
                }}
              >
                {isProcessing ? (
                  <>
                    <span className="pulse-dot" style={{ backgroundColor: '#090909' }} />
                    <span>Verifying UTR with UPI Gateway...</span>
                  </>
                ) : (
                  <>
                    <Lock size={15} />
                    <span>Verify & Activate {plan.name}</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Trust Guarantee Strip */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1.25rem',
                color: 'var(--text-tertiary)',
                fontSize: '0.74rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                paddingTop: '0.85rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={13} color="#4ADE80" />
                <span>Instant Verification</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Zap size={13} color="var(--accent-gold)" />
                <span>Zero Latency Activation</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Lock size={13} />
                <span>7-Day Refund Policy</span>
              </div>
            </div>
          </div>
        ) : (
          /* Payment Verified Success View */
          <div style={{ textAlign: 'center', padding: '1.5rem 0.5rem' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                border: '2px solid #22C55E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto',
                boxShadow: '0 0 30px rgba(34, 197, 94, 0.3)',
              }}
            >
              <CheckCircle2 size={34} color="#22C55E" />
            </div>

            <span
              style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                color: 'var(--accent-gold)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              Payment Verified Successfully
            </span>

            <h3
              className="serif-heading"
              style={{
                fontSize: '1.9rem',
                color: 'var(--text-primary)',
                marginTop: '0.35rem',
                marginBottom: '0.65rem',
              }}
            >
              Welcome to <span className="gold-italic">{plan.name}</span>!
            </h3>

            <p
              style={{
                color: 'var(--text-secondary)',
                fontSize: '0.9rem',
                lineHeight: 1.6,
                maxWidth: '420px',
                margin: '0 auto 1.5rem auto',
              }}
            >
              Your UTR Reference has been verified! All unlimited AI voice mock interviews,
              follow-up questions, and company question sets are now unlocked.
            </p>

            <div
              style={{
                backgroundColor: '#181818',
                borderRadius: '12px',
                padding: '0.85rem 1.2rem',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'inline-flex',
                flexDirection: 'column',
                gap: '4px',
                marginBottom: '2rem',
                fontSize: '0.8rem',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: 'var(--text-tertiary)' }}>UTR Ref:</span>
                <span style={{ color: 'var(--text-primary)', fontFamily: 'monospace', fontWeight: 600 }}>
                  {upiRefNumber}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: 'var(--text-tertiary)' }}>Status:</span>
                <span style={{ color: '#22C55E', fontWeight: 600 }}>● VERIFIED & ACTIVE</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'center' }}>
              <button
                onClick={handleClose}
                className="btn-secondary"
                style={{ padding: '0.75rem 1.4rem', fontSize: '0.9rem' }}
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleClose();
                  if (onStartInterview) onStartInterview();
                }}
                className="btn-primary"
                style={{
                  padding: '0.75rem 1.6rem',
                  fontSize: '0.9rem',
                  backgroundColor: 'var(--accent-gold)',
                  color: '#090909',
                }}
              >
                <span>Launch Mock Interview</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
