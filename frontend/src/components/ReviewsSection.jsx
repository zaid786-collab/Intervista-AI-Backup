import React, { useState } from 'react';
import { Star, Heart, Edit3, X, Check, Sparkles } from 'lucide-react';

const INITIAL_REVIEWS = [
  {
    id: 1,
    name: 'Sujal Singh Negi',
    date: 'Oct 15, 2026',
    rating: 5,
    text: 'Best work.... the real-time AI voice feedback helped me fix my pacing and technical articulation completely!',
    likes: 4,
    liked: false,
    isAdminLiked: true,
    avatarBg: '#593D1E',
  },
  {
    id: 2,
    name: 'Piyush Purohit',
    date: 'Oct 14, 2026',
    rating: 5,
    text: 'Amazing Work Guys. The database query optimization questions were identical to what I got in my real interview.',
    likes: 6,
    liked: false,
    isAdminLiked: true,
    avatarBg: '#3F3528',
  },
  {
    id: 3,
    name: 'Nancy Bana',
    date: 'Oct 13, 2026',
    rating: 5,
    text: 'Loved the overall look and conversational feel. Such a cool mock interview tool and the effort behind it really shows. Excited to see it grow! 😊',
    likes: 8,
    liked: false,
    isAdminLiked: true,
    avatarBg: '#4A3B2C',
  },
  {
    id: 4,
    name: 'Aman Verma',
    date: 'Oct 12, 2026',
    rating: 5,
    text: 'The instant score breakdown for Communication and Technical Depth is a game changer compared to traditional prep platforms.',
    likes: 5,
    liked: false,
    isAdminLiked: false,
    avatarBg: '#2E3A44',
  },
  {
    id: 5,
    name: 'Ritika Sharma',
    date: 'Oct 10, 2026',
    rating: 5,
    text: 'Product Manager case studies were super realistic. The AI challenged my assumptions just like a Principal PM would.',
    likes: 9,
    liked: false,
    isAdminLiked: true,
    avatarBg: '#442E3B',
  },
  {
    id: 6,
    name: 'Devansh Gupta',
    date: 'Oct 08, 2026',
    rating: 4,
    text: 'The voice synthesis is so smooth. Felt like talking to a real interviewer on Google Meet. 10/10 recommendation!',
    likes: 3,
    liked: false,
    isAdminLiked: false,
    avatarBg: '#383E2D',
  },
];

