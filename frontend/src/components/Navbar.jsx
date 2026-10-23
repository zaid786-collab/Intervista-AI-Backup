import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, Menu, X, LogOut, User, BarChart2, Shield } from 'lucide-react';
import { gsap } from 'gsap';

export default function Navbar({
  currentPage = 'home',
  currentView,
  onNavigate,
  onStartInterview,
  onOpenLogin,
  onOpenSignup,
  currentUser,
  onLogout,
  onOpenContact,
  onNavigateToDashboard,
  onNavigateToHome,
}) {
  let navigate = null;
  let location = null;
  try {
    navigate = useNavigate();
    location = useLocation();
  } catch (_) {}

  const currentPath = location?.pathname || '';
  const activePage = currentView || currentPage || (
    currentPath === '/' ? 'home' :
    currentPath.startsWith('/dashboard') ? 'dashboard' :
    currentPath.startsWith('/companies') ? 'companies' :
    currentPath.startsWith('/resources') ? 'resources' :
    currentPath.startsWith('/plans') || currentPath.startsWith('/pricing') ? 'plans' :
    currentPath.startsWith('/profile') ? 'profile' :
    currentPath.startsWith('/admin') ? 'admin' :
    currentPath.startsWith('/analysis') ? 'analysis' :
    'home'
  );

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // GSAP Animation Refs for PillNav
  const circleRefs = useRef([]);
  const tlRefs = useRef([]);
  const activeTweenRefs = useRef([]);
  const logoRef = useRef(null);
  const logoImgRef = useRef(null);
  const logoTweenRef = useRef(null);
  const navItemsRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const navItems = [
    { label: 'HOME', page: 'home', id: 'hero', path: '/' },
    { label: 'DASHBOARD', page: 'dashboard', id: 'dashboard', path: '/dashboard' },
    { label: 'COMPANIES', page: 'companies', id: 'companies', path: '/companies' },
    { label: 'RESOURCES', page: 'resources', id: 'resources', path: '/resources' },
    { label: 'PLANS', page: 'plans', id: 'plans', path: '/plans' },
    ...(currentUser ? [{ label: 'MY PROFILE', page: 'profile', id: 'profile', path: '/profile' }] : []),
    ...(currentUser?.is_admin ? [{ label: 'ADMIN', page: 'admin', id: 'admin', path: '/admin' }] : []),
    { label: 'CONTACT', id: 'contact', isContact: true },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // PillNav rising circle & text flip GSAP setup
  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach((circle, index) => {
        if (!circle?.parentElement) return;

        const pill = circle.parentElement;
        const rect = pill.getBoundingClientRect();
        const { width: w, height: h } = rect;
        if (!w || !h) return;

        // Calculate radius and origin for rising circle to completely fill the pill
        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;

        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`,
        });

        const label = pill.querySelector('.pill-label');
        const hoverLabel = pill.querySelector('.pill-label-hover');

        if (label) gsap.set(label, { y: 0 });
        if (hoverLabel) gsap.set(hoverLabel, { y: h + 14, opacity: 0 });

        tlRefs.current[index]?.kill();
        const tl = gsap.timeline({ paused: true });

        tl.to(
          circle,
          {
            scale: 1.25,
            xPercent: -50,
            duration: 0.7,
            ease: 'power3.out',
            overwrite: 'auto',
          },
          0
        );

        if (label) {
          tl.to(
            label,
            {
              y: -(h + 8),
              duration: 0.55,
              ease: 'power3.out',
              overwrite: 'auto',
            },
            0
          );
        }

        if (hoverLabel) {
          gsap.set(hoverLabel, { y: Math.ceil(h + 14), opacity: 0 });
          tl.to(
            hoverLabel,
            {
              y: 0,
              opacity: 1,
              duration: 0.55,
              ease: 'power3.out',
              overwrite: 'auto',
            },
            0
          );
        }

        tlRefs.current[index] = tl;
      });
    };

    layout();
    const onResize = () => layout();
    window.addEventListener('resize', onResize);

    if (document.fonts) {
      document.fonts.ready.then(layout).catch(() => {});
    }

    // Entrance Animation
    if (navItemsRef.current) {
      const listItems = navItemsRef.current.querySelectorAll('li');
      gsap.set(listItems, { opacity: 0, y: -8 });
      gsap.to(listItems, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.05,
        ease: 'power2.out',
        delay: 0.1,
      });
    }

    if (logoRef.current) {
      gsap.set(logoRef.current, { scale: 0.9, opacity: 0 });
      gsap.to(logoRef.current, {
        scale: 1,
        opacity: 1,
        duration: 0.6,
        ease: 'back.out(1.7)',
      });
    }

    return () => {
      window.removeEventListener('resize', onResize);
      tlRefs.current.forEach((tl) => tl?.kill());
      activeTweenRefs.current.forEach((tw) => tw?.kill());
      logoTweenRef.current?.kill();
    };
  }, [navItems.length]);

  const handleEnter = (i) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), {
      duration: 0.38,
      ease: 'power3.out',
      overwrite: 'auto',
    });
  };

  const handleLeave = (i) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(0, {
      duration: 0.32,
      ease: 'power3.out',
      overwrite: 'auto',
    });
  };

  const handleLogoEnter = () => {
    const img = logoImgRef.current;
    if (!img) return;
    logoTweenRef.current?.kill();
    logoTweenRef.current = gsap.to(img, {
      rotate: 360,
      duration: 0.8,
      ease: 'elastic.out(1, 0.5)',
      overwrite: 'auto',
      onComplete: () => gsap.set(img, { rotate: 0 }),
    });
  };

  const toggleMobileMenu = () => {
    const newState = !mobileMenuOpen;
    setMobileMenuOpen(newState);

    const menu = mobileMenuRef.current;
    if (menu) {
      if (newState) {
        gsap.set(menu, { display: 'flex', opacity: 0, y: -15 });
        gsap.to(menu, {
          opacity: 1,
          y: 0,
          duration: 0.35,
          ease: 'power3.out',
        });
      } else {
        gsap.to(menu, {
          opacity: 0,
          y: -15,
          duration: 0.25,
          ease: 'power3.in',
          onComplete: () => {
            gsap.set(menu, { display: 'none' });
          },
        });
      }
    }
  };

  const handleNavClick = (e, item) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    if (item.isContact) {
      if (onOpenContact) onOpenContact();
      return;
    }

    if (item.path && navigate) {
      navigate(item.path);
      return;
    }

    if (item.page === 'dashboard') {
      if (onNavigate) onNavigate('dashboard');
      else if (onNavigateToDashboard) onNavigateToDashboard();
      else if (navigate) navigate('/dashboard');
      return;
    }

    if (item.page === 'companies') {
      if (onNavigate) onNavigate('companies');
      else if (navigate) navigate('/companies');
      return;
    }

    if (item.page === 'resources') {
      if (onNavigate) onNavigate('resources');
      else if (navigate) navigate('/resources');
      return;
    }

    if (item.page === 'plans') {
      if (onNavigate) onNavigate('plans');
      else if (navigate) navigate('/plans');
      else window.location.hash = '#plans';
      return;
    }

    if (item.page === 'admin') {
      if (onNavigate) onNavigate('admin');
      else if (navigate) navigate('/admin');
      return;
    }

    if (item.page === 'profile') {
      if (onNavigate) onNavigate('profile');
      else if (navigate) navigate('/profile');
      else window.location.hash = '#profile';
      return;
    }

    // Navigating to home section
    if (onNavigate) {
      onNavigate('home', item.id);
    } else if (onNavigateToHome) {
      onNavigateToHome();
    } else if (navigate) {
      navigate('/');
    }
  };

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        transition: 'all 0.3s ease',
        backgroundColor: scrolled ? 'rgba(9, 9, 9, 0.92)' : 'rgba(9, 9, 9, 0.75)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
      }}
    >
      <div
        className="navbar-container"
        style={{
          width: '100%',
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0 2.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '2.5rem',
          height: 'var(--nav-height)',
        }}
      >
        {/* Brand Logo with Rotating GSAP Interaction */}
        <a
          href="#home"
          ref={logoRef}
          onMouseEnter={handleLogoEnter}
          onClick={(e) => {
            e.preventDefault();
            if (onNavigate) onNavigate('home', 'hero');
            else if (onNavigateToHome) onNavigateToHome();
            else window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="brand-logo-link"
          aria-label="Intervista"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            textDecoration: 'none',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            flexShrink: 0,
            userSelect: 'none',
          }}
        >
          {/* Logo Emblem functioning seamlessly as initial letter 'I' of INTERVISTA */}
          <div
            className="brand-emblem-wrap"
            style={{
              position: 'relative',
              height: '32px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginRight: '3px',
            }}
          >
            <img
              ref={logoImgRef}
              src="/logo-emblem.png"
              alt="I"
              style={{
                height: '28px',
                width: 'auto',
                objectFit: 'contain',
                display: 'block',
                pointerEvents: 'none',
                filter: 'drop-shadow(0 0 10px rgba(217, 183, 122, 0.55))',
                transition: 'transform 0.3s ease, filter 0.3s ease',
              }}
            />
          </div>
          <span
            className="brand-logo-text"
            style={{
              fontFamily: "'Cinzel', 'Playfair Display', serif",
              fontSize: '1.25rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              background: 'linear-gradient(180deg, #FFFFFF 0%, #F6ECD8 22%, #DDB86C 60%, #9B7023 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 12px rgba(217, 183, 122, 0.35))',
              display: 'inline-block',
              lineHeight: 1,
            }}
          >
            NTERVISTA
          </span>
        </a>

        {/* Desktop GSAP PillNav Container */}
        <div
          ref={navItemsRef}
          className="desktop-pill-nav"
          style={{
            display: 'flex',
            alignItems: 'center',
            height: '44px',
            backgroundColor: 'rgba(17, 17, 17, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.09)',
            borderRadius: '9999px',
            padding: '0 6px',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
            flexShrink: 0,
          }}
        >
          <ul
            role="menubar"
            style={{
              listStyle: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              margin: 0,
              padding: 0,
              height: '100%',
            }}
          >
            {navItems.map((item, i) => {
              const isActive =
                (item.page === 'companies' && activePage === 'companies') ||
                (item.page === 'dashboard' && activePage === 'dashboard') ||
                (item.page === 'plans' && activePage === 'plans') ||
                (item.page === 'resources' && activePage === 'resources') ||
                (item.page === 'profile' && activePage === 'profile') ||
                (item.page === 'admin' && activePage === 'admin') ||
                (item.page === 'home' && item.id === 'hero' && activePage === 'home' && !scrolled);

              return (
                <li key={item.label} role="none" style={{ display: 'flex', alignItems: 'center' }}>
                  <a
                    role="menuitem"
                    href={`#${item.id}`}
                    onClick={(e) => handleNavClick(e, item)}
                    onMouseEnter={() => handleEnter(i)}
                    onMouseLeave={() => handleLeave(i)}
                    className="pill-nav-item"
                    style={{
                      position: 'relative',
                      overflow: 'hidden',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '34px',
                      padding: '0 16px',
                      borderRadius: '9999px',
                      textDecoration: 'none',
                      cursor: 'pointer',
                      backgroundColor: isActive ? 'rgba(217, 183, 122, 0.12)' : 'transparent',
                      border: isActive ? '1px solid rgba(217, 183, 122, 0.3)' : '1px solid transparent',
                      transition: 'background-color 0.25s ease, border-color 0.25s ease',
                    }}
                  >
                    {/* Rising Circle Background Animation */}
                    <span
                      ref={(el) => {
                        circleRefs.current[i] = el;
                      }}
                      className="hover-circle"
                      style={{
                        position: 'absolute',
                        left: '50%',
                        bottom: 0,
                        borderRadius: '50%',
                        zIndex: 1,
                        display: 'block',
                        pointerEvents: 'none',
                        background: 'linear-gradient(135deg, #F5E7C8 0%, #D9B77A 100%)',
                        willChange: 'transform',
                      }}
                      aria-hidden="true"
                    />

                    {/* Stacked Labels for Vertical Flip Animation */}
                    <span
                      className="label-stack"
                      style={{
                        position: 'relative',
                        display: 'inline-block',
                        lineHeight: 1,
                        zIndex: 2,
                        overflow: 'hidden',
                        padding: '2px 0',
                      }}
                    >
                      <span
                        className="pill-label"
                        style={{
                          position: 'relative',
                          zIndex: 2,
                          display: 'inline-block',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          letterSpacing: '0.08em',
                          color: isActive ? 'var(--accent-gold)' : 'var(--text-secondary)',
                          willChange: 'transform',
                        }}
                      >
                        {item.label}
                      </span>

                      <span
                        className="pill-label-hover"
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: '2px',
                          zIndex: 3,
                          display: 'inline-block',
                          width: '100%',
                          textAlign: 'center',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          letterSpacing: '0.08em',
                          color: '#0A0A0A',
                          willChange: 'transform, opacity',
                        }}
                        aria-hidden="true"
                      >
                        {item.label}
                      </span>
                    </span>

                    {/* Active Tab Glow Dot */}
                    {isActive && (
                      <span
                        style={{
                          position: 'absolute',
                          bottom: '3px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: '4px',
                          height: '4px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--accent-gold)',
                          boxShadow: '0 0 6px rgba(217, 183, 122, 0.8)',
                          zIndex: 4,
                          pointerEvents: 'none',
                        }}
                        aria-hidden="true"
                      />
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Right CTA Actions */}
        <div
          className="desktop-actions"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            flexShrink: 0,
          }}
        >
          {currentUser ? (
            <div style={{ position: 'relative' }}>
              <div
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                title="Account Menu"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.35rem 0.85rem',
                  backgroundColor: activePage === 'profile' ? 'rgba(217, 183, 122, 0.22)' : 'rgba(217, 183, 122, 0.1)',
                  border: activePage === 'profile' ? '1px solid var(--accent-gold)' : '1px solid rgba(217, 183, 122, 0.3)',
                  borderRadius: '9999px',
                  color: 'var(--accent-gold)',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: activePage === 'profile' ? '0 0 12px rgba(217, 183, 122, 0.35)' : 'none',
                }}
              >
                <span
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent-gold)',
                    color: '#0A0A0A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    overflow: 'hidden',
                  }}
                >
                  {currentUser.picture ? (
                    <img
                      src={currentUser.picture}
                      alt={currentUser.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      referrerPolicy="no-referrer"
                    />
                  ) : currentUser.name ? (
                    currentUser.name.charAt(0).toUpperCase()
                  ) : (
                    'U'
                  )}
                </span>
                <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentUser.name || currentUser.email}
                </span>
              </div>

              {/* User Dropdown */}
              {userDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '220px',
                    backgroundColor: '#141414',
                    border: '1px solid rgba(217, 183, 122, 0.25)',
                    borderRadius: '16px',
                    boxShadow: '0 16px 36px rgba(0,0,0,0.8), 0 0 20px rgba(217, 183, 122, 0.1)',
                    padding: '0.5rem',
                    zIndex: 1000,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                  }}
                >
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      if (navigate) navigate('/profile');
                      else if (onNavigate) onNavigate('profile');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      padding: '0.65rem 0.85rem',
                      background: 'none',
                      border: 'none',
                      color: '#F6F0E7',
                      fontSize: '0.86rem',
                      cursor: 'pointer',
                      borderRadius: '10px',
                      textAlign: 'left',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <User size={15} color="#D9B77A" />
                    My Profile
                  </button>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      if (navigate) navigate('/analysis');
                      else if (onNavigate) onNavigate('analysis');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      padding: '0.65rem 0.85rem',
                      background: 'none',
                      border: 'none',
                      color: '#F6F0E7',
                      fontSize: '0.86rem',
                      cursor: 'pointer',
                      borderRadius: '10px',
                      textAlign: 'left',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <BarChart2 size={15} color="#D9B77A" />
                    Performance Analysis
                  </button>

                  {currentUser?.is_admin && (
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        if (navigate) navigate('/admin');
                        else if (onNavigate) onNavigate('admin');
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        padding: '0.65rem 0.85rem',
                        background: 'none',
                        border: 'none',
                        color: '#F6F0E7',
                        fontSize: '0.86rem',
                        cursor: 'pointer',
                        borderRadius: '10px',
                        textAlign: 'left',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <Shield size={15} color="#D9B77A" />
                      Admin Portal
                    </button>
                  )}

                  <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.08)', margin: '0.2rem 0' }} />

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      if (onLogout) onLogout();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      padding: '0.65rem 0.85rem',
                      background: 'none',
                      border: 'none',
                      color: '#EF4444',
                      fontSize: '0.86rem',
                      cursor: 'pointer',
                      borderRadius: '10px',
                      textAlign: 'left',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <LogOut size={15} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexShrink: 0 }}>
              <button
                onClick={onOpenLogin}
                className="btn-ghost-outline"
                style={{
                  padding: '0.5rem 1.25rem',
                  fontSize: '0.86rem',
                  color: 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                Log In
              </button>
              <button
                onClick={onOpenSignup || onOpenLogin}
                className="btn-ghost-outline"
                style={{
                  padding: '0.5rem 1.25rem',
                  fontSize: '0.86rem',
                  borderColor: 'var(--accent-gold)',
                  color: 'var(--accent-gold)',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                Sign Up
              </button>
            </div>
          )}
          <button
            onClick={() => onStartInterview()}
            className="btn-primary"
            style={{
              padding: '0.55rem 1.35rem',
              fontSize: '0.86rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              flexShrink: 0,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            Start Interview
            <ArrowRight size={15} />
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation menu"
          className="mobile-toggle"
          style={{
            display: 'none',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(217, 183, 122, 0.3)',
            borderRadius: '10px',
            color: 'var(--accent-gold)',
            cursor: 'pointer',
            padding: '0.45rem',
            transition: 'all 0.2s ease',
          }}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Backdrop overlay for mobile menu */}
      {mobileMenuOpen && (
        <div
          onClick={() => {
            const menu = mobileMenuRef.current;
            if (menu) {
              gsap.to(menu, {
                opacity: 0,
                y: -15,
                duration: 0.2,
                ease: 'power3.in',
                onComplete: () => {
                  gsap.set(menu, { display: 'none' });
                  setMobileMenuOpen(false);
                },
              });
            } else {
              setMobileMenuOpen(false);
            }
          }}
          style={{
            position: 'fixed',
            top: 'var(--nav-height, 76px)',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 99,
          }}
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu Dropdown with GSAP transition */}
      <div
        ref={mobileMenuRef}
        className="mobile-nav-drawer"
        style={{
          display: 'none',
          position: 'fixed',
          top: 'var(--nav-height, 76px)',
          left: 0,
          right: 0,
          maxHeight: 'calc(100vh - var(--nav-height, 76px))',
          maxHeight: 'calc(100dvh - var(--nav-height, 76px))',
          overflowY: 'auto',
          backgroundColor: 'rgba(12, 12, 12, 0.98)',
          borderBottom: '1px solid rgba(217, 183, 122, 0.25)',
          padding: '1.25rem 1.25rem 2rem 1.25rem',
          flexDirection: 'column',
          gap: '0.65rem',
          zIndex: 100,
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.85), 0 0 24px rgba(217, 183, 122, 0.1)',
        }}
      >
        {navItems.map((item) => {
          const isActive =
            (item.page === 'companies' && activePage === 'companies') ||
            (item.page === 'dashboard' && activePage === 'dashboard') ||
            (item.page === 'plans' && activePage === 'plans') ||
            (item.page === 'resources' && activePage === 'resources') ||
            (item.page === 'profile' && activePage === 'profile') ||
            (item.page === 'admin' && activePage === 'admin') ||
            (item.page === 'home' && item.id === 'hero' && activePage === 'home' && !scrolled);

          return (
            <a
              key={item.label}
              href={`#${item.id}`}
              onClick={(e) => handleNavClick(e, item)}
              style={{
                color: isActive ? 'var(--accent-gold)' : 'var(--text-primary)',
                textDecoration: 'none',
                fontSize: '0.92rem',
                fontWeight: 600,
                letterSpacing: '0.08em',
                padding: '0.65rem 0.95rem',
                borderRadius: '10px',
                backgroundColor: isActive ? 'rgba(217, 183, 122, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                border: isActive ? '1px solid rgba(217, 183, 122, 0.3)' : '1px solid transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
              }}
            >
              <span>{item.label}</span>
              {isActive && (
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent-gold)',
                    boxShadow: '0 0 8px var(--accent-gold)',
                  }}
                />
              )}
            </a>
          );
        })}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          {currentUser ? (
            <div
              onClick={() => {
                setMobileMenuOpen(false);
                if (onNavigate) onNavigate('profile');
                else window.location.hash = '#profile';
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.65rem 0.95rem',
                backgroundColor: 'rgba(217, 183, 122, 0.1)',
                border: '1px solid rgba(217, 183, 122, 0.3)',
                borderRadius: '12px',
                cursor: 'pointer',
              }}
            >
              <span
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-gold)',
                  color: '#0A0A0A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  overflow: 'hidden',
                }}
              >
                {currentUser.picture ? (
                  <img
                    src={currentUser.picture}
                    alt={currentUser.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    referrerPolicy="no-referrer"
                  />
                ) : currentUser.name ? (
                  currentUser.name.charAt(0).toUpperCase()
                ) : (
                  'U'
                )}
              </span>
              <span style={{ fontSize: '0.86rem', color: 'var(--accent-gold)', fontWeight: 600 }}>
                {currentUser.name || currentUser.email} (My Profile)
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLogin();
                }}
                className="btn-ghost-outline"
                style={{ flex: 1, padding: '0.6rem 1rem' }}
              >
                Log In
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenSignup) onOpenSignup();
                  else onOpenLogin();
                }}
                className="btn-ghost-outline"
                style={{ flex: 1, padding: '0.6rem 1rem', borderColor: 'var(--accent-gold)', color: 'var(--accent-gold)' }}
              >
                Sign Up
              </button>
            </div>
          )}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onStartInterview();
            }}
            className="btn-primary"
            style={{ width: '100%', padding: '0.75rem 1.25rem', justifyContent: 'center' }}
          >
            Start Interview
            <ArrowRight size={15} />
          </button>
        </div>
      </div>

      <style>{`
        /* Compact PillNav for medium screens between 1025px and 1280px */
        @media (max-width: 1280px) and (min-width: 1025px) {
          .navbar-container {
            padding: 0 1.25rem !important;
            gap: 1.25rem !important;
          }
          .desktop-pill-nav {
            height: 40px !important;
            padding: 0 4px !important;
          }
          .desktop-pill-nav a.pill-nav-item {
            padding: 0 10px !important;
            height: 30px !important;
          }
          .desktop-pill-nav .pill-label,
          .desktop-pill-nav .pill-label-hover {
            font-size: 0.72rem !important;
            letter-spacing: 0.05em !important;
          }
          .desktop-actions {
            gap: 0.75rem !important;
            flex-shrink: 0 !important;
          }
          .desktop-actions .btn-ghost-outline,
          .desktop-actions .btn-primary {
            padding: 0.44rem 0.9rem !important;
            font-size: 0.82rem !important;
            white-space: nowrap !important;
            flex-shrink: 0 !important;
          }
        }

        /* Mobile & Tablet Breakpoint */
        @media (max-width: 1024px) {
          .navbar-container {
            padding: 0 1.5rem !important;
            gap: 1rem !important;
          }
          .desktop-pill-nav, .desktop-actions {
            display: none !important;
          }
          .mobile-toggle {
            display: flex !important;
            align-items: center;
            justify-content: center;
          }
        }

        @media (max-width: 768px) {
          .navbar-container {
            padding: 0 1.25rem !important;
          }
        }

        @media (max-width: 520px) {
          .brand-logo-text {
            font-size: 1.1rem !important;
            letter-spacing: 0.08em !important;
          }
          .brand-emblem-wrap img {
            height: 24px !important;
          }
        }

        @media (max-width: 360px) {
          .brand-logo-text {
            font-size: 0.96rem !important;
          }
        }
      `}</style>
    </header>
  );
}
