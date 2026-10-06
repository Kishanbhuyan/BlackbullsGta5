import React, { useEffect, useRef } from 'react';

export function EmberCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Respect user's motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      return;
    }

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    interface Particle {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      opacity: number;
      color: string;
      maxLife: number;
      life: number;
    }

    const particleCount = 45;
    const particles: Particle[] = [];
    const colors = [
      'rgba(239, 68, 68, ',   // bright red
      'rgba(220, 38, 38, ',   // blood red
      'rgba(249, 115, 22, ',  // warm spark amber
      'rgba(185, 28, 28, ',   // deep red
    ];

    function createParticle(initialY?: number): Particle {
      const colorBase = colors[Math.floor(Math.random() * colors.length)];
      return {
        x: Math.random() * width,
        y: initialY !== undefined ? initialY : height + Math.random() * 20,
        size: Math.random() * 2.5 + 0.8,
        speedY: -(Math.random() * 0.9 + 0.3),
        speedX: (Math.random() - 0.45) * 0.5,
        opacity: Math.random() * 0.6 + 0.3,
        color: colorBase,
        maxLife: Math.random() * 250 + 150,
        life: 0,
      };
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(createParticle(Math.random() * height));
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.life++;
        p.y += p.speedY;
        p.x += p.speedX;

        // Fade in and out
        const lifeRatio = p.life / p.maxLife;
        let currentOpacity = p.opacity;
        if (lifeRatio < 0.2) {
          currentOpacity = (lifeRatio / 0.2) * p.opacity;
        } else if (lifeRatio > 0.7) {
          currentOpacity = ((1 - lifeRatio) / 0.3) * p.opacity;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${Math.max(0, currentOpacity)})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(239, 68, 68, 0.8)';
        ctx.fill();

        if (p.life >= p.maxLife || p.y < -10 || p.x < -10 || p.x > width + 10) {
          particles[i] = createParticle();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-70"
      aria-hidden="true"
    />
  );
}
