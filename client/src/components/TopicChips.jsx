import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Check, ChevronDown, Search, Sparkles, AlertCircle, CornerDownLeft, Cpu, Globe, Brain, Cloud, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  ROLE_GROUPS,
  getMoreTopics
} from '../data/roles.js';
import './TopicChips.css';

const MAX_SELECTED_TOPICS = 12;

export const TopicChips = ({
  selectedTopics = [],
  onChange,
  role = 'Full Stack Developer',
  customTopics = [],
  setCustomTopics
}) => {
  const [customInput, setCustomInput] = useState('');
  const [isCustomFocused, setIsCustomFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [panelSearch, setPanelSearch] = useState('');
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const CATEGORY_STYLES = {
    'CS Fundamentals': { class: 'cat-purple', icon: Cpu },
    'Web': { class: 'cat-blue', icon: Globe },
    'AI & Data': { class: 'cat-pink', icon: Brain },
    'Cloud & DevOps': { class: 'cat-cyan', icon: Cloud },
    'Mobile & QA': { class: 'cat-green', icon: Smartphone }
  };

  // Determine current role key and its suggested topics
  const roleKey = useMemo(() => {
    const matched = Object.keys(ROLE_GROUPS).find(
      (k) => k.toLowerCase() === role?.toLowerCase()
    );
    return matched || 'General / Other';
  }, [role]);

  const roleDisplayName = useMemo(() => {
    if (!role || role === 'Custom') return 'Selected Role';
    return role;
  }, [role]);

  const suggestedTopics = useMemo(() => {
    return ROLE_GROUPS[roleKey] || ROLE_GROUPS['General / Other'];
  }, [roleKey]);

  // Curated more topic groups with role's own suggested topics excluded
  const baseMoreTopics = useMemo(() => {
    return getMoreTopics(role);
  }, [role]);

  // Total more topics count before search query filtering
  const totalMoreCount = useMemo(() => {
    let count = 0;
    Object.values(baseMoreTopics).forEach((topics) => {
      count += topics.length;
    });
    return count;
  }, [baseMoreTopics]);

  // Handle toggling an existing topic
  const toggleTopic = (topic) => {
    const isSelected = selectedTopics.includes(topic);
    if (isSelected) {
      onChange(selectedTopics.filter((t) => t !== topic));
    } else {
      if (selectedTopics.length >= MAX_SELECTED_TOPICS) {
        toast.error(`You can select up to ${MAX_SELECTED_TOPICS} topics.`);
        return;
      }
      onChange([...selectedTopics, topic]);
    }
  };

  // Add custom topic
  const handleAddCustom = (e) => {
    if (e) e.preventDefault();
    const trimmed = customInput.trim();
    if (!trimmed) return;

    if (trimmed.length > 40) {
      toast.error('Topic name cannot exceed 40 characters.');
      return;
    }

    const isDuplicate = selectedTopics.some(
      (t) => t.toLowerCase() === trimmed.toLowerCase()
    );

    if (isDuplicate) {
      toast.error(`"${trimmed}" is already selected.`);
      setCustomInput('');
      return;
    }

    if (selectedTopics.length >= MAX_SELECTED_TOPICS) {
      toast.error(`You can select up to ${MAX_SELECTED_TOPICS} topics.`);
      return;
    }

    const updated = [...selectedTopics, trimmed];
    onChange(updated);
    if (setCustomTopics) {
      setCustomTopics((prev) => Array.from(new Set([...prev, trimmed])));
    }
    setCustomInput('');
    toast.success(`Added "${trimmed}" to focus topics.`);
  };

  const removeTopic = (topicToRemove) => {
    onChange(selectedTopics.filter((t) => t !== topicToRemove));
    if (setCustomTopics) {
      setCustomTopics((prev) => prev.filter((t) => t !== topicToRemove));
    }
  };

  // Select all visible suggested topics
  const selectAllSuggested = () => {
    const filteredSuggested = suggestedTopics.filter((t) =>
      searchQuery
        ? t.toLowerCase().includes(searchQuery.toLowerCase())
        : true
    );

    const combined = Array.from(new Set([...selectedTopics, ...filteredSuggested]));
    if (combined.length > MAX_SELECTED_TOPICS) {
      const limited = combined.slice(0, MAX_SELECTED_TOPICS);
      onChange(limited);
      toast.error(`Selected up to the ${MAX_SELECTED_TOPICS} topic limit.`);
    } else {
      onChange(combined);
    }
  };

  // Clear all suggested topics from current selection
  const clearSuggested = () => {
    onChange(selectedTopics.filter((t) => !suggestedTopics.includes(t)));
  };

  // Filter topics by search query
  const queryClean = searchQuery.trim().toLowerCase();

  const filteredSuggested = useMemo(() => {
    if (!queryClean) return suggestedTopics;
    return suggestedTopics.filter((t) => t.toLowerCase().includes(queryClean));
  }, [suggestedTopics, queryClean]);

  // Identify custom-added topics (topics in selectedTopics not present in role's suggested list)
  const customSelectedTopics = useMemo(() => {
    return selectedTopics.filter((t) => !suggestedTopics.includes(t));
  }, [selectedTopics, suggestedTopics]);

  const panelQueryClean = panelSearch.trim().toLowerCase();

  // Filtered categories for the "More Topics" drawer using panelSearch
  const moreCategories = useMemo(() => {
    const result = {};
    Object.entries(baseMoreTopics).forEach(([categoryName, topics]) => {
      let filtered = topics;
      if (panelQueryClean) {
        filtered = filtered.filter((t) => t.toLowerCase().includes(panelQueryClean));
      }
      if (filtered.length > 0) {
        result[categoryName] = filtered;
      }
    });
    return result;
  }, [baseMoreTopics, panelQueryClean]);

  const isMaxReached = selectedTopics.length >= MAX_SELECTED_TOPICS;

  return (
    <div className="space-y-6">
      {/* 1. Header with 12-Segment Meter and Live Filter Search */}
      <div className="p-4 rounded-2xl bg-white/70 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 backdrop-blur-md space-y-3.5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Label + Count + Max Badge */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Selected Focus Topics</span>
            </span>

            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold tracking-wide transition-colors ${
                isMaxReached
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                  : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
              }`}
            >
              {selectedTopics.length} / {MAX_SELECTED_TOPICS}
            </span>

            {isMaxReached && (
              <motion.span
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/40 shadow-sm"
              >
                <AlertCircle className="w-3 h-3" />
                <span>Max reached</span>
              </motion.span>
            )}
          </div>

          {/* Live Filter Search Input (Only shown when there are > 20 more topics) */}
          {totalMoreCount > 20 && (
            <div className="relative w-full sm:w-60">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <Search className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter topics..."
                className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/90 dark:bg-white/5 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/15 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* 12-Segment Visual Meter */}
        <div
          role="progressbar"
          aria-valuenow={selectedTopics.length}
          aria-valuemin={0}
          aria-valuemax={MAX_SELECTED_TOPICS}
          aria-label="Selected topics progress"
          className="grid grid-cols-12 gap-1 sm:gap-1.5 pt-1"
        >
          {Array.from({ length: MAX_SELECTED_TOPICS }).map((_, index) => {
            const isFilled = index < selectedTopics.length;
            return (
              <div
                key={index}
                className="h-2 sm:h-2.5 rounded-full relative overflow-hidden bg-slate-200/80 dark:bg-white/10"
              >
                {isFilled && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className={`absolute inset-0 rounded-full origin-left ${
                      isMaxReached
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                        : 'bg-gradient-to-r from-indigo-500 to-violet-600 shadow-[0_0_6px_rgba(99,102,241,0.5)]'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Part A: Suggested for Selected Role */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Suggested for {roleDisplayName}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={selectAllSuggested}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer"
            >
              Select All
            </button>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <button
              type="button"
              onClick={clearSuggested}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Suggested Chips Container */}
        <div className="flex flex-wrap gap-2">
          {filteredSuggested.map((topic) => {
            const isSelected = selectedTopics.includes(topic);
            return (
              <button
                key={topic}
                type="button"
                aria-pressed={isSelected}
                onClick={() => toggleTopic(topic)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer select-none active:scale-[0.97] hover:-translate-y-0.5 ${
                  isSelected
                    ? isMaxReached
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/30 ring-2 ring-amber-400 ring-offset-1 dark:ring-offset-slate-900'
                      : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/35 ring-2 ring-indigo-500/90 ring-offset-1 dark:ring-offset-slate-900'
                    : 'bg-white/80 dark:bg-white/5 text-slate-700 dark:text-slate-300 border border-slate-200/90 dark:border-white/10 hover:border-indigo-400/60 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 hover:shadow-sm'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                <span>{topic}</span>
              </button>
            );
          })}

          {filteredSuggested.length === 0 && (
            <p className="text-xs text-slate-400 dark:text-slate-500 py-1.5">
              No suggested topics match "{searchQuery}".
            </p>
          )}
        </div>
      </div>

      {/* Custom Selected Topics (if any) */}
      {customSelectedTopics.length > 0 && (
        <div className="space-y-2.5 pt-1">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Custom Added Topics
          </span>
          <div className="flex flex-wrap gap-2">
            {customSelectedTopics.map((topic) => (
              <span
                key={topic}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-indigo-600/25 ring-2 ring-violet-500/80 ring-offset-1 dark:ring-offset-slate-900 hover:-translate-y-0.5 transition-transform"
              >
                <span>{topic}</span>
                <button
                  type="button"
                  onClick={() => removeTopic(topic)}
                  className="hover:bg-white/25 p-0.5 rounded-md transition-colors focus:outline-none cursor-pointer"
                  aria-label={`Remove custom topic ${topic}`}
                >
                  <X className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Part B: More Topics Collapsible Accordion (NEW DESIGN) */}
      {totalMoreCount > 0 && (
        <div className="more-topics-panel">
          {/* Header Toggle */}
          <button
            type="button"
            aria-expanded={isMoreOpen}
            onClick={() => setIsMoreOpen((prev) => !prev)}
            className="w-full px-5 py-4 flex items-center justify-between text-left transition-colors cursor-pointer select-none"
          >
            <div className="flex items-center gap-3">
              <span className="text-[0.95rem] font-bold text-white dark:text-slate-100">
                Explore More Topics
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-sm">
                {totalMoreCount}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ChevronDown
                className={`w-5 h-5 text-indigo-400 transition-transform duration-300 ${
                  isMoreOpen ? 'rotate-180 text-purple-400' : ''
                }`}
              />
            </div>
          </button>

          {/* Divider */}
          <div className="more-topics-divider" />

          {/* Body */}
          <AnimatePresence initial={false}>
            {isMoreOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="p-5 pt-4 space-y-6">
                  
                  {/* Search & Actions */}
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="relative flex-1 min-w-[200px]">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Search className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={panelSearch}
                        onChange={(e) => setPanelSearch(e.target.value)}
                        placeholder="Search topics..."
                        className="w-full pl-9 pr-8 py-2 text-sm rounded-xl border border-white/10 bg-white/5 text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      />
                      {panelSearch && (
                        <button
                          type="button"
                          onClick={() => setPanelSearch('')}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <button 
                      type="button" 
                      className="panel-clear-btn"
                      onClick={() => onChange(selectedTopics.filter(t => !Object.values(moreCategories).flat().includes(t)))}
                    >
                      Clear all
                    </button>
                  </div>

                  {/* Categories */}
                  <div className="space-y-0">
                    {Object.entries(moreCategories).map(([category, topics], idx) => {
                      const style = CATEGORY_STYLES[category] || { class: 'cat-purple', icon: Sparkles };
                      const Icon = style.icon;
                      const allSelected = topics.every(t => selectedTopics.includes(t));
                      
                      return (
                        <React.Fragment key={category}>
                          <div className={`space-y-3 ${style.class}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full flex items-center justify-center bg-[var(--cat-color)]/20 text-[var(--cat-color)]">
                                  <Icon className="w-4 h-4" />
                                </div>
                                <h4 className="cat-header-label font-bold text-xs">
                                  {category}
                                </h4>
                                <span className="px-1.5 py-[1px] rounded bg-[var(--cat-color)]/20 text-[var(--cat-color)] text-[10px] font-bold">
                                  {topics.length}
                                </span>
                              </div>
                              <button 
                                type="button"
                                className="cat-select-btn"
                                onClick={() => {
                                  if (allSelected) {
                                    onChange(selectedTopics.filter(t => !topics.includes(t)));
                                  } else {
                                    const combined = Array.from(new Set([...selectedTopics, ...topics]));
                                    if (combined.length > MAX_SELECTED_TOPICS) {
                                      onChange(combined.slice(0, MAX_SELECTED_TOPICS));
                                      toast.error(`Selected up to ${MAX_SELECTED_TOPICS} topics limit.`);
                                    } else {
                                      onChange(combined);
                                    }
                                  }
                                }}
                              >
                                {allSelected ? 'Deselect all' : 'Select all'}
                              </button>
                            </div>
                            
                            <div className="flex flex-wrap gap-2.5">
                              {topics.map((topic, tIdx) => {
                                const isSelected = selectedTopics.includes(topic);
                                return (
                                  <motion.button
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: tIdx * 0.04 }}
                                    key={topic}
                                    type="button"
                                    onClick={() => toggleTopic(topic)}
                                    className={`explore-chip ${isSelected ? 'selected' : ''}`}
                                  >
                                    {isSelected ? (
                                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                                    ) : (
                                      <div className="accent-dot" />
                                    )}
                                    <span>{topic}</span>
                                  </motion.button>
                                );
                              })}
                            </div>
                          </div>
                          {idx < Object.entries(moreCategories).length - 1 && (
                            <div className="cat-divider" />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Custom Topic Input with Enter hint */}
      <div className="space-y-1.5">
        <div className="relative flex gap-2">
          <input
            type="text"
            value={customInput}
            maxLength={40}
            onFocus={() => setIsCustomFocused(true)}
            onBlur={() => setIsCustomFocused(false)}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddCustom(e);
              }
            }}
            placeholder="Add custom topic (e.g. Redis, WebSockets, Kafka, Microfrontends)..."
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-white/5 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/15 transition-all shadow-sm"
          />
          <button
            type="button"
            onClick={handleAddCustom}
            disabled={!customInput.trim() || isMaxReached}
            className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add</span>
          </button>
        </div>

        {/* Focus & Enter Hint */}
        <AnimatePresence>
          {isCustomFocused && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-1.5 text-[11px] text-indigo-500 dark:text-indigo-400 pl-1 font-medium"
            >
              <CornerDownLeft className="w-3 h-3" />
              <span>Press Enter ↵ to quickly add to topics list</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

