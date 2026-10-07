import React, { useState, useEffect } from 'react';

const SNIPPETS = [
  'console.log("Hello World");',
  'git commit -m "first commit"',
  'SELECT * FROM users;'
];

const Typewriter = ({ snippets, delay = 0 }) => {
  const [text, setText] = useState('');
  const [snippetIdx, setSnippetIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timeoutId;
    
    // Initial delay
    if (delay > 0 && text === '' && !isDeleting && snippetIdx === 0) {
      timeoutId = setTimeout(() => {
        // start typing
      }, delay);
      // Let's just handle delay by starting index 0 with a timeout, wait, it's easier to just use standard typing interval
    }

    const currentSnippet = snippets[snippetIdx];
    
    if (isDeleting) {
      if (text === '') {
        setIsDeleting(false);
        setSnippetIdx((prev) => (prev + 1) % snippets.length);
      } else {
        timeoutId = setTimeout(() => {
          setText(text.slice(0, -1));
        }, 50);
      }
    } else {
      if (text === currentSnippet) {
        timeoutId = setTimeout(() => {
          setIsDeleting(true);
        }, 3000); // pause before delete
      } else {
        timeoutId = setTimeout(() => {
          setText(currentSnippet.slice(0, text.length + 1));
        }, 100);
      }
    }

    return () => clearTimeout(timeoutId);
  }, [text, isDeleting, snippetIdx, snippets, delay]);

  return (
    <span className="font-mono text-[10px] sm:text-xs text-indigo-300 dark:text-indigo-200">
      {text}
      <span className="animate-pulse">_</span>
    </span>
  );
};

export const CodeCards = ({ reduceMotion }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const cards = isMobile ? [
    { top: '65%', left: '5%', delay: '0s', typeDelay: 0 }
  ] : [
    { top: '20%', left: '5%', delay: '0s', typeDelay: 0 },
    { top: '60%', left: '80%', delay: '-4s', typeDelay: 2000 },
    { top: '80%', left: '15%', delay: '-8s', typeDelay: 4000 }
  ];

  if (reduceMotion) return null;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="absolute animate-card-float will-change-transform opacity-50"
          style={{ top: card.top, left: card.left, animationDelay: card.delay }}
        >
          <div className="w-[180px] sm:w-[220px] rounded-lg bg-[#0f172a]/60 dark:bg-[#0b1020]/80 backdrop-blur-md border border-purple-500/30 shadow-lg shadow-purple-500/10 overflow-hidden">
            {/* MacOS-like header */}
            <div className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border-b border-white/5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            </div>
            <div className="p-3">
              <Typewriter snippets={SNIPPETS} delay={card.typeDelay} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
