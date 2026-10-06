import React, { useEffect, useState, useRef } from 'react';
import { Play } from 'lucide-react';

interface ClickRipple {
  id: number;
  x: number;
  y: number;
}

export function CustomCursor() {
  const enabled = true;

  const [cursorType, setCursorType] = useState<'default' | 'pointer' | 'text' | 'media'>('default');
  const [cursorText, setCursorText] = useState<string>('');
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [ripples, setRipples] = useState<ClickRipple[]>([]);

  // Smooth lerp physics refs
  const mousePos = useRef({ x: -100, y: -100 });
  const followerPos = useRef({ x: -100, y: -100 });
  const trailPos = useRef<{ x: number; y: number }[]>([
    { x: -100, y: -100 },
    { x: -100, y: -100 },
    { x: -100, y: -100 },
    { x: -100, y: -100 },
  ]);

  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const trailRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Check if device supports hover (mouse/trackpad, not touchscreen)
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    setIsTouchDevice(isTouch);
  }, []);

  // Update body class for hiding default cursor when custom cursor is active
  useEffect(() => {
    if (enabled && !isTouchDevice && isVisible) {
      document.body.classList.add('syndicate-cursor-enabled');
    } else {
      document.body.classList.remove('syndicate-cursor-enabled');
    }

    return () => {
      document.body.classList.remove('syndicate-cursor-enabled');
    };
  }, [enabled, isTouchDevice, isVisible]);

  // Main cursor motion engine and iframe handling
  useEffect(() => {
    if (!enabled || isTouchDevice) return;

    let animId: number;

    const isStreamTarget = (target: Element | null): boolean => {
      if (!target) return false;
      return Boolean(
        target.tagName === 'IFRAME' ||
        target.closest('iframe') ||
        target.closest('.stream-player-box') ||
        target.closest('[data-stream-player]')
      );
    };

    const onMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;

      // When cursor is inside or entering a livestream player or iframe, hide custom cursor instantly
      if (isStreamTarget(target)) {
        setIsVisible(false);
        return;
      }

      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;

      if (!isVisible) {
        setIsVisible(true);
        followerPos.current.x = e.clientX;
        followerPos.current.y = e.clientY;
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (isStreamTarget(target)) {
        setIsVisible(false);
        return;
      }

      setIsMouseDown(true);
      // Generate impact shockwave ripple
      const newRipple: ClickRipple = {
        id: Date.now() + Math.random(),
        x: e.clientX,
        y: e.clientY,
      };
      setRipples(prev => [...prev.slice(-4), newRipple]);
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id));
      }, 400);
    };

    const onMouseUp = () => {
      setIsMouseDown(false);
    };

    const onMouseLeave = () => {
      setIsVisible(false);
    };

    const onMouseEnter = () => {
      setIsVisible(true);
    };

    // When the browser window loses focus (e.g. user clicked into an iframe player or chat)
    const onWindowBlur = () => {
      setIsVisible(false);
    };

    // Hover element detector
    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // 1. Livestream & iframes - hide immediately so native player controls work cleanly
      if (isStreamTarget(target)) {
        setIsVisible(false);
        return;
      }

      // 2. Text inputs
      const isTextInput = target.matches('input[type="text"], input[type="email"], input[type="password"], textarea, [contenteditable="true"]');
      if (isTextInput) {
        setCursorType('text');
        setCursorText('');
        return;
      }

      // 3. Media / Videos outside iframes
      const isMedia = target.closest('video, [data-cursor="media"]');
      if (isMedia) {
        setCursorType('media');
        setCursorText('WATCH');
        return;
      }

      // 4. Clickable / Interactive elements
      const isInteractive = target.closest('button, a, select, [role="button"], [data-cursor="pointer"], .cursor-pointer, input[type="submit"], input[type="button"], input[type="checkbox"], input[type="radio"]');
      if (isInteractive) {
        setCursorType('pointer');
        const customLabel = (isInteractive as HTMLElement).getAttribute('data-cursor-label');
        setCursorText(customLabel || '');
        return;
      }

      setCursorType('default');
      setCursorText('');
    };

    // Direct event bindings on stream player containers to prevent glitching on boundary
    const bindStreamContainers = () => {
      const containers = document.querySelectorAll('.stream-player-box, iframe, [data-stream-player]');
      containers.forEach(box => {
        box.addEventListener('mouseenter', () => setIsVisible(false));
        box.addEventListener('mouseleave', () => setIsVisible(true));
      });
    };

    bindStreamContainers();

    // Re-bind when DOM mutations happen (e.g. switching streams)
    const observer = new MutationObserver(() => {
      bindStreamContainers();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mouseover', onMouseOver, { passive: true });
    window.addEventListener('blur', onWindowBlur);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    // Animation Loop with lerp physics
    const loop = () => {
      const targetX = mousePos.current.x;
      const targetY = mousePos.current.y;

      // Primary ring lerp
      followerPos.current.x += (targetX - followerPos.current.x) * 0.22;
      followerPos.current.y += (targetY - followerPos.current.y) * 0.22;

      // Update center sharp point
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;
      }

      // Update tactical targeting reticle
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${followerPos.current.x}px, ${followerPos.current.y}px, 0)`;
      }

      // Update trailing ember particles
      let prevX = followerPos.current.x;
      let prevY = followerPos.current.y;

      trailPos.current.forEach((t, i) => {
        const factor = 0.35 - i * 0.05;
        t.x += (prevX - t.x) * factor;
        t.y += (prevY - t.y) * factor;
        prevX = t.x;
        prevY = t.y;

        const el = trailRefs.current[i];
        if (el) {
          el.style.transform = `translate3d(${t.x}px, ${t.y}px, 0)`;
        }
      });

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mouseover', onMouseOver);
      window.removeEventListener('blur', onWindowBlur);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
    };
  }, [enabled, isTouchDevice, isVisible]);

  if (isTouchDevice) {
    return null;
  }

  return (
    <>
      {/* Interactive Cursor Overlay */}
      {enabled && isVisible && (
        <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden select-none">
          {/* 1. Trailing Crimson Ember Sparks */}
          {trailPos.current.map((_, i) => (
            <div
              key={i}
              ref={el => { trailRefs.current[i] = el; }}
              className="absolute -top-1 -left-1 rounded-full pointer-events-none transition-opacity will-change-transform"
              style={{
                width: `${4 - i * 0.8}px`,
                height: `${4 - i * 0.8}px`,
                backgroundColor: i === 0 ? '#ef4444' : '#dc2626',
                opacity: 0.45 - i * 0.1,
                boxShadow: '0 0 6px rgba(239, 68, 68, 0.7)',
              }}
            />
          ))}

          {/* 2. Tactical Reticle Outer Follower */}
          <div
            ref={ringRef}
            className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 pointer-events-none will-change-transform"
          >
            {cursorType === 'text' ? (
              /* Text Input Mode: Sleek Vertical Tactical Beam */
              <div
                className={`w-0.5 h-6 bg-red-500 rounded-full shadow-[0_0_8px_#ef4444] transition-all duration-150 ${
                  isMouseDown ? 'scale-y-75 opacity-75' : 'scale-y-100 opacity-90'
                }`}
              />
            ) : (
              /* Tactical Targeting Sight Reticle */
              <div
                className={`relative flex items-center justify-center transition-all duration-200 ease-out ${
                  cursorType === 'pointer'
                    ? 'w-12 h-12 scale-110'
                    : cursorType === 'media'
                    ? 'w-14 h-14 scale-120'
                    : 'w-8 h-8 scale-100'
                } ${isMouseDown ? 'scale-75' : ''}`}
              >
                {/* Outer Reticle Ring */}
                <div
                  className={`absolute inset-0 rounded-full border transition-all duration-200 ${
                    cursorType === 'pointer'
                      ? 'border-red-500 bg-red-600/15 shadow-[0_0_18px_rgba(239,68,68,0.5)]'
                      : cursorType === 'media'
                      ? 'border-red-500 bg-red-950/40 shadow-[0_0_24px_rgba(220,38,38,0.7)]'
                      : 'border-red-500/60 bg-red-950/5 shadow-[0_0_10px_rgba(239,68,68,0.25)]'
                  }`}
                />

                {/* Tactical Cardinal Ticks (Top, Bottom, Left, Right) */}
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-0.5 h-1.5 bg-red-500/80 rounded-sm" />
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0.5 h-1.5 bg-red-500/80 rounded-sm" />
                <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-0.5 bg-red-500/80 rounded-sm" />
                <span className="absolute -right-1 top-1/2 -translate-y-1/2 w-1.5 h-0.5 bg-red-500/80 rounded-sm" />

                {/* Corner Lock-On Brackets when hovering interactive items */}
                {(cursorType === 'pointer' || cursorType === 'media') && (
                  <>
                    {/* Top-Left Corner Bracket */}
                    <span className="absolute -top-1.5 -left-1.5 w-2 h-2 border-t-2 border-l-2 border-red-400" />
                    {/* Top-Right Corner Bracket */}
                    <span className="absolute -top-1.5 -right-1.5 w-2 h-2 border-t-2 border-r-2 border-red-400" />
                    {/* Bottom-Left Corner Bracket */}
                    <span className="absolute -bottom-1.5 -left-1.5 w-2 h-2 border-b-2 border-l-2 border-red-400" />
                    {/* Bottom-Right Corner Bracket */}
                    <span className="absolute -bottom-1.5 -right-1.5 w-2 h-2 border-b-2 border-r-2 border-red-400" />
                  </>
                )}

                {/* Media Play Icon indicator */}
                {cursorType === 'media' && (
                  <Play className="h-3.5 w-3.5 fill-red-500 text-red-500 ml-0.5 animate-pulse" />
                )}

                {/* Micro Label / Crosshair Tag */}
                {cursorText && (
                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black/90 px-1.5 py-0.2 border border-red-800/80 font-mono text-[8px] font-black uppercase tracking-widest text-red-400 shadow-md">
                    {cursorText}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. Ultra-Sharp Center Laser Point (Exact Mouse Coordinates) */}
          <div
            ref={dotRef}
            className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 pointer-events-none will-change-transform"
          >
            <div
              className={`rounded-full transition-all duration-100 ${
                cursorType === 'text'
                  ? 'hidden'
                  : cursorType === 'pointer'
                  ? 'h-2 w-2 bg-red-400 shadow-[0_0_10px_#ef4444]'
                  : 'h-1.5 w-1.5 bg-red-500 shadow-[0_0_6px_#ef4444]'
              } ${isMouseDown ? 'scale-125 bg-white shadow-[0_0_12px_#ffffff]' : ''}`}
            />
          </div>

          {/* 4. Click Recoil Shockwave Ripples */}
          {ripples.map(r => (
            <div
              key={r.id}
              className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 rounded-full border border-red-500/80 animate-ping"
              style={{
                left: `${r.x}px`,
                top: `${r.y}px`,
                width: '36px',
                height: '36px',
                boxShadow: '0 0 16px rgba(239, 68, 68, 0.8)',
              }}
            />
          ))}
        </div>
      )}
    </>
  );
}
