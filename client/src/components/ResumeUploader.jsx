import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  Trash2,
  Sparkles,
  ArrowDown,
  RefreshCw,
  Code2,
  Briefcase,
  Layers,
  Info,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import { parseResume } from '../api/client.js';

const PARSE_STEPS = [
  'Reading PDF text & structure',
  'Finding skills & frameworks',
  'Spotting projects & experience'
];

const formatBytes = (bytes, decimals = 1) => {
  if (!bytes || bytes <= 0) return '';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const ResumeUploader = ({ resumeData, setResumeData }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [parseStepIndex, setParseStepIndex] = useState(0);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  // Cycle through 3 parsing steps during loading state
  useEffect(() => {
    let timer;
    if (isLoading) {
      setParseStepIndex(0);
      timer = setInterval(() => {
        setParseStepIndex((prev) => (prev < PARSE_STEPS.length - 1 ? prev + 1 : prev));
      }, 1200);
    } else {
      setParseStepIndex(0);
    }
    return () => clearInterval(timer);
  }, [isLoading]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = async (file) => {
    setErrorMessage('');

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      const msg = 'Please upload a PDF document (.pdf)';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB limit
    if (file.size > maxSize) {
      const msg = 'PDF file size exceeds 5MB limit. Please upload a smaller file.';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    setFileName(file.name);
    setFileSize(file.size);
    setIsLoading(true);

    try {
      const data = await parseResume(file);
      setResumeData(data);
      setErrorMessage('');
      toast.success('Resume parsed successfully! Tailored topics extracted.');
    } catch (error) {
      console.error('Failed to parse resume:', error);
      const msg = error.message || 'Failed to parse resume PDF. Please check server connection.';
      setErrorMessage(msg);
      toast.error(msg);
      setResumeData(null);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    if (!resumeData) return;
    setResumeData({
      ...resumeData,
      skills: (resumeData.skills || []).filter((s) => s !== skillToRemove)
    });
  };

  const handleRemoveTechnology = (techToRemove) => {
    if (!resumeData) return;
    setResumeData({
      ...resumeData,
      technologies: (resumeData.technologies || []).filter((t) => t !== techToRemove)
    });
  };

  const handleRemoveProject = (projectToRemove) => {
    if (!resumeData) return;
    setResumeData({
      ...resumeData,
      projects: (resumeData.projects || []).filter((p) => {
        const pName = typeof p === 'string' ? p : p.name || p.title;
        const targetName = typeof projectToRemove === 'string' ? projectToRemove : projectToRemove.name || projectToRemove.title;
        return pName !== targetName;
      })
    });
  };

  const handleRemoveResume = () => {
    setResumeData(null);
    setFileName('');
    setFileSize(0);
    setErrorMessage('');
    toast.success('Resume removed.');
  };

  const handleTryAgain = () => {
    setErrorMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Helper for string representations of projects
  const getProjectLabel = (proj) => {
    if (typeof proj === 'string') return proj;
    return proj.name || proj.title || 'Project';
  };

  return (
    <div className="space-y-4">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Header with Title and Optional Tag */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Tailor from Resume</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            Optional
          </span>
        </label>
        {resumeData && (
          <button
            type="button"
            onClick={handleRemoveResume}
            className="text-xs font-semibold text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remove Resume</span>
          </button>
        )}
      </div>

      {/* 5 Dropzone States */}
      <AnimatePresence mode="wait">
        {/* =========================================================
            State 5: Error State
           ========================================================= */}
        {errorMessage && !isLoading && !resumeData && (
          <motion.div
            key="error-state"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            role="alert"
            aria-live="polite"
            className="p-6 rounded-2xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-center space-y-3 backdrop-blur-md shadow-sm"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-sm">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200">
                Upload Failed
              </h4>
              <p className="text-xs text-rose-700 dark:text-rose-300 max-w-md mx-auto leading-relaxed">
                {errorMessage}
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleTryAgain}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/25 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </button>
              <button
                type="button"
                onClick={() => setErrorMessage('')}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}

        {/* =========================================================
            State 3: Parsing State
           ========================================================= */}
        {isLoading && (
          <motion.div
            key="parsing-state"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            role="status"
            aria-live="polite"
            className="p-6 sm:p-8 rounded-2xl bg-white/70 dark:bg-white/[0.03] border border-indigo-200/80 dark:border-indigo-800/60 backdrop-blur-md text-center space-y-5 shadow-lg shadow-indigo-950/20"
          >
            {/* File Info Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-600 dark:text-indigo-300">
              <FileText className="w-3.5 h-3.5" />
              <span>
                {fileName} {fileSize > 0 && `• ${formatBytes(fileSize)}`}
              </span>
            </div>

            {/* Mini Document Skeleton with Horizontal Glowing Scan Line */}
            <div className="w-44 h-28 mx-auto relative rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 p-3 overflow-hidden space-y-2 select-none shadow-inner">
              <div className="w-1/3 h-2 rounded-full bg-indigo-300/60 dark:bg-indigo-400/30" />
              <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-white/10" />
              <div className="w-5/6 h-1.5 rounded-full bg-slate-200 dark:bg-white/10" />
              <div className="w-4/6 h-1.5 rounded-full bg-slate-200 dark:bg-white/10" />
              <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-white/10" />
              <div className="w-3/4 h-1.5 rounded-full bg-slate-200 dark:bg-white/10" />

              {/* Glowing Scan Line */}
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#22d3ee] animate-doc-scan pointer-events-none" />
            </div>

            {/* Gradient Progress Bar */}
            <div className="w-full max-w-xs mx-auto space-y-1.5">
              <div className="h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden relative">
                <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 animate-gradient-flow rounded-full w-full" />
              </div>
            </div>

            {/* 3 Steps Ticking off one by one */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 pt-1 text-xs">
              {PARSE_STEPS.map((step, idx) => {
                const isPassed = idx < parseStepIndex;
                const isCurrent = idx === parseStepIndex;
                return (
                  <div
                    key={step}
                    className={`flex items-center gap-1.5 transition-colors ${
                      isPassed
                        ? 'text-emerald-500 font-bold'
                        : isCurrent
                          ? 'text-indigo-600 dark:text-indigo-400 font-bold animate-pulse'
                          : 'text-slate-400 dark:text-slate-600'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                        isPassed
                          ? 'bg-emerald-500 text-white'
                          : isCurrent
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {isPassed ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : idx + 1}
                    </div>
                    <span>{step}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* =========================================================
            State 1 & 2: Idle & Drag Over Dropzone
           ========================================================= */}
        {!resumeData && !isLoading && !errorMessage && (
          <motion.div
            key="dropzone-idle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            role="button"
            tabIndex={0}
            aria-label="Upload Resume PDF dropzone"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            className={`relative rounded-2xl p-7 sm:p-9 text-center cursor-pointer select-none transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 group ${
              isDragging
                ? 'border-2 border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/40 ring-4 ring-indigo-500/20 scale-[1.02] shadow-xl shadow-indigo-500/20'
                : 'border-2 border-dashed border-slate-300 dark:border-white/15 bg-white/60 dark:bg-white/[0.03] backdrop-blur-md hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 hover:shadow-xl hover:shadow-indigo-500/10'
            }`}
          >
            <div className="flex flex-col items-center justify-center space-y-3.5">
              {/* Floating Tile Icon */}
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform duration-300 ${
                  isDragging
                    ? 'bg-gradient-to-tr from-cyan-500 to-indigo-600 scale-110 shadow-cyan-500/30'
                    : 'bg-gradient-to-tr from-indigo-500 to-violet-600 shadow-indigo-500/30 animate-soft-float group-hover:scale-105'
                }`}
              >
                {isDragging ? (
                  <ArrowDown className="w-7 h-7 animate-bounce" />
                ) : (
                  <UploadCloud className="w-7 h-7" />
                )}
              </div>

              <div className="space-y-1">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {isDragging ? (
                    <span className="text-indigo-600 dark:text-indigo-400 font-extrabold text-base">
                      Release to upload
                    </span>
                  ) : (
                    <>
                      Drop your resume PDF here, or{' '}
                      <span className="text-indigo-600 dark:text-indigo-400 underline font-extrabold">
                        browse
                      </span>
                    </>
                  )}
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
                  PDF up to 5MB. Questions are tailored to your real projects & skills.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* =========================================================
            State 4: Done / Parsed Result State
           ========================================================= */}
        {resumeData && !isLoading && (
          <motion.div
            key="done-state"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="p-5 sm:p-6 rounded-2xl bg-white/70 dark:bg-white/[0.03] border border-indigo-200/80 dark:border-white/10 backdrop-blur-md space-y-5 shadow-lg shadow-indigo-950/20"
          >
            {/* Top File Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/60 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/25 flex-shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-sm">
                      {fileName || 'Uploaded Resume'}
                    </h4>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Parsed</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {fileSize > 0 ? `${formatBytes(fileSize)} • ` : ''}
                    {resumeData.name ? `Candidate: ${resumeData.name}` : 'Personalized context ready'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Replace</span>
                </button>
                <button
                  type="button"
                  onClick={handleRemoveResume}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>

            {/* Extracted Chip Groups */}
            <div className="space-y-4">
              {/* 1. Skills Group */}
              {(resumeData.skills || []).length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Extracted Skills ({resumeData.skills.length})</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                    {resumeData.skills.map((skill, idx) => (
                      <motion.span
                        key={skill}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.15, delay: idx * 0.02 }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 shadow-sm"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="hover:text-rose-500 focus:outline-none cursor-pointer"
                          aria-label={`Remove skill ${skill}`}
                        >
                          <X className="w-3 h-3 stroke-[2.5]" />
                        </button>
                      </motion.span>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. Technologies Group */}
              {(resumeData.technologies || []).length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-cyan-500" />
                    <span>Technologies ({resumeData.technologies.length})</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                    {resumeData.technologies.map((tech, idx) => (
                      <motion.span
                        key={tech}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.15, delay: idx * 0.02 }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20 shadow-sm"
                      >
                        <span>{tech}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTechnology(tech)}
                          className="hover:text-rose-500 focus:outline-none cursor-pointer"
                          aria-label={`Remove technology ${tech}`}
                        >
                          <X className="w-3 h-3 stroke-[2.5]" />
                        </button>
                      </motion.span>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Projects Group */}
              {(resumeData.projects || []).length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-purple-500" />
                    <span>Projects ({resumeData.projects.length})</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                    {resumeData.projects.map((proj, idx) => {
                      const label = getProjectLabel(proj);
                      return (
                        <motion.span
                          key={label}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.15, delay: idx * 0.02 }}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 shadow-sm"
                        >
                          <span>{label}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveProject(proj)}
                            className="hover:text-rose-500 focus:outline-none cursor-pointer"
                            aria-label={`Remove project ${label}`}
                          >
                            <X className="w-3 h-3 stroke-[2.5]" />
                          </button>
                        </motion.span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Note banner */}
            <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 flex items-center gap-2 text-xs text-indigo-700 dark:text-indigo-300">
              <Info className="w-4 h-4 text-indigo-500 flex-shrink-0" />
              <span>Questions will include your project and skill based topics.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

