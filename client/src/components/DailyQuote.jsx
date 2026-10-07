import React, { useState, useEffect } from 'react';
import { Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import { quotes } from '../data/quotes.js';
import './DailyQuote.css';

export const DailyQuote = () => {
  const [quote, setQuote] = useState({ text: '', author: '' });
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    // Check reduced motion
    const checkMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(checkMotion.matches);
    const handler = (e) => setReduceMotion(e.matches);
    checkMotion.addEventListener('change', handler);

    // Calculate daily quote index based on local timezone
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 0);
    const diff = today - startOfYear;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    
    const index = dayOfYear % quotes.length;
    setQuote(quotes[index]);

    return () => checkMotion.removeEventListener('change', handler);
  }, []);

  // Typewriter effect only for quote text
  useEffect(() => {
    if (!quote.text) return;
    
    if (reduceMotion) {
      setDisplayedText(quote.text);
      setIsTyping(false);
      return;
    }

    setDisplayedText('');
    setIsTyping(true);
    let i = 0;
    
    const typeInterval = setInterval(() => {
      setDisplayedText(quote.text.slice(0, i + 1));
      i++;
      if (i >= quote.text.length) {
        clearInterval(typeInterval);
        setIsTyping(false);
      }
    }, 30);

    return () => clearInterval(typeInterval);
  }, [quote, reduceMotion]);

  const handleCopy = () => {
    navigator.clipboard.writeText(`"${quote.text}" — ${quote.author}`);
    toast.success('Copied ✓');
  };

  if (!quote.text) return null;

  return (
    <div className="dq-wrapper group">
      <span className="dq-icon">✨</span>
      <span className="dq-text">
        "{displayedText}"{isTyping && <span className="dq-cursor">_</span>}
      </span>
      <span className="dq-author"> — {quote.author}</span>
      <button 
        onClick={handleCopy} 
        className="dq-copy-btn"
        aria-label="Copy Quote"
        title="Copy"
      >
        <Copy className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
