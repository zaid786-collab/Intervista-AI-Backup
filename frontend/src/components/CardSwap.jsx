/**
 * CardSwap Component — adapted from the CardSwap reference for Intervista AI.
 * Uses GSAP for smooth perspective card swapping animation.
 * Features:
 * - 3D stacked deck of 5 visible cards (with support for all 15 company cards)
 * - Animated swap to selected company via activeId prop (fly in + drop away)
 * - User-driven card switching (no unwanted auto-sliding)
 * - Click-to-promote card interaction
 */
import React, {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import gsap from 'gsap';

// ─── Card sub-component ─────────────────────────────────────────────────────

export const Card = forwardRef(({ customClass, style, children, id, ...rest }, ref) => (
  <div
    ref={ref}
    data-card-id={id}
    style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      backgroundColor: 'var(--bg-card, #151515)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      transformStyle: 'preserve-3d',
      willChange: 'transform, opacity',
      backfaceVisibility: 'hidden',
      cursor: 'pointer',
      overflow: 'hidden',
      ...style,
    }}
    {...rest}
  >
    {children}
  </div>
));

Card.displayName = 'Card';

// ─── Slot positioning helpers ───────────────────────────────────────────────
const VISIBLE_COUNT = 5;

const makeSlot = (i, distX, distY, total) => {
  const visible = Math.min(total, VISIBLE_COUNT);
  const centerOffset = (visible - 1) / 2;

  if (i < visible) {
    return {
      x: (i - centerOffset) * distX,
      y: -(i - centerOffset) * distY,
      z: -i * distX * 1.5,
      zIndex: visible - i,
      opacity: 1,
      scale: 1,
    };
  }

  // Cards beyond visible limit are staged behind card 4, hidden until swapped
  const lastSlotX = (visible - 1 - centerOffset) * distX;
  const lastSlotY = -(visible - 1 - centerOffset) * distY;
  const lastSlotZ = -(visible - 1) * distX * 1.5;

  return {
    x: lastSlotX + 25,
    y: lastSlotY - 12,
    z: lastSlotZ - 80,
    zIndex: 0,
    opacity: 0,
    scale: 0.88,
  };
};

const placeNow = (el, slot, skew) =>
  gsap.set(el, {
    x: slot.x,
    y: slot.y,
    z: slot.z,
    xPercent: -50,
    yPercent: -50,
    skewY: skew,
    transformOrigin: 'center center',
    zIndex: slot.zIndex,
    opacity: slot.opacity ?? 1,
    scale: slot.scale ?? 1,
    pointerEvents: slot.zIndex > 0 ? 'auto' : 'none',
    force3D: true,
  });

// ─── CardSwap container ─────────────────────────────────────────────────────

