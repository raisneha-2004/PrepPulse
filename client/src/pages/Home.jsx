import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  BookOpen,
  Code2,
  Users,
  Brain,
  Terminal,
  Cpu,
  Shuffle,
  Briefcase,
  GraduationCap,
  Play,
  RotateCcw,
  Layers,
  ArrowRight,
  Sliders,
  CheckCircle,
  HelpCircle,
  Clock,
  User,
  Target,
  ChevronDown,
  Sprout,
  Crown,
  Cloud,
  Smartphone,
  Search,
  Check,
  X,
  Leaf,
  Gauge,
  Flame,
  Bot
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useInterview } from '../context/InterviewContext.jsx';
import { generateQuestions } from '../api/client.js';
import { TopicChips } from '../components/TopicChips.jsx';
import { ResumeUploader } from '../components/ResumeUploader.jsx';
import { Spinner } from '../components/Loader.jsx';
import { ConfirmDialog } from '../components/ConfirmDialog.jsx';
import { Reveal } from '../components/Reveal.jsx';
import { RoleSelect } from '../components/RoleSelect.jsx';
import { DailyQuote } from '../components/DailyQuote.jsx';
import { ROLE_GROUPS } from '../data/roles.js';

const ROLES = [
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'AI / ML Engineer',
  'DevOps / Cloud Engineer',
  'Data Engineer',
  'Mobile Developer',
  'QA & Automation Engineer',
  'Product / Engineering Manager',
  'Custom'
];

const ROLE_CATEGORIES = [
  {
    category: 'Software Development',
    icon: Code2,
    roles: ['Full Stack Developer', 'Frontend Developer', 'Backend Developer']
  },
  {
    category: 'AI & Data',
    icon: Brain,
    roles: ['AI / ML Engineer', 'Data Engineer']
  },
  {
    category: 'Cloud & Infra',
    icon: Cloud,
    roles: ['DevOps / Cloud Engineer']
  },
  {
    category: 'Mobile & Quality',
    icon: Smartphone,
    roles: ['Mobile Developer', 'QA & Automation Engineer', 'Product / Engineering Manager']
  }
];

const LEVEL_CAPTIONS = {
  Intern: 'Fundamentals, basics and academic projects.',
  Fresher: 'Core concepts, project questions, no production experience expected.',
  Junior: 'Hands-on coding, debugging and real project work.',
  Mid: 'Design decisions, trade-offs and feature ownership.',
  Senior: 'System design, architecture and leadership.'
};

