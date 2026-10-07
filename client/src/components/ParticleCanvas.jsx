import React, { useEffect, useRef } from 'react';

export const ParticleCanvas = ({ reduceMotion }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (reduceMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    
    let animationFrameId;
    let width, height;
    let particles = [];
    let mouse = { x: -1000, y: -1000 };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);

    const init = () => {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      const isMobile = width < 640;
      const count = isMobile ? 30 : 70;

      particles = Array.from({ length: count }).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 1.5 + 1,
        color: Math.random() > 0.5 ? '#8b5cf6' : '#3b82f6', // purple or blue
      }));
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Dark mode / Light mode check via class on document.documentElement
      const isDark = document.documentElement.classList.contains('dark');

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Mouse interaction
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < 150 * 150) {
          const force = (150 - Math.sqrt(distSq)) / 150;
          p.vx += dx * force * 0.0001;
          p.vy += dy * force * 0.0001;
        }

        // Apply velocity & friction
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off walls
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Limits to prevent particles from flying away
        p.vx = Math.max(-1, Math.min(1, p.vx));
        p.vy = Math.max(-1, Math.min(1, p.vy));

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        
        ctx.fillStyle = isDark ? p.color : 'rgba(139, 92, 246, 0.6)'; // Purple tint in light mode
        
        ctx.shadowBlur = isDark ? 8 : 0;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0; // reset
        
        // Draw lines
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const lx = p.x - p2.x;
          const ly = p.y - p2.y;
          const lDistSq = lx * lx + ly * ly;

          if (lDistSq < 120 * 120) {
            const dist = Math.sqrt(lDistSq);
            let alpha = (1 - dist / 120) * 0.25;
            
            // Brighten lines near mouse
            if (distSq < 150 * 150) {
              alpha += 0.2;
            }

            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = isDark ? `rgba(139, 92, 246, ${alpha})` : `rgba(139, 92, 246, ${alpha * 0.5})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(init, 200);
    };

    window.addEventListener('resize', handleResize);
    
    // Pause animation when tab is hidden
    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrameId);
      } else {
        animationFrameId = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    init();
    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
      cancelAnimationFrame(animationFrameId);
      clearTimeout(resizeTimer);
    };
  }, [reduceMotion]);

  if (reduceMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full opacity-80"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
};