export default function CardSwap({
  width = 350,
  height = 220,
  cardDistance = 28,
  verticalDistance = 14,
  delay = 5000,
  autoPlay = false,
  pauseOnHover = true,
  onCardClick,
  skewAmount = 3,
  activeId,
  children,
}) {
  // Check for reduced motion preference
  const prefersReducedMotion = useRef(
    typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );

  const childArr = useMemo(
    () => Children.toArray(children),
    [children]
  );
  const refs = useMemo(
    () => childArr.map(() => React.createRef()),
    [childArr.length]
  );

  // Initialize order so that activeId starts at slot 0
  const order = useRef(() => {
    const indices = Array.from({ length: childArr.length }, (_, i) => i);
    if (activeId) {
      const matchIdx = childArr.findIndex(
        (c) => c.key === activeId || c.props?.id === activeId || c.props?.['data-company-id'] === activeId
      );
      if (matchIdx > 0) {
        return [matchIdx, ...indices.filter((i) => i !== matchIdx)];
      }
    }
    return indices;
  });

  // Ensure order is an array
  if (typeof order.current === 'function') {
    order.current = order.current();
  }

  const tlRef = useRef(null);
  const intervalRef = useRef(0);
  const container = useRef(null);
  const isMounted = useRef(false);

  // Helper to trigger animated transition to bring targetIdx to slot 0
  const triggerSwapTo = (targetIdx) => {
    if (targetIdx === undefined || targetIdx === null || targetIdx < 0) return;
    if (order.current[0] === targetIdx) {
      // Highlight existing front card with an energetic pulse
      const elFront = refs[targetIdx]?.current;
      if (elFront) {
        gsap.timeline()
          .to(elFront, { scale: 1.05, duration: 0.18, ease: 'power2.out' })
          .to(elFront, { scale: 1, duration: 0.35, ease: 'elastic.out(1, 0.5)' });
      }
      return;
    }

    tlRef.current?.kill();

    const currentFront = order.current[0];
    const elFront = refs[currentFront]?.current;
    const elTarget = refs[targetIdx]?.current;
    const newOrder = [targetIdx, ...order.current.filter((i) => i !== targetIdx)];

    const tl = gsap.timeline({
      onComplete: () => {
        order.current = newOrder;
      },
    });
    tlRef.current = tl;

    // 1. Drop out previous front card with 3D perspective swing
    if (elFront) {
      tl.to(elFront, {
        y: '+=380',
        z: -60,
        rotateX: -18,
        opacity: 0.15,
        duration: 0.42,
        ease: 'power2.in',
      });
    }

    const slot0 = makeSlot(0, cardDistance, verticalDistance, refs.length);

    // 2. Fly in the selected target card right into slot 0!
    if (elTarget) {
      tl.set(elTarget, { zIndex: 30, opacity: 1, pointerEvents: 'auto' }, '-=0.15');
      tl.fromTo(
        elTarget,
        {
          x: slot0.x,
          y: slot0.y - 110,
          z: 75,
          scale: 1.06,
          opacity: 0.5,
          skewY: skewAmount + 3,
        },
        {
          x: slot0.x,
          y: slot0.y,
          z: slot0.z,
          scale: 1,
          skewY: skewAmount,
          opacity: 1,
          duration: 0.65,
          ease: 'elastic.out(0.7, 0.85)',
        },
        '-=0.2'
      );
    }

    // 3. Re-slot all other cards in the deck
    newOrder.forEach((idx, slotIdx) => {
      if (idx === targetIdx) return;
      const el = refs[idx]?.current;
      if (!el) return;
      const slot = makeSlot(slotIdx, cardDistance, verticalDistance, refs.length);

      tl.set(el, { zIndex: slot.zIndex, pointerEvents: slot.zIndex > 0 ? 'auto' : 'none' }, '-=0.4');
      tl.to(
        el,
        {
          x: slot.x,
          y: slot.y,
          z: slot.z,
          opacity: slot.opacity,
          scale: slot.scale ?? 1,
          skewY: skewAmount,
          duration: 0.45,
          ease: 'power2.out',
        },
        `-=${0.38 - Math.min(slotIdx, 4) * 0.04}`
      );
    });
  };

  // Initial layout placement
  useEffect(() => {
    if (prefersReducedMotion.current) return;

    const total = refs.length;
    order.current.forEach((childIdx, slotIdx) => {
      const el = refs[childIdx]?.current;
      if (el) {
        placeNow(el, makeSlot(slotIdx, cardDistance, verticalDistance, total), skewAmount);
      }
    });

    // Optional autoplay if explicitly enabled and user hasn't selected
    if (autoPlay && delay > 0) {
      const swap = () => {
        if (order.current.length < 2) return;
        const [front, ...rest] = order.current;
        const nextOrder = [...rest, front];
        triggerSwapTo(nextOrder[0]);
      };
      intervalRef.current = window.setInterval(swap, delay);
    }

    isMounted.current = true;

    return () => {
      clearInterval(intervalRef.current);
      tlRef.current?.kill();
    };
  }, [cardDistance, verticalDistance, delay, autoPlay, skewAmount, refs.length]);

  // Watch for activeId changes from user clicks on companies
  useEffect(() => {
    if (!activeId || !isMounted.current || prefersReducedMotion.current) return;

    const targetIdx = childArr.findIndex(
      (c) => c.key === activeId || c.props?.id === activeId || c.props?.['data-company-id'] === activeId
    );

    if (targetIdx !== -1) {
      // Clear any autoPlay when user has actively selected a company
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = 0;
      }
      triggerSwapTo(targetIdx);
    }
  }, [activeId, childArr]);

  // Click on any card in the deck
  const handleCardClick = (childIdx, e) => {
    const child = childArr[childIdx];
    child?.props?.onClick?.(e);

    const cardId = child?.key || child?.props?.id || child?.props?.['data-company-id'];
    onCardClick?.(cardId || childIdx);

    // If user clicked a card in slots 1..4, promote it
    triggerSwapTo(childIdx);
  };

  // Reduced motion fallback
  if (prefersReducedMotion.current) {
    return (
      <div
        ref={container}
        style={{
          position: 'relative',
          width,
          height,
          perspective: '1200px',
          transformStyle: 'preserve-3d',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d' }}>
          {childArr.slice(0, 5).map((child, i) =>
            isValidElement(child)
              ? cloneElement(child, {
                  key: child.key || i,
                  ref: refs[i],
                  style: {
                    width,
                    height,
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: `translate(-50%, -50%) translateX(${(i - 2) * cardDistance}px) translateY(${-(i - 2) * verticalDistance}px)`,
                    zIndex: 5 - i,
                    ...(child.props.style ?? {}),
                  },
                  onClick: (e) => handleCardClick(i, e),
                })
              : child
          )}
        </div>
      </div>
    );
  }

  const rendered = childArr.map((child, i) =>
    isValidElement(child)
      ? cloneElement(child, {
          key: child.key || i,
          ref: refs[i],
          style: { width, height, ...(child.props.style ?? {}) },
          onClick: (e) => handleCardClick(i, e),
        })
      : child
  );

  return (
    <div
      ref={container}
      style={{
        position: 'relative',
        width,
        height,
        perspective: '1200px',
        transformStyle: 'preserve-3d',
      }}
    >
      <div style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d' }}>
        {rendered}
      </div>
    </div>
  );
}
