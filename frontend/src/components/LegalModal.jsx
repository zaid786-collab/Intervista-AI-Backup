import React from 'react';
import { X, Shield, Lock, FileText } from 'lucide-react';

export default function LegalModal({ isOpen, onClose, topic }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '620px',
          padding: '2.5rem',
          backgroundColor: '#121212',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(217, 183, 122, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-gold)',
              }}
            >
              <Shield size={16} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {topic || 'Privacy & Ethics Policy'}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '0.4rem',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>
          <p>
            <strong style={{ color: 'var(--text-primary)' }}>1. Strict Audio Privacy & Ephemeral Processing:</strong><br />
            Audio during live mock interviews is processed strictly in real-time for evaluation and transcription. Raw candidate audio recordings are never stored on public servers or shared with third parties without your explicit permission.
          </p>

          <p>
            <strong style={{ color: 'var(--text-primary)' }}>2. Zero Model Training on Private Data:</strong><br />
            Candidate responses, personal resumes, and performance diagnostic reports are excluded from public LLM training datasets to protect intellectual property and career confidentiality.
          </p>

          <p>
            <strong style={{ color: 'var(--text-primary)' }}>3. Fair & Rubric-Calibrated Scoring:</strong><br />
            Our evaluation benchmarks are standardized against publicly published hiring rubrics used across top engineering and product organizations.
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
          <button onClick={onClose} className="btn-primary" style={{ padding: '0.65rem 1.5rem', fontSize: '0.86rem' }}>
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}
