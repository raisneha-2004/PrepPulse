import React from 'react';
import { useReveal } from '../hooks/useReveal.js';

export const Reveal = ({ children, className = '', threshold = 0.15, delay = 0 }) => {
  const { ref, isRevealed } = useReveal({ threshold, triggerOnce: true });

  return (
    <div
      ref={ref}
      className={`transition-all duration-600 ease-out ${
        isRevealed
          ? 'opacity-100'
          : 'opacity-0 translate-y-6 pointer-events-none'
      } ${className}`}
      style={{
        transitionDelay: `${delay}ms`,
        transform: isRevealed ? 'none' : undefined
      }}
    >
      {children}
    </div>
  );
};

export default Reveal;
