import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { GraduationCap, History, Home, PlayCircle } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle.jsx';
import { useInterview } from '../context/InterviewContext.jsx';
import { getStreak } from '../utils/stats.js';

export const Navbar = () => {
  const location = useLocation();
  const { status, activeInterviewId } = useInterview();
  const [scrolled, setScrolled] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const [streakData, setStreakData] = useState({ streak: 0, todayComplete: false });

  useEffect(() => {
    const updateStreak = () => setStreakData(getStreak());
    updateStreak();
    window.addEventListener('history-updated', updateStreak);
    return () => window.removeEventListener('history-updated', updateStreak);
  }, []);

  const isInterviewActive = status === 'in_progress' && activeInterviewId;

  // Track scroll position for dynamic glass darkening & shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    {
      to: '/',
      label: 'Setup',
      icon: Home,
      end: true
    },
    {
      to: '/history',
      label: 'History',
      icon: History,
      end: false
    }
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full backdrop-blur-md transition-all duration-300 ${
        scrolled
          ? 'bg-[#030712]/85 shadow-lg shadow-black/25'
          : 'bg-[#030712]/60 shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand (Left) */}
          <Link
            to="/"
            className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl px-2 py-1 -ml-2"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-lg bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-700 dark:from-white dark:via-indigo-200 dark:to-indigo-400 bg-clip-text text-transparent">
                PrepPulse
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                Interview Prep
              </span>
            </div>
          </Link>

          {/* Right-Side Navigation Area */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Active Live Session Indicator (if active) */}
            {isInterviewActive && (
              <Link
                to="/interview"
                className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                  location.pathname === '/interview'
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/30 ring-2 ring-indigo-500/50'
                    : 'bg-indigo-950/70 text-indigo-300 border border-indigo-500/30 hover:border-indigo-400/60 hover:bg-indigo-900/60'
                }`}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <PlayCircle className="w-3.5 h-3.5" />
                <span>Live Session</span>
              </Link>
            )}

            {/* Glass Pill Container for Nav Links */}
            <nav
              aria-label="Main Navigation"
              className="relative flex items-center bg-white/5 backdrop-blur-md border border-white/10 rounded-full p-1 shadow-inner shadow-black/20"
            >
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isCurrentActive = item.end
                  ? location.pathname === item.to
                  : location.pathname.startsWith(item.to);

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    aria-current={isCurrentActive ? 'page' : undefined}
                    className="relative px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2 rounded-full group focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1 focus:ring-offset-[#030712] transition-colors z-10 select-none"
                  >
                    {/* Animated Sliding Pill Indicator */}
                    {isCurrentActive && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full shadow-lg shadow-indigo-500/30 -z-10"
                        transition={
                          prefersReducedMotion
                            ? { duration: 0 }
                            : { type: 'spring', stiffness: 380, damping: 30 }
                        }
                      />
                    )}

                    <Icon
                      className={`w-4 h-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:-rotate-6 ${
                        isCurrentActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                      }`}
                    />
                    <span
                      className={`hidden sm:inline ${
                        isCurrentActive
                          ? 'text-white font-semibold'
                          : 'text-slate-400 group-hover:text-white'
                      }`}
                    >
                      {item.label}
                    </span>
                  </NavLink>
                );
              })}
            </nav>

            {/* Streak Badge */}
            <div className="group relative hidden sm:block">
              <motion.div
                key={streakData.streak}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border backdrop-blur-md transition-all cursor-default select-none ${
                  streakData.streak > 0
                    ? 'bg-purple-500/10 border-purple-500/30 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.15)]'
                    : 'bg-slate-500/10 border-slate-500/20 text-slate-400'
                }`}
              >
                <span className="text-sm drop-shadow-md">🔥</span>
                <span>{streakData.streak}</span>
              </motion.div>
              
              {/* Tooltip */}
              <div className="absolute top-full right-0 mt-2 w-max px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl text-xs text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                <div className="font-semibold text-white mb-0.5">{streakData.streak}-day streak</div>
                <div className={streakData.todayComplete ? "text-emerald-400" : "text-amber-400"}>
                  {streakData.todayComplete ? 'Aaj ka goal complete ✓' : 'Aaj ka goal: 1 session'}
                </div>
              </div>
            </div>

            {/* Separate Round Glass Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Thin Gradient Bottom Border Line */}
      <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent pointer-events-none" />
    </header>
  );
};