export default function ReviewsSection() {
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleLike = (id) => {
    setReviews(prev =>
      prev.map(r => {
        if (r.id === id) {
          return {
            ...r,
            likes: r.liked ? r.likes - 1 : r.likes + 1,
            liked: !r.liked,
          };
        }
        return r;
      })
    );
  };

  const handleAddReview = (e) => {
    e.preventDefault();
    if (!name.trim() || !reviewText.trim()) return;

    const newRev = {
      id: Date.now(),
      name: name.trim(),
      date: 'Just now',
      rating,
      text: reviewText.trim(),
      likes: 1,
      liked: true,
      isAdminLiked: true,
      avatarBg: '#4F3F2E',
    };

    setReviews([newRev, ...reviews]);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setIsModalOpen(false);
      setName('');
      setReviewText('');
      setRating(5);
    }, 1200);
  };

  // Duplicate list to achieve infinite seamless loop
  const marqueeReviews = [...reviews, ...reviews];

  return (
    <section id="reviews" className="section-wrapper" style={{ padding: '8.5rem 0', position: 'relative' }}>
      <div className="container">
        {/* Main Review Section Container */}
        <div
          style={{
            backgroundColor: '#0F0F0F',
            border: '1px solid var(--border-card)',
            borderRadius: '26px',
            padding: '3.75rem 3.25rem',
            display: 'grid',
            gridTemplateColumns: '320px 1fr',
            gap: '3.5rem',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
          className="reviews-container-grid"
        >
          {/* Ambient Glow */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '10%',
              transform: 'translateY(-50%)',
              width: '280px',
              height: '280px',
              background: 'radial-gradient(circle, rgba(217, 183, 122, 0.08) 0%, transparent 70%)',
              filter: 'blur(45px)',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />

          {/* Left Side: Score Summary & Breakdown */}
          <div style={{ position: 'relative', zIndex: 1, borderRight: '1px solid rgba(255, 255, 255, 0.06)', paddingRight: '2rem' }} className="reviews-left-col">
            {/* Tag */}
            <div style={{ marginBottom: '0.75rem' }}>
              <span className="eyebrow-tag" style={{ color: 'var(--accent-gold)' }}>
                REVIEWS
              </span>
            </div>

            {/* Title */}
            <h2
              className="serif-heading"
              style={{
                fontSize: '2rem',
                lineHeight: 1.2,
                marginBottom: '1.25rem',
                color: 'var(--text-primary)',
              }}
            >
              Student <span className="gold-italic">Feedback</span>
            </h2>

            {/* Score & Stars */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
                4.9
              </span>
              <div>
                <div style={{ display: 'flex', gap: '3px', marginBottom: '3px' }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={15} fill="var(--accent-gold)" color="var(--accent-gold)" />
                  ))}
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {reviews.length + 41} reviews
                </span>
              </div>
            </div>

            {/* Rating Breakdown Bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '2rem' }}>
              {[
                { stars: 5, count: reviews.length + 39, pct: 94 },
                { stars: 4, count: 1, pct: 15 },
                { stars: 3, count: 1, pct: 10 },
                { stars: 2, count: 0, pct: 0 },
                { stars: 1, count: 0, pct: 0 },
              ].map((row) => (
                <div
                  key={row.stars}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '28px 1fr 20px',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    {row.stars} <span style={{ color: 'var(--accent-gold)', fontSize: '0.85rem' }}>★</span>
                  </span>
                  <div style={{ height: '4px', backgroundColor: '#1C1C1C', borderRadius: '2px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${row.pct}%`,
                        backgroundColor: 'var(--accent-gold)',
                        borderRadius: '2px',
                      }}
                    />
                  </div>
                  <span style={{ textAlign: 'right', color: 'var(--text-tertiary)' }}>{row.count}</span>
                </div>
              ))}
            </div>

            {/* Write a Review Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-secondary"
              style={{
                width: '100%',
                padding: '0.7rem 1rem',
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                borderColor: 'rgba(217, 183, 122, 0.3)',
                color: 'var(--text-primary)',
              }}
            >
              <Edit3 size={15} color="var(--accent-gold)" />
              <span>Write a Review</span>
            </button>
          </div>

          {/* Right Side: Infinite Horizontal Carousel */}
          <div
            style={{
              position: 'relative',
              overflow: 'hidden',
              maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
              WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
            }}
            className="reviews-marquee-wrapper"
          >
            <div
              className="reviews-marquee-track"
              style={{
                display: 'flex',
                gap: '1.25rem',
                width: 'max-content',
              }}
            >
              {marqueeReviews.map((item, idx) => {
                const initial = item.name.charAt(0).toUpperCase();
                return (
                  <div
                    key={`${item.id}-${idx}`}
                    className="glass-card review-card"
                    style={{
                      width: '300px',
                      padding: '1.4rem 1.35rem',
                      borderRadius: '16px',
                      backgroundColor: '#131313',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      flexDirection: 'column',
                      flexShrink: 0,
                      userSelect: 'none',
                    }}
                  >
                    {/* Header: Avatar, Name & Date */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: item.avatarBg || '#443',
                          border: '1px solid rgba(217, 183, 122, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--accent-gold)',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          flexShrink: 0,
                        }}
                      >
                        {initial}
                      </div>

                      <div style={{ overflow: 'hidden' }}>
                        <div
                          style={{
                            fontSize: '0.88rem',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {item.name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                          {item.date}
                        </div>
                      </div>
                    </div>

                    {/* Star Rating */}
                    <div style={{ display: 'flex', gap: '2px', marginBottom: '0.75rem' }}>
                      {[...Array(item.rating)].map((_, i) => (
                        <Star key={i} size={13} fill="var(--accent-gold)" color="var(--accent-gold)" />
                      ))}
                    </div>

                    {/* Review Text */}
                    <p
                      style={{
                        fontSize: '0.82rem',
                        lineHeight: 1.5,
                        color: 'var(--text-secondary)',
                        marginBottom: '1.25rem',
                        flex: 1,
                      }}
                    >
                      "{item.text}"
                    </p>

                    {/* Footer: Likes and Admin Badge */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: 'auto',
                        paddingTop: '0.65rem',
                        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                      }}
                    >
                      {/* Heart Like Button */}
                      <button
                        onClick={() => handleLike(item.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: item.liked ? '#EF4444' : 'var(--text-tertiary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          padding: '2px',
                          transition: 'transform 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.15)')}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                      >
                        <Heart size={14} fill={item.liked ? '#EF4444' : 'none'} />
                        <span>{item.likes}</span>
                      </button>

                      {/* Liked by Admin Badge */}
                      {item.isAdminLiked && (
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            backgroundColor: 'rgba(217, 183, 122, 0.08)',
                            border: '1px solid rgba(217, 183, 122, 0.25)',
                            color: 'var(--accent-gold)',
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '9999px',
                          }}
                        >
                          <Star size={10} fill="var(--accent-gold)" />
                          <span>Liked by Admin</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Review Submission Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '480px', padding: '2.5rem', backgroundColor: '#131313' }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit3 size={18} color="var(--accent-gold)" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Share Your Feedback
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {submitted ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '2rem 1rem',
                  color: '#4ADE80',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <Check size={36} />
                <h4 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Review Published!</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Thank you for helping other candidates excel in their interviews.
                </p>
              </div>
            ) : (
              <form onSubmit={handleAddReview} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {/* Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sujal Singh Negi"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: '#1A1A1A',
                      border: '1px solid var(--border-card)',
                      borderRadius: '10px',
                      padding: '0.75rem 1rem',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>

                {/* Rating selection */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                    Overall Rating
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                        }}
                      >
                        <Star
                          size={24}
                          fill={(hoverRating || rating) >= star ? 'var(--accent-gold)' : 'none'}
                          color="var(--accent-gold)"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Review Text */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                    Your Experience
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tell other candidates how Intervista helped your mock interview preparation..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: '#1A1A1A',
                      border: '1px solid var(--border-card)',
                      borderRadius: '10px',
                      padding: '0.75rem 1rem',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      resize: 'vertical',
                    }}
                  />
                </div>

                {/* Submit */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="btn-secondary"
                    style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ padding: '0.65rem 1.45rem', fontSize: '0.85rem' }}
                  >
                    Publish Review
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Infinite Marquee CSS Animation */}
      <style>{`
        @keyframes marqueeScroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .reviews-marquee-track {
          animation: marqueeScroll 32s linear infinite;
        }

        .reviews-marquee-track:hover {
          animation-play-state: paused;
        }

        .review-card:hover {
          border-color: rgba(217, 183, 122, 0.4) !important;
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.6), 0 0 16px rgba(217, 183, 122, 0.08);
        }

        @media (max-width: 900px) {
          .reviews-container-grid {
            grid-template-columns: 1fr !important;
          }
          .reviews-left-col {
            border-right: none !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
            padding-right: 0 !important;
            padding-bottom: 2rem;
          }
        }
      `}</style>
    </section>
  );
}
