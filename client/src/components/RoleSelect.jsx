import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, ChevronDown, Search, X, Check, Sparkles, Code2, Brain, Cloud, Smartphone } from 'lucide-react';

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

export const RoleSelect = ({ config, setConfig, handleRoleChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
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
    if (!searchQuery.trim()) return ROLE_CATEGORIES;
    const q = searchQuery.trim().toLowerCase();
    return ROLE_CATEGORIES.map((cat) => ({
      ...cat,
      roles: cat.roles.filter((r) => r.toLowerCase().includes(q))
    })).filter((cat) => cat.roles.length > 0);
  }, [searchQuery]);

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-slate-700 dark:text-[#e5e7ff] flex items-center gap-1.5">
        <Target className="w-3.5 h-3.5 text-indigo-500" />
        <span>Target Role</span>
      </label>

      <div className="relative z-50" ref={dropdownRef}>
        {/* Trigger Button */}
        <button
          type="button"
          id="role-select-trigger"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((prev) => !prev)}
          className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200/80 dark:border-white/[0.12] bg-slate-50/80 dark:bg-white/5 text-slate-800 dark:text-white focus:outline-none focus:border-indigo-400/80 focus:ring-4 focus:ring-indigo-500/15 transition-all duration-200 flex items-center justify-between cursor-pointer select-none shadow-sm"
        >
          <div className="flex items-center gap-2.5 truncate">
            <Target className="w-4 h-4 text-indigo-500 flex-shrink-0" />
            <span className="truncate font-medium text-slate-900 dark:text-white">
              {config.role === 'Custom'
                ? config.customRole
                  ? `Custom: ${config.customRole}`
                  : 'Custom Role'
                : config.role}
            </span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Dropdown Panel */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="absolute z-50 mt-2 w-full rounded-2xl bg-[#0b1020] border border-slate-200 dark:border-white/15 shadow-2xl shadow-indigo-950/80 ring-1 ring-black/50 p-2 space-y-2 max-h-72 overflow-y-auto"
            >
              {/* Search Input */}
              <div className="relative p-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter roles..."
                  className="w-full pl-9 pr-7 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-white/[0.12] bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Grouped Roles List */}
              <div role="listbox" aria-labelledby="role-select-trigger" className="space-y-3 pt-1">
                {filteredRoleCategories.map((group) => {
                  const GroupIcon = group.icon;
                  return (
                    <div key={group.category} className="space-y-1">
                      <div className="px-2.5 flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <GroupIcon className="w-3 h-3 text-indigo-400" />
                        <span>{group.category}</span>
                      </div>
                      <div className="space-y-0.5">
                        {group.roles.map((r) => {
                          const isSelected = config.role === r;
                          return (
                            <button
                              key={r}
                              type="button"
                              role="option"
                              aria-selected={isSelected}
                              onClick={() => {
                                handleRoleChange(r);
                                setIsOpen(false);
                                setSearchQuery('');
                              }}
                              className={`w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between transition-colors text-left cursor-pointer ${
                                isSelected
                                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                                  : 'text-slate-700 dark:text-[#e5e7ff] hover:bg-indigo-50/80 dark:hover:bg-white/5'
                              }`}
                            >
                              <span>{r}</span>
                              {isSelected && <Check className="w-4 h-4 stroke-[2.5]" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* Custom Role Option */}
                {(!searchQuery || 'custom role'.includes(searchQuery.toLowerCase())) && (
                  <div className="pt-1 border-t border-slate-200 dark:border-white/[0.12]">
                    <button
                      type="button"
                      role="option"
                      aria-selected={config.role === 'Custom'}
                      onClick={() => {
                        handleRoleChange('Custom');
                        setIsOpen(false);
                        setSearchQuery('');
                      }}
                      className={`w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between transition-colors text-left cursor-pointer ${
                        config.role === 'Custom'
                          ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold'
                          : 'text-slate-700 dark:text-[#e5e7ff] hover:bg-indigo-50/80 dark:hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Custom Role</span>
                      </div>
                      {config.role === 'Custom' && <Check className="w-4 h-4 stroke-[2.5]" />}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Custom Role Input */}
      <AnimatePresence>
        {config.role === 'Custom' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="pt-2 overflow-hidden"
          >
            <input
              type="text"
              value={config.customRole}
              onChange={(e) => setConfig({ ...config, customRole: e.target.value })}
              placeholder="Enter custom role title (e.g. iOS Developer, Cloud Architect)..."
              required
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-indigo-300 dark:border-indigo-600/50 bg-indigo-50/30 dark:bg-indigo-950/30 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/15 transition-all"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RoleSelect;