const getInitials = (name) => {
  if (!name || !name.trim()) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getFirstName = (name) => {
  if (!name || !name.trim()) return '';
  return name.trim().split(/\s+/)[0];
};

const EXPERIENCE_LEVELS = [
  {
    id: 'Intern',
    label: 'Intern / Student',
    sublabel: 'Learning phase',
    icon: GraduationCap
  },
  {
    id: 'Fresher',
    label: 'Fresher',
    sublabel: '0-1 yrs',
    icon: Sprout
  },
  {
    id: 'Junior',
    label: 'Junior',
    sublabel: '1-3 yrs',
    icon: Code2
  },
  {
    id: 'Mid',
    label: 'Mid-Level',
    sublabel: '3-5 yrs',
    icon: Briefcase
  },
  {
    id: 'Senior',
    label: 'Senior',
    sublabel: '5+ yrs',
    icon: Crown
  }
];

const INTERVIEW_TYPES = [
  {
    id: 'Technical',
    title: 'Technical',
    icon: Code2,
    desc: 'Core architecture, APIs, frameworks & best practices',
    color: 'from-blue-500 to-indigo-600',
    accent: '59, 130, 246',
    sample: 'How does the Node.js event loop handle async operations?'
  },
  {
    id: 'AI/ML',
    title: 'AI / ML',
    icon: Cpu,
    desc: 'Deep learning, LLMs, RAG, prompt tuning & MLOps',
    color: 'from-purple-500 to-indigo-600',
    accent: '139, 92, 246',
    sample: 'When would you choose RAG over fine-tuning?'
  },
  {
    id: 'Coding',
    title: 'Coding & DSA',
    icon: Terminal,
    desc: 'Algorithms, complexity, patterns & problem solving',
    color: 'from-emerald-500 to-teal-600',
    accent: '16, 185, 129',
    sample: 'Find the longest substring without repeating characters.'
  },
  {
    id: 'System Design',
    title: 'Behavioral',
    icon: Brain,
    desc: 'STAR method, leadership, problem resolution & culture',
    color: 'from-amber-500 to-orange-600',
    accent: '245, 158, 11',
    sample: 'Tell me about a time you handled a tough deadline.'
  },
  {
    id: 'HR',
    title: 'HR & Fit',
    icon: Users,
    desc: 'Background, motivation, teamwork & workplace scenarios',
    color: 'from-pink-500 to-rose-600',
    accent: '236, 72, 153',
    sample: 'Why do you want to join our company?'
  },
  {
    id: 'Mixed',
    title: 'Mixed / Comprehensive',
    icon: Shuffle,
    desc: 'Balanced combination of technical, system & situational',
    color: 'from-cyan-500 to-indigo-600',
    accent: '34, 211, 238',
    sample: 'A bit of everything, just like a real interview round.'
  }
];

const DomainCard = ({ type, isSelected, onSelect, index }) => {
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showRipple, setShowRipple] = useState(false);
  const Icon = type.icon;

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    e.currentTarget.style.setProperty('--mx', `${x}px`);
    e.currentTarget.style.setProperty('--my', `${y}px`);

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = window.matchMedia('(hover: none)').matches;

    if (!prefersReduced && !isTouch) {
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rx = -((y - centerY) / centerY) * 6;
      const ry = ((x - centerX) / centerX) * 6;
      setTilt({ rx, ry });
    }
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ rx: 0, ry: 0 });
  };

  useEffect(() => {
    if (isSelected) {
      setShowRipple(true);
      const timer = setTimeout(() => setShowRipple(false), 600);
      return () => clearTimeout(timer);
    }
  }, [isSelected]);

  const accentRgb = type.accent;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.07 }}
      role="radio"
      aria-checked={isSelected}
      tabIndex={0}
      onClick={onSelect}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          onSelect();
        }
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative p-4 sm:p-5 rounded-2xl text-left cursor-pointer select-none group focus:outline-none h-full flex flex-col transition-all duration-300 ${
        isSelected
          ? 'bg-[#0f172a]'
          : 'bg-white/80 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.12] hover:border-transparent'
      }`}
      style={{
        transformStyle: 'preserve-3d',
        transform:
          isHovered && (tilt.rx !== 0 || tilt.ry !== 0)
            ? `perspective(900px) rotateX(${tilt.rx.toFixed(2)}deg) rotateY(${tilt.ry.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`
            : isSelected
              ? 'translateY(-2px)'
              : 'none',
        transition: isHovered ? 'transform 0.15s ease-out' : 'transform 0.35s ease',
        boxShadow: isSelected
          ? `0 0 40px rgba(${accentRgb}, 0.3)`
          : 'none'
      }}
    >
      <AnimatePresence>
        {showRipple && (
          <motion.div
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 2.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute inset-0 rounded-2xl pointer-events-none z-0"
            style={{ backgroundColor: `rgba(${accentRgb}, 0.5)` }}
          />
        )}
      </AnimatePresence>

      {isSelected && (
        <div className="absolute inset-0 rounded-2xl pointer-events-none z-0 overflow-hidden">
            <div 
              className="absolute -inset-[50%] animate-[spin_4s_linear_infinite]"
              style={{
                background: `conic-gradient(from 0deg at 50% 50%, transparent 0%, rgba(${accentRgb}, 0.2) 25%, rgba(${accentRgb}, 1) 50%, rgba(${accentRgb}, 0.2) 75%, transparent 100%)`
              }}
            />
            <div className="absolute inset-[2px] rounded-2xl bg-[#0f172a]" />
        </div>
      )}

      {isSelected && (
        <div 
          className="absolute inset-[2px] rounded-2xl pointer-events-none z-0"
          style={{
            background: `radial-gradient(120% 120% at 50% 0%, rgba(${accentRgb}, 0.25) 0%, transparent 100%)`
          }}
        />
      )}

      <div
        className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"
        style={{
          background: `radial-gradient(300px circle at var(--mx, 50%) var(--my, 50%), rgba(${accentRgb}, 0.18), transparent 60%)`
        }}
      />
      
      {!isSelected && (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"
          style={{
            maskImage: `radial-gradient(300px circle at var(--mx, 50%) var(--my, 50%), black, transparent 60%)`,
            WebkitMaskImage: `radial-gradient(300px circle at var(--mx, 50%) var(--my, 50%), black, transparent 60%)`,
            border: `1px solid rgba(${accentRgb}, 1)`
          }}
        />
      )}

      <div
        className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"
        style={{
          background: `radial-gradient(circle at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,0.08) 0%, transparent 50%)`
        }}
      />

      <Icon
        className="absolute -bottom-3 -right-3 w-24 h-24 pointer-events-none -rotate-12 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-300 z-0"
        style={{ color: `rgb(${accentRgb})`, transform: 'translateZ(0px)' }}
      />

      <div className="relative z-10 flex items-center justify-between mb-3" style={{ transform: 'translateZ(20px)' }}>
        <div
          className="w-10 h-10 rounded-xl text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform"
          style={{ backgroundColor: `rgb(${accentRgb})` }}
        >
          <Icon className="w-5 h-5" />
        </div>

        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.4 }}
            className="w-6 h-6 rounded-full text-white flex items-center justify-center shadow-md"
            style={{ backgroundColor: `rgb(${accentRgb})` }}
          >
            <CheckCircle className="w-4 h-4" />
          </motion.div>
        )}
      </div>

      <div className="relative z-10 space-y-1 flex-grow" style={{ transform: 'translateZ(10px)' }}>
        <h3
          className={`text-sm font-bold transition-colors ${isSelected ? 'text-[#fff]' : 'text-slate-900 dark:text-white group-hover:text-indigo-400'}`}
        >
          {type.title}
        </h3>
        <p className={`text-xs leading-relaxed ${isSelected ? 'text-[#e5e7ff]' : 'text-slate-500 dark:text-[#a5a9d6]'}`}>
          {type.desc}
        </p>
      </div>

      <div
        className={`relative z-10 transition-all duration-300 ease-out overflow-hidden mt-auto ${
          isHovered || isSelected || isFocused
            ? 'max-h-24 opacity-100 pt-3'
            : 'max-h-0 opacity-0'
        }`}
        style={{ transform: 'translateZ(15px)' }}
      >
        <div
          className="p-2.5 rounded-xl border border-white/10 text-left backdrop-blur-sm"
          style={{
            background: `rgba(${accentRgb}, 0.08)`
          }}
        >
          <div
            className="text-[10px] font-extrabold uppercase tracking-wider mb-1"
            style={{ color: isSelected ? '#fff' : `rgb(${accentRgb})` }}
          >
            Sample Question
          </div>
          <div className={`text-xs italic leading-snug ${isSelected ? 'text-[#e5e7ff]' : 'text-slate-700 dark:text-[#e5e7ff]'}`}>
            "{type.sample}"
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const DIFFICULTY_CONFIG = [
  {
    id: 'Easy',
    label: 'Easy',
    icon: Leaf,
    accent: '16, 185, 129',
    caption: 'Basics and definitions, relaxed pace.'
  },
  {
    id: 'Medium',
    label: 'Medium',
    icon: Gauge,
    accent: '245, 158, 11',
    caption: 'Practical questions, what most interviews ask.'
  },
  {
    id: 'Hard',
    label: 'Hard',
    icon: Flame,
    accent: '244, 63, 94',
    caption: 'Deep dives, edge cases and trade-offs.'
  },
  {
    id: 'Mixed',
    label: 'Mixed',
    icon: Shuffle,
    accent: '34, 211, 238',
    caption: 'A blend of all levels, like a real round.'
  }
];

const QUESTION_COUNTS = [5, 10, 15];
const ROTATING_WORDS = ['Tech', 'Coding', 'HR', 'AI/ML', 'Behavioral'];

const ModeCard = ({
  modeId,
  title,
  desc,
  icon: Icon,
  accent,
  isSelected,
  onSelect,
  children
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--mx', `${x}px`);
    e.currentTarget.style.setProperty('--my', `${y}px`);
  };

  return (
    <div
      role="radio"
      aria-checked={isSelected}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          onSelect();
        }
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative p-5 rounded-2xl text-left border transition-all duration-300 cursor-pointer select-none group overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
        isSelected
          ? 'border-transparent shadow-xl'
          : 'bg-white/80 dark:bg-white/[0.04] border-slate-200/80 dark:border-white/[0.12] hover:border-slate-300 dark:hover:border-white/20'
      }`}
      style={{
        backgroundColor: isSelected ? `rgba(${accent}, 0.08)` : undefined,
        boxShadow: isSelected ? `0 14px 30px -8px rgba(${accent}, 0.35)` : undefined
      }}
    >
      {/* 1. Animated Conic Gradient Border for Selected State */}
      {isSelected && (
        <div
          className="absolute -inset-[1.5px] rounded-[17px] animate-conic-border pointer-events-none -z-10"
          style={{
            background: `conic-gradient(from var(--angle, 0deg) at 50% 50%, rgba(${accent}, 1) 0%, rgba(${accent}, 0.15) 35%, rgba(${accent}, 1) 70%, rgba(${accent}, 0.15) 100%)`
          }}
        />
      )}

      {/* 2. Cursor Spotlight Radial Glow */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-0"
        style={{
          background: `radial-gradient(280px circle at var(--mx, 50%) var(--my, 50%), rgba(${accent}, 0.16), transparent 70%)`
        }}
      />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between mb-2">
        <span
          className="text-sm sm:text-base font-bold flex items-center gap-2.5"
          style={{ color: isSelected ? `rgb(${accent})` : undefined }}
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, rgb(${accent}), rgba(${accent}, 0.8))`
            }}
          >
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-slate-900 dark:text-white font-extrabold">{title}</span>
        </span>

        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className="w-6 h-6 rounded-full text-white flex items-center justify-center shadow-md flex-shrink-0"
            style={{ backgroundColor: `rgb(${accent})` }}
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </motion.div>
        )}
      </div>

      <p className="relative z-10 text-xs text-slate-500 dark:text-[#a5a9d6] leading-relaxed mb-4">
        {desc}
      </p>

      {/* Live Preview Container */}
      <div className="relative z-10 p-3 rounded-xl bg-slate-900/70 dark:bg-black/40 border border-white/10 backdrop-blur-sm shadow-inner">
        {children}
      </div>
    </div>
  );
};

export const Home = () => {
  const navigate = useNavigate();
  const [wordIndex, setWordIndex] = useState(0);

  // Rotate hero domain keyword every 2.5s
  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const {
    config,
    setConfig,
    resumeData,
    setResumeData,
    startInterview,
    savedSessionAvailable,
    resumeActiveSession,
    discardActiveSession
  } = useInterview();

  const [isLoading, setIsLoading] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [customTopics, setCustomTopics] = useState([]);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [roleSearchQuery, setRoleSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  // Close role dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsRoleDropdownOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsRoleDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const filteredRoleCategories = useMemo(() => {
    if (!roleSearchQuery.trim()) return ROLE_CATEGORIES;
    const q = roleSearchQuery.trim().toLowerCase();
    return ROLE_CATEGORIES.map((cat) => ({
      ...cat,
      roles: cat.roles.filter((r) => r.toLowerCase().includes(q))
    })).filter((cat) => cat.roles.length > 0);
  }, [roleSearchQuery]);

  const handleRoleChange = (newRole) => {
    const oldRoleKey = Object.keys(ROLE_GROUPS).find(
      (k) => k.toLowerCase() === config.role?.toLowerCase()
    ) || 'General / Other';
    const oldSuggested = ROLE_GROUPS[oldRoleKey] || ROLE_GROUPS['General / Other'];

    const newRoleKey = Object.keys(ROLE_GROUPS).find(
      (k) => k.toLowerCase() === newRole?.toLowerCase()
    ) || 'General / Other';
    const newSuggested = ROLE_GROUPS[newRoleKey] || ROLE_GROUPS['General / Other'];

    // Keep any topic user added manually via custom input (or not belonging to old suggested)
    const preservedCustom = (config.topics || []).filter(
      (t) => !oldSuggested.includes(t) || customTopics.includes(t)
    );

    // Auto-select first 5 topics of new role + preserved custom topics
    const newSelectedTopics = Array.from(
      new Set([...newSuggested.slice(0, 5), ...preservedCustom])
    );

    setConfig((prev) => ({
      ...prev,
      role: newRole,
      customRole: newRole === 'Custom' ? prev.customRole : '',
      topics: newSelectedTopics
    }));
  };

  const handleResumeActive = () => {
    const resumed = resumeActiveSession();
    if (resumed) {
      toast.success('Interview session resumed!');
      navigate('/interview');
    }
  };

  const handleDiscardActive = () => {
    discardActiveSession();
    setShowDiscardConfirm(false);
    toast.success('Previous session discarded.');
  };

  const handleStart = async (e) => {
    e.preventDefault();

    const targetRole = config.role === 'Custom' ? config.customRole.trim() : config.role;
    if (!targetRole) {
      toast.error('Please specify a target role.');
      return;
    }

    setIsLoading(true);
    const loadingToastId = toast.loading('Generating tailored interview questions with AI...');

    try {
      // Prepare payload for /api/questions/generate
      const payload = {
        role: targetRole,
        experienceLevel: config.experienceLevel,
        interviewType: config.interviewType === 'System Design' ? 'Behavioral' : config.interviewType,
        topics: config.topics && config.topics.length > 0 ? config.topics : ['General'],
        difficulty: config.difficulty,
        count: Number(config.count) || 5,
        ...(resumeData ? { resumeData } : {})
      };

      const response = await generateQuestions(payload);
      toast.dismiss(loadingToastId);

      if (!response.questions || response.questions.length === 0) {
        throw new Error('No questions returned by AI model.');
      }

      // Initialize state and navigate
      startInterview(response.questions, config, resumeData);
      toast.success('Interview ready! Good luck.');
      navigate('/interview');
    } catch (error) {
      toast.dismiss(loadingToastId);
      console.error('Failed to generate questions:', error);
      toast.error(error.message || 'Failed to generate interview questions. Please verify your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-16 pt-6 sm:pt-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      {/* Resume Session Banner */}
      {savedSessionAvailable && (
        <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 border border-indigo-200 dark:border-indigo-800/80 rounded-3xl p-5 sm:p-6 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-600/20">
              <RotateCcw className="w-5 h-5 animate-spin-reverse" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Unfinished Interview Session Found
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-[#a5a9d6]">
                You have an in-progress interview saved in your browser.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setShowDiscardConfirm(true)}
              className="px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={handleResumeActive}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Resume Interview</span>
            </button>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <div className="relative isolate z-10 text-center flex flex-col gap-4 max-w-3xl mx-auto pt-7 sm:pt-10 lg:pt-12 pb-0">
        {/* Soft Radial Ambient Glow */}
        <div className="absolute -inset-x-20 -inset-y-12 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.2),transparent_70%)] blur-3xl pointer-events-none animate-soft-pulse" />

        {/* Premium Heading with Rotating Word & Animated Gradient (Entrance Delay 0s) */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] font-sans flex flex-wrap justify-center items-baseline gap-[0.3em]"
        >
          <span className="text-slate-900 dark:text-white">Ace Your Next</span>
          <span className="inline-flex items-baseline justify-center gap-[0.3em] font-extrabold drop-shadow-[0_0_25px_rgba(99,102,241,0.35)]">
            <span className="relative inline-block overflow-hidden align-baseline pb-1">
              <AnimatePresence mode="wait">
                <motion.span
                  key={ROTATING_WORDS[wordIndex]}
                  initial={{ y: 24, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -24, opacity: 0 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="inline-block bg-[linear-gradient(to_right,#6366f1,#a855f7,#fff,#22d3ee,#6366f1)] bg-[length:200%_auto] animate-shine-sweep bg-clip-text text-transparent"
                >
                  {ROTATING_WORDS[wordIndex]}
                </motion.span>
              </AnimatePresence>
            </span>
            <span className="bg-[linear-gradient(to_right,#6366f1,#a855f7,#fff,#22d3ee,#6366f1)] bg-[length:200%_auto] animate-shine-sweep bg-clip-text text-transparent pb-1">
              Interview
            </span>
          </span>
        </motion.h1>
        
        {/* Daily Motivation Quote Line */}
        <div className="relative z-20">
          <DailyQuote />
        </div>
      </div>

      {/* Main Configuration Glassmorphism Card (Entrance Delay 0.3s) */}
      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        onSubmit={handleStart}
        className="space-y-8"
      >
        <div className="relative bg-white/[0.95] dark:bg-[#0e1022]/[0.94] backdrop-blur-[16px] rounded-3xl p-6 sm:p-10 border border-purple-500/25 dark:border-purple-500/30 shadow-lg dark:shadow-[0_20px_60px_rgba(0,0,0,0.55),inset_0_0_0_1px_rgba(255,255,255,0.04)] text-[#1e1b4b] dark:text-white space-y-10">
          {/* Top Thin Gradient Border Accent */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 rounded-t-3xl" />

          {/* =========================================================
              Step 1: Candidate Profile & Target Role
             ========================================================= */}
          <div className="relative z-30">
            <Reveal>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.08 }}
                className="space-y-5 relative z-30"
              >
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-xs font-extrabold flex items-center justify-center shadow-md shadow-indigo-500/25 flex-shrink-0">
                  1
                </span>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Candidate Profile & Role
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-[#a5a9d6] pl-11">
                Set your candidate profile and desired job role.
              </p>
              <div className="h-px bg-gradient-to-r from-indigo-500/30 via-slate-200 dark:via-white/10 to-transparent mt-3" />
            </div>

            <div className="space-y-6 pt-1">
              {/* Name Input with Avatar Bubble */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-[#e5e7ff] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Candidate Name (Optional)</span>
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 flex items-center pointer-events-none">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-indigo-500/25 flex-shrink-0 select-none overflow-hidden">
                      <AnimatePresence mode="wait">
                        {getInitials(config.name) ? (
                          <motion.span
                            key={getInitials(config.name)}
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            {getInitials(config.name)}
                          </motion.span>
                        ) : (
                          <motion.div
                            key="user-icon"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <User className="w-4 h-4 text-white/90" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={config.name}
                    onChange={(e) => setConfig({ ...config, name: e.target.value })}
                    placeholder="e.g. Alex Morgan"
                    className="w-full pl-14 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/[0.12] bg-white/50 dark:bg-white/5 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder-white/45 focus:outline-none focus:border-indigo-400/80 dark:focus:border-[#8b5cf6] focus:ring-4 focus:ring-indigo-500/15 dark:focus:ring-[3px] dark:focus:ring-purple-500/25 transition-all duration-200"
                  />
                </div>
                <AnimatePresence>
                  {config.name.trim() && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.25 }}
                      className="text-xs text-indigo-500 dark:text-indigo-400 font-medium pl-1 flex items-center gap-1"
                    >
                      <span>Hi, {getFirstName(config.name)} 👋</span>
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Experience Level Growth Path */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-700 dark:text-[#e5e7ff] flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Experience Growth Path</span>
                </label>

                {/* Growth Path Container */}
                <div className="relative py-2">
                  {/* Background Connecting Track */}
                  <div className="absolute top-8 left-[10%] right-[10%] h-1 bg-slate-200 dark:bg-white/10 rounded-full z-0 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${(Math.max(0, EXPERIENCE_LEVELS.findIndex((l) => l.id === config.experienceLevel)) / (EXPERIENCE_LEVELS.length - 1)) * 100}%`
                      }}
                    />
                  </div>

                  {/* 5-Column Grid */}
                  <div
                    role="radiogroup"
                    aria-label="Experience Level"
                    className="grid grid-cols-5 relative z-10 gap-1 sm:gap-2"
                  >
                    {EXPERIENCE_LEVELS.map((level, idx) => {
                      const selectedIndex = Math.max(0, EXPERIENCE_LEVELS.findIndex((l) => l.id === config.experienceLevel));
                      const isSelected = config.experienceLevel === level.id;
                      const isPastOrCurrent = idx <= selectedIndex;
                      const Icon = level.icon;

                      return (
                        <div
                          key={level.id}
                          role="radio"
                          aria-checked={isSelected}
                          tabIndex={0}
                          onClick={() => setConfig({ ...config, experienceLevel: level.id })}
                          onKeyDown={(e) => {
                            if (e.key === ' ' || e.key === 'Enter') {
                              e.preventDefault();
                              setConfig({ ...config, experienceLevel: level.id });
                            } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                              e.preventDefault();
                              const nextIdx = Math.min(EXPERIENCE_LEVELS.length - 1, idx + 1);
                              setConfig({ ...config, experienceLevel: EXPERIENCE_LEVELS[nextIdx].id });
                            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                              e.preventDefault();
                              const prevIdx = Math.max(0, idx - 1);
                              setConfig({ ...config, experienceLevel: EXPERIENCE_LEVELS[prevIdx].id });
                            }
                          }}
                          className="flex flex-col items-center group cursor-pointer select-none focus:outline-none"
                        >
                          <div
                            className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                              isSelected
                                ? 'scale-115 bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/40 ring-4 ring-indigo-500/30 font-bold'
                                : isPastOrCurrent
                                  ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-500/40 hover:border-indigo-400 hover:scale-105'
                                  : 'bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600 border border-slate-200 dark:border-white/[0.12] hover:border-slate-400 dark:hover:border-white/20'
                            }`}
                          >
                            <Icon
                              className={`w-5 h-5 ${
                                isSelected
                                  ? 'text-white'
                                  : isPastOrCurrent
                                    ? 'text-indigo-400'
                                    : 'text-slate-500'
                              }`}
                            />
                            {isSelected && (
                              <span className="absolute -inset-1 rounded-full border border-indigo-400/40 animate-ping pointer-events-none opacity-40" />
                            )}
                          </div>

                          <div
                            className={`text-[11px] sm:text-xs font-bold mt-2 text-center transition-colors ${
                              isSelected
                                ? 'text-indigo-600 dark:text-indigo-400 font-extrabold'
                                : 'text-slate-700 dark:text-[#e5e7ff]'
                            }`}
                          >
                            {level.label}
                          </div>
                          <div className="hidden sm:block text-[10px] text-slate-400 dark:text-slate-500 text-center">
                            {level.sublabel}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Caption Card */}
                <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.12] text-center">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={config.experienceLevel}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.25 }}
                      className="text-xs text-slate-600 dark:text-[#e5e7ff] leading-relaxed"
                    >
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                        {config.experienceLevel}:
                      </span>{' '}
                      {LEVEL_CAPTIONS[config.experienceLevel] || LEVEL_CAPTIONS.Fresher}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>

                {/* Target Role Dropdown Component */}
                <RoleSelect config={config} setConfig={setConfig} handleRoleChange={handleRoleChange} />
              </div>

              {/* Live Summary Strip */}
              <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-200/60 dark:border-white/5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Profile Summary:
                </span>
                {config.name.trim() && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20">
                    <User className="w-3 h-3" />
                    <span>{config.name.trim()}</span>
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20">
                  <GraduationCap className="w-3 h-3" />
                  <span>{config.experienceLevel}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20">
                  <Target className="w-3 h-3" />
                  <span>
                    {config.role === 'Custom' && config.customRole
                      ? config.customRole
                      : config.role}
                  </span>
                </span>
              </div>
            </motion.div>
          </Reveal>
          </div>

          {/* =========================================================
              Step 2: Interview Domain & Type Cards
             ========================================================= */}
          <div className="relative z-0">
            <Reveal>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="space-y-5"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-xs font-extrabold flex items-center justify-center shadow-md shadow-indigo-500/25 flex-shrink-0">
                  2
                </span>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Interview Domain & Type
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-[#a5a9d6] pl-11">
                Choose the specialized domain for targeted questions.
              </p>
              <div className="h-px bg-gradient-to-r from-indigo-500/30 via-slate-200 dark:via-white/10 to-transparent mt-3" />
            </div>

            <div
              role="radiogroup"
              aria-label="Interview Type"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1"
            >
              {INTERVIEW_TYPES.map((type, index) => (
                <DomainCard
                  key={type.id}
                  type={type}
                  index={index}
                  isSelected={config.interviewType === type.id}
                  onSelect={() => setConfig({ ...config, interviewType: type.id })}
                />
              ))}
            </div>
          </motion.div>
          </Reveal>
          </div>

          {/* =========================================================
              Step 3: Focus Topics & Skills
             ========================================================= */}
          <div className="relative z-0">
            <Reveal>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.24 }}
            className="space-y-5"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-xs font-extrabold flex items-center justify-center shadow-md shadow-indigo-500/25 flex-shrink-0">
                  3
                </span>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Focus Topics & Skills
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-[#a5a9d6] pl-11">
                Filter question topics by specific competencies and tech stack.
              </p>
              <div className="h-px bg-gradient-to-r from-indigo-500/30 via-slate-200 dark:via-white/10 to-transparent mt-3" />
            </div>

            <div className="pt-1">
              <TopicChips
                role={config.role === 'Custom' ? config.customRole : config.role}
                selectedTopics={config.topics}
                onChange={(newTopics) => setConfig({ ...config, topics: newTopics })}
                customTopics={customTopics}
                setCustomTopics={setCustomTopics}
              />
            </div>
          </motion.div>
          </Reveal>
          </div>

          {/* =========================================================
              Step 4: Format, Difficulty & Interview Mode
             ========================================================= */}
          <div className="relative z-0">
            <Reveal>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.32 }}
            className="space-y-6"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-xs font-extrabold flex items-center justify-center shadow-md shadow-indigo-500/25 flex-shrink-0">
                  4
                </span>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Format, Difficulty & Interview Mode
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-[#a5a9d6] pl-11">
                Configure evaluation rigor and conversational AI dynamics.
              </p>
              <div className="h-px bg-gradient-to-r from-indigo-500/30 via-slate-200 dark:via-white/10 to-transparent mt-3" />
            </div>

            {/* Target Difficulty and Number of Questions Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-1">
              {/* 1. Target Difficulty Segmented Control with Sliding Pill */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-slate-700 dark:text-[#e5e7ff] flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Target Difficulty</span>
                </label>

                <div
                  role="radiogroup"
                  aria-label="Target Difficulty"
                  className="relative p-1.5 rounded-2xl bg-slate-100/90 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.12] grid grid-cols-4 gap-1 select-none"
                >
                  {DIFFICULTY_CONFIG.map((diff, idx) => {
                    const isSelected = config.difficulty === diff.id;
                    const Icon = diff.icon;
                    return (
                      <button
                        key={diff.id}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        tabIndex={0}
                        onClick={() => setConfig({ ...config, difficulty: diff.id })}
                        onKeyDown={(e) => {
                          if (e.key === ' ' || e.key === 'Enter') {
                            e.preventDefault();
                            setConfig({ ...config, difficulty: diff.id });
                          } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                            e.preventDefault();
                            const nextIdx = (idx + 1) % DIFFICULTY_CONFIG.length;
                            setConfig({ ...config, difficulty: DIFFICULTY_CONFIG[nextIdx].id });
                          } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                            e.preventDefault();
                            const prevIdx = (idx - 1 + DIFFICULTY_CONFIG.length) % DIFFICULTY_CONFIG.length;
                            setConfig({ ...config, difficulty: DIFFICULTY_CONFIG[prevIdx].id });
                          }
                        }}
                        className={`relative z-10 py-2.5 px-2 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer ${
                          isSelected
                            ? 'text-white'
                            : 'text-slate-600 dark:text-[#a5a9d6] hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {isSelected && (
                          <motion.div
                            layoutId="difficulty-pill"
                            transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                            className="absolute inset-0 rounded-xl -z-10"
                            style={{
                              background: `linear-gradient(135deg, rgba(${diff.accent}, 0.95), rgba(${diff.accent}, 0.8))`,
                              boxShadow: `0 4px 18px -2px rgba(${diff.accent}, 0.5)`
                            }}
                          />
                        )}
                        <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{diff.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Caption Card with Cross-Fade */}
                <div className="min-h-[2.5rem] px-3.5 py-2 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 flex items-center justify-center text-center">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={config.difficulty}
                      initial={{ opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -3 }}
                      transition={{ duration: 0.2 }}
                      className="text-xs text-slate-500 dark:text-[#a5a9d6] leading-relaxed"
                    >
                      <span
                        className="font-bold mr-1"
                        style={{
                          color: `rgb(${DIFFICULTY_CONFIG.find((d) => d.id === config.difficulty)?.accent || '99, 102, 241'})`
                        }}
                      >
                        {config.difficulty}:
                      </span>
                      {DIFFICULTY_CONFIG.find((d) => d.id === config.difficulty)?.caption}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>

              {/* 2. Number of Questions Cards */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-slate-700 dark:text-[#e5e7ff] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Number of Questions</span>
                </label>

                <div
                  role="radiogroup"
                  aria-label="Number of Questions"
                  className="grid grid-cols-3 gap-2.5 select-none"
                >
                  {QUESTION_COUNTS.map((cnt, idx) => {
                    const isSelected = config.count === cnt;
                    const estimatedMin = cnt * 2;
                    return (
                      <button
                        key={cnt}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        tabIndex={0}
                        onClick={() => setConfig({ ...config, count: cnt })}
                        onKeyDown={(e) => {
                          if (e.key === ' ' || e.key === 'Enter') {
                            e.preventDefault();
                            setConfig({ ...config, count: cnt });
                          } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                            e.preventDefault();
                            const nextIdx = (idx + 1) % QUESTION_COUNTS.length;
                            setConfig({ ...config, count: QUESTION_COUNTS[nextIdx] });
                          } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                            e.preventDefault();
                            const prevIdx = (idx - 1 + QUESTION_COUNTS.length) % QUESTION_COUNTS.length;
                            setConfig({ ...config, count: QUESTION_COUNTS[prevIdx] });
                          }
                        }}
                        className={`relative p-3.5 rounded-2xl flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 active:scale-[0.97] ${
                          isSelected
                            ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/35 ring-2 ring-indigo-400/80 ring-offset-1 dark:ring-offset-slate-900'
                            : 'bg-white/80 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.12] text-slate-700 dark:text-[#e5e7ff] hover:border-indigo-400/50 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                        <span className="text-2xl sm:text-3xl font-black tracking-tight leading-none mb-1">
                          {cnt}
                        </span>
                        <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1 ${isSelected ? 'text-indigo-100' : 'text-slate-400 dark:text-slate-500'}`}>
                          Questions
                        </span>
                        <span className={`text-[11px] font-semibold flex items-center gap-1 ${isSelected ? 'text-indigo-200' : 'text-slate-500 dark:text-[#a5a9d6]'}`}>
                          <Clock className="w-3 h-3" />
                          <span>~{estimatedMin} min</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 3. Interview Mode Cards with Live Interactive Previews */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold text-slate-700 dark:text-[#e5e7ff] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>Interview Mode</span>
              </label>

              <div
                role="radiogroup"
                aria-label="Interview Mode"
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {/* Practice Mode Card */}
                <ModeCard
                  modeId="practice"
                  title="Practice Mode"
                  desc="Static set of questions with instant multi-metric evaluation, strengths, improvements, and skipping allowed."
                  icon={Sliders}
                  accent="99, 102, 241"
                  isSelected={config.mode === 'practice'}
                  onSelect={() => setConfig({ ...config, mode: 'practice' })}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                      <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">Q1 • Core Algorithm</span>
                      <span className="text-emerald-400 font-mono font-bold">Score: 88%</span>
                    </div>

                    {/* Skeleton Question Shimmer Line */}
                    <div className="h-2 bg-indigo-200/40 dark:bg-white/20 rounded-full w-4/5 animate-pulse" />

                    {/* 3 Tiny Looping Score Bars */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center gap-2 text-[9px] text-slate-300 font-medium">
                        <span className="w-16 text-slate-400 font-semibold">Accuracy</span>
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-400 rounded-full animate-pulse" style={{ width: '92%' }} />
                        </div>
                        <span className="font-mono text-[9px] text-indigo-300 font-bold">92%</span>
                      </div>
                      <div className="flex items-center gap-2 text-[9px] text-slate-300 font-medium">
                        <span className="w-16 text-slate-400 font-semibold">Relevance</span>
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-violet-400 rounded-full animate-pulse" style={{ width: '85%' }} />
                        </div>
                        <span className="font-mono text-[9px] text-violet-300 font-bold">85%</span>
                      </div>
                      <div className="flex items-center gap-2 text-[9px] text-slate-300 font-medium">
                        <span className="w-16 text-slate-400 font-semibold">Clarity</span>
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-400 rounded-full animate-pulse" style={{ width: '78%' }} />
                        </div>
                        <span className="font-mono text-[9px] text-cyan-300 font-bold">78%</span>
                      </div>
                    </div>
                  </div>
                </ModeCard>

                {/* Mock Interview Mode Card */}
                <ModeCard
                  modeId="mock"
                  title="Mock Interview Mode"
                  desc="Live conversational interview simulation with adaptive AI follow-up questions and transcript memory."
                  icon={Sparkles}
                  accent="34, 211, 238"
                  isSelected={config.mode === 'mock'}
                  onSelect={() => setConfig({ ...config, mode: 'mock' })}
                >
                  <div className="space-y-2">
                    {/* Interviewer Chat Bubble */}
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-cyan-500/25 text-cyan-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Bot className="w-3 h-3" />
                      </div>
                      <div className="px-2.5 py-1.5 rounded-xl rounded-tl-sm bg-white/10 text-[10px] text-slate-200 leading-snug">
                        Can you walk me through your indexing strategy for this query?
                      </div>
                    </div>

                    {/* Candidate Chat Bubble */}
                    <div className="flex items-start justify-end gap-2">
                      <div className="px-2.5 py-1.5 rounded-xl rounded-tr-sm bg-indigo-600/90 text-[10px] text-white leading-snug shadow-sm">
                        I'd use a composite B-Tree index on (user_id, created_at)...
                      </div>
                      <div className="w-5 h-5 rounded-full bg-indigo-500/30 text-indigo-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <User className="w-3 h-3" />
                      </div>
                    </div>

                    {/* Typing Dots Animation */}
                    <div className="flex items-center gap-1 pl-7 pt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
                      <span className="text-[9px] text-cyan-400/80 font-mono ml-1">AI is thinking...</span>
                    </div>
                  </div>
                </ModeCard>
              </div>
            </div>
          </motion.div>
          </Reveal>
          </div>

          {/* =========================================================
              Step 5: Resume Customization
             ========================================================= */}
          <div className="relative z-0">
            <Reveal>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="space-y-5"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-xs font-extrabold flex items-center justify-center shadow-md shadow-indigo-500/25 flex-shrink-0">
                  5
                </span>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Resume Customization
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-[#a5a9d6] pl-11">
                Upload your resume PDF to extract skills and tailor questions.
              </p>
              <div className="h-px bg-gradient-to-r from-indigo-500/30 via-slate-200 dark:via-white/10 to-transparent mt-3" />
            </div>

            <div className="pt-1">
              <ResumeUploader resumeData={resumeData} setResumeData={setResumeData} />
            </div>
          </motion.div>
          </Reveal>
          </div>
        </div>

        {/* Bottom Footer Bar: Duration, Chips & Premium Start Button */}
        <Reveal>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5 pt-4 border-t border-slate-200/60 dark:border-white/5">
          {/* Left: Duration & Quick Configuration Chips */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-[#e5e7ff] bg-slate-100/80 dark:bg-white/[0.04] px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-white/[0.12] shadow-sm">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              <span>Estimated session: ~{config.count * 2} min</span>
            </div>

            {/* Questions Count Chip */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.12] text-slate-700 dark:text-[#e5e7ff]">
              <Layers className="w-3 h-3 text-indigo-500" />
              <span>{config.count} Questions</span>
            </span>

            {/* Difficulty Chip */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.12] text-slate-700 dark:text-[#e5e7ff]">
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: `rgb(${
                    DIFFICULTY_CONFIG.find((d) => d.id === config.difficulty)?.accent || '99, 102, 241'
                  })`
                }}
              />
              <span>{config.difficulty}</span>
            </span>
          </div>

          {/* Right: Start Button & Missing Requirement Notice */}
          <div className="flex flex-col items-end w-full sm:w-auto">
            <button
              type="submit"
              disabled={isLoading || (config.role === 'Custom' && !config.customRole.trim())}
              aria-live="polite"
              className="relative group overflow-hidden w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-base font-extrabold text-white bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 shadow-xl shadow-indigo-600/35 hover:shadow-indigo-600/50 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:opacity-45 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none min-w-[230px] cursor-pointer"
            >
              {/* Periodic 4s Shimmer Sweep */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
                <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 animate-periodic-shimmer" />
              </div>

              {isLoading ? (
                <div className="relative z-10 flex items-center gap-2.5">
                  <Spinner size="sm" className="text-white" />
                  <span>Preparing questions...</span>
                </div>
              ) : (
                <div className="relative z-10 flex items-center gap-2">
                  <span>Start Interview</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-200" />
                </div>
              )}
            </button>

            {/* Custom Role Missing Helper Warning */}
            {config.role === 'Custom' && !config.customRole.trim() && (
              <span className="text-[11px] text-amber-500 dark:text-amber-400 font-medium pt-1.5 pr-1">
                Please enter your custom role title to proceed
              </span>
            )}
          </div>
        </div>
        </Reveal>
      </motion.form>

      {/* Discard Session Confirm Dialog */}
      <ConfirmDialog
        isOpen={showDiscardConfirm}
        title="Discard Saved Session?"
        description="Are you sure you want to discard your previous in-progress interview? All unsaved progress will be lost."
        confirmText="Discard Session"
        cancelText="Keep"
        variant="danger"
        onConfirm={handleDiscardActive}
        onCancel={() => setShowDiscardConfirm(false)}
      />
    </div>
  );
};

