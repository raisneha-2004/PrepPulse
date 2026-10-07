import React, { useEffect, useState } from 'react';
import { Database, GitBranch, Code2, Terminal, Server, LayoutTemplate } from 'lucide-react';

const TOPIC_POOL = [
  'HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 'SQL', 'MongoDB',
  'Git', 'GitHub', 'API', 'Docker', 'Linux', 'TypeScript', 'Express', 'Next.js', 'Tailwind',
  'Arrays', 'Loops', 'Strings', 'OOP', 'Functions', 'Debugging', 'Teamwork', 'Resume'
];

const CODE_SYMBOLS = ['{', '}', '</>', ';', '=>', '[]', '()'];

const getRandomIcon = () => {
  const icons = [Database, GitBranch, Code2, Terminal, Server, LayoutTemplate, null, null, null];
  return icons[Math.floor(Math.random() * icons.length)];
};

export const NeuralBackground = () => {
  const [chips, setChips] = useState([]);
  const [symbols, setSymbols] = useState([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    // Generate layout
    const isMobile = window.innerWidth < 640;
    const laneCount = isMobile ? 3 : 6; // Max chips per side
    
    const generatedChips = [];
    const shuffledTopics = [...TOPIC_POOL].sort(() => 0.5 - Math.random());
    
    for(let side=0; side<2; side++) {
      for(let lane=0; lane<laneCount; lane++) {
        const isLeft = side === 0;
        // left: 2% to 16%, right: 84% to 98%
        const xPos = isLeft ? 2 + (lane * (14/laneCount)) : 84 + (lane * (14/laneCount));
        
        generatedChips.push({
          id: `${side}-${lane}`,
          topic: shuffledTopics.pop() || 'Code',
          x: xPos,
          isLeft,
          duration: 18 + Math.random() * 10, // 18-28s
          delay: -(Math.random() * 28), // start anywhere in the animation loop
          opacity: 0.35 + Math.random() * 0.25,
          Icon: getRandomIcon()
        });
      }
    }
    setChips(generatedChips);

    // Generate falling code symbols
    const genSymbols = Array.from({ length: isMobile ? 8 : 16 }).map((_, i) => ({
      id: `sym-${i}`,
      char: CODE_SYMBOLS[Math.floor(Math.random() * CODE_SYMBOLS.length)],
      x: Math.random() * 100,
      duration: 20 + Math.random() * 20,
      delay: -(Math.random() * 40),
      size: 14 + Math.random() * 24
    }));
    setSymbols(genSymbols);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      // parallax calculation (max 10px movement)
      const x = (e.clientX / window.innerWidth - 0.5) * -20;
      const y = (e.clientY / window.innerHeight - 0.5) * -20;
      setMousePos({ x, y });
    };
    
    // Only apply parallax on desktop
    if (window.innerWidth >= 1024) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
    }
    
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#030712] pointer-events-none select-none">
      
      {/* 1. Large Blurred Drifting Orbs */}
      <div className="absolute top-[10%] left-[10%] w-[40vw] h-[40vw] bg-purple-600/20 rounded-full blur-[80px] sm:blur-[120px] mix-blend-screen animate-orb-drift-1 will-change-transform" />
      <div className="absolute top-[30%] right-[10%] w-[35vw] h-[35vw] bg-blue-600/20 rounded-full blur-[80px] sm:blur-[120px] mix-blend-screen animate-orb-drift-2 will-change-transform" />
      <div className="absolute bottom-[10%] left-[40%] w-[45vw] h-[45vw] bg-indigo-600/20 rounded-full blur-[80px] sm:blur-[120px] mix-blend-screen animate-orb-drift-3 will-change-transform" />
      
      {/* 2. Parallax Container for Chips & Rain */}
      <div 
        className="absolute inset-0 transition-transform duration-300 ease-out will-change-transform"
        style={{ transform: `translate3d(${mousePos.x}px, ${mousePos.y}px, 0)` }}
      >
        {/* Code Rain */}
        {symbols.map(sym => (
          <div
            key={sym.id}
            className="absolute text-slate-400 font-mono opacity-[0.08] animate-code-fall will-change-transform"
            style={{
              left: `${sym.x}%`,
              fontSize: `${sym.size}px`,
              animationDuration: `${sym.duration}s`,
              animationDelay: `${sym.delay}s`,
            }}
          >
            {sym.char}
          </div>
        ))}

        {/* Floating Glass Chips in Lanes */}
        {chips.map(chip => {
          const Icon = chip.Icon;
          return (
            <div
              key={chip.id}
              className="absolute bottom-[-10%] px-[14px] py-[6px] rounded-full flex items-center gap-2 border border-purple-500/35 bg-indigo-500/8 backdrop-blur-[8px] shadow-[0_0_15px_rgba(139,92,246,0.15)] animate-chip-float will-change-transform"
              style={{
                left: `${chip.x}%`,
                opacity: chip.opacity,
                animationDuration: `${chip.duration}s`,
                animationDelay: `${chip.delay}s`,
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
              {Icon && <Icon className="w-3.5 h-3.5 text-indigo-300/80" />}
              <span className="text-xs font-medium text-indigo-100/90 whitespace-nowrap">
                {chip.topic}
              </span>
            </div>
          );
        })}
      </div>

      {/* 3. Smooth Radial Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(3,7,18,0.7)_100%)] pointer-events-none" />
    </div>
  );
};

export default NeuralBackground;
