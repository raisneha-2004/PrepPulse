import React, { useEffect, useState, useRef } from 'react';
import { ParticleCanvas } from './ParticleCanvas.jsx';
import { CodeCards } from './CodeCards.jsx';

const CHIP_WORDS = [
  'HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'Python', 'Java', 
  'SQL', 'Git', 'API', 'Arrays', 'Loops', 'OOP'
];

export const Background = () => {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [chips, setChips] = useState([]);
  const [stars, setStars] = useState([]);

  useEffect(() => {
    const checkMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(checkMotion.matches);
    const handler = (e) => setReduceMotion(e.matches);
    checkMotion.addEventListener('change', handler);
    return () => checkMotion.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    
    // Lerped spotlight for desktop
    let currentX = -1000;
    let currentY = -1000;
    let targetX = -1000;
    let targetY = -1000;
    let animId;

    const onMouseMove = (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    const updateSpotlight = () => {
      currentX += (targetX - currentX) * 0.2;
      currentY += (targetY - currentY) * 0.2;
      setMousePos({ x: currentX, y: currentY });
      animId = requestAnimationFrame(updateSpotlight);
    };

    if (window.innerWidth >= 1024) {
      window.addEventListener('mousemove', onMouseMove, { passive: true });
      animId = requestAnimationFrame(updateSpotlight);
    }
    
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animId);
    };
  }, [reduceMotion]);

  useEffect(() => {
    // Generate chips using grid-slot system
    const isMobile = window.innerWidth < 640;
    const generatedChips = [];
    const shuffled = [...CHIP_WORDS].sort(() => 0.5 - Math.random());
    
    // Screen divided into left/right blocks and vertical slots
    // Left: 5% - 20%, Right: 80% - 95%
    // Slots: 5 vertical slots (0 to 4)
    for (let i = 0; i < (isMobile ? 6 : 10); i++) {
      if (shuffled.length === 0) break;
      const isLeft = i % 2 === 0;
      const slot = Math.floor(i / 2); // 0, 1, 2, 3, 4
      
      const baseY = 10 + (slot * 18); // 10%, 28%, 46%, 64%, 82%
      const jitterX = (Math.random() - 0.5) * 4; // +/- 2%
      const jitterY = (Math.random() - 0.5) * 8; // +/- 4%
      
      const x = isLeft ? 10 + jitterX : 85 + jitterX;
      const y = baseY + jitterY;

      generatedChips.push({
        id: i,
        word: shuffled.pop(),
        x,
        y,
        delay: -(Math.random() * 10),
        duration: 10 + Math.random() * 5
      });
    }
    setChips(generatedChips);

    // Shooting stars spawner
    if (!reduceMotion && !isMobile) {
      const spawnStar = () => {
        const id = Date.now();
        const startX = Math.random() * window.innerWidth;
        setStars(prev => [...prev, { id, x: startX }]);
        setTimeout(() => {
          setStars(prev => prev.filter(s => s.id !== id));
        }, 1500); // Wait for animation to finish
      };

      const starInterval = setInterval(() => {
        if (Math.random() > 0.3) spawnStar();
      }, 6000); // roughly every 6-10s
      
      return () => clearInterval(starInterval);
    }
  }, [reduceMotion]);

  const isDark = document.documentElement.classList.contains('dark');
  const blurValue = window.innerWidth < 640 ? '50px' : '90px';

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none select-none bg-slate-50 dark:bg-[#030712]">
      
      {/* 1. Aurora Waves */}
      <div 
        className="absolute top-[10%] left-[10%] w-[50vw] h-[50vw] bg-purple-500/15 rounded-full mix-blend-screen dark:mix-blend-lighten animate-aurora-1 will-change-transform"
        style={{ filter: `blur(${blurValue})` }} 
      />
      <div 
        className="absolute top-[30%] right-[10%] w-[45vw] h-[45vw] bg-indigo-500/15 rounded-full mix-blend-screen dark:mix-blend-lighten animate-aurora-2 will-change-transform"
        style={{ filter: `blur(${blurValue})` }}
      />
      <div 
        className="absolute bottom-[10%] left-[40%] w-[55vw] h-[55vw] bg-violet-500/15 rounded-full mix-blend-screen dark:mix-blend-lighten animate-aurora-3 will-change-transform"
        style={{ filter: `blur(${blurValue})` }}
      />

      {/* 2. Particle Network Canvas */}
      <ParticleCanvas reduceMotion={reduceMotion} />

      {/* 3. Floating Code Cards */}
      <CodeCards reduceMotion={reduceMotion} />

      {/* 4. Chips (Grid Slots) */}
      <div className="absolute inset-0">
        {chips.map(chip => (
          <div
            key={chip.id}
            className="absolute px-3 py-1.5 rounded-full flex items-center gap-2 border border-purple-500/30 bg-purple-500/10 backdrop-blur-[8px] shadow-[0_0_10px_rgba(139,92,246,0.1)] animate-card-float will-change-transform"
            style={{
              left: `${chip.x}%`,
              top: `${chip.y}%`,
              animationDuration: `${chip.duration}s`,
              animationDelay: `${chip.delay}s`,
              animationPlayState: reduceMotion ? 'paused' : 'running',
              opacity: isDark ? 0.6 : 0.8
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_6px_rgba(168,85,247,0.8)]" />
            <span className="text-[11px] sm:text-xs font-semibold text-purple-900 dark:text-purple-100/90 whitespace-nowrap">
              {chip.word}
            </span>
          </div>
        ))}
      </div>

      {/* 5. Spotlight */}
      {!reduceMotion && window.innerWidth >= 1024 && (
        <div 
          className="absolute w-[400px] h-[400px] rounded-full bg-purple-500/15 pointer-events-none blur-[60px]"
          style={{
            left: mousePos.x - 200,
            top: mousePos.y - 200,
          }}
        />
      )}

      {/* 6. Shooting Stars */}
      <div className="absolute inset-0 overflow-hidden">
        {stars.map(star => (
          <div
            key={star.id}
            className="absolute w-[2px] h-[120px] bg-gradient-to-b from-white to-transparent opacity-0 animate-shooting-star"
            style={{
              left: `${star.x}px`,
              top: '-120px',
              transform: 'rotate(-45deg)'
            }}
          />
        ))}
      </div>

    </div>
  );
};
