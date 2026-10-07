import React, { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { TrendingUp, Award, Activity } from 'lucide-react';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 border border-slate-700/80 p-3 rounded-xl shadow-xl">
        <p className="text-xs text-slate-400 mb-1">{new Date(data.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
        <p className="text-sm font-bold text-white flex items-center gap-2">
          Score: <span className="text-indigo-400">{data.score}</span>
        </p>
        <p className="text-xs text-slate-500 mt-1">Role: {data.role}</p>
      </div>
    );
  }
  return null;
};

export const ScoreChart = ({ sessions }) => {
  const [range, setRange] = useState('30'); // '7', '30', 'all'
  const [roleFilter, setRoleFilter] = useState('All');

  const filteredData = useMemo(() => {
    let data = [...sessions].sort((a, b) => new Date(a.date) - new Date(b.date));

    if (roleFilter !== 'All') {
      data = data.filter(s => s.role === roleFilter);
    }

    if (range !== 'all') {
      const days = parseInt(range, 10);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      data = data.filter(s => new Date(s.date) >= cutoff);
    }

    // Format dates for XAxis
    return data.map(s => ({
      ...s,
      displayDate: new Date(s.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    }));
  }, [sessions, range, roleFilter]);

  const uniqueRoles = useMemo(() => {
    const roles = new Set(sessions.map(s => s.role));
    return ['All', ...Array.from(roles)];
  }, [sessions]);

  const stats = useMemo(() => {
    if (!filteredData.length) return { avg: 0, best: 0, total: 0 };
    const total = filteredData.length;
    const best = Math.max(...filteredData.map(s => s.score));
    const avg = Math.round(filteredData.reduce((sum, s) => sum + s.score, 0) / total);
    return { avg, best, total };
  }, [filteredData]);

  if (sessions.length === 0) {
    return (
      <div className="bg-white/5 dark:bg-slate-900/40 backdrop-blur-md rounded-3xl p-8 text-center border border-slate-200 dark:border-slate-800">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Pehla session complete karo!</h3>
        <p className="text-slate-500 dark:text-slate-400 mb-6">Pehla session complete karo aur apni progress yahan dekho.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0b1020]/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-indigo-500/10 shadow-soft space-y-6">
      
      {/* Filters & Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-500" />
          Score Progress
        </h2>

        <div className="flex items-center gap-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {uniqueRoles.map(r => (
              <option key={r} value={r}>{r === 'All' ? 'All Roles' : r}</option>
            ))}
          </select>

          <div className="flex bg-slate-100 dark:bg-slate-900 rounded-lg p-0.5 border border-slate-300 dark:border-slate-700">
            {['7', '30', 'all'].map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  range === r
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {r === 'all' ? 'All' : `${r}D`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10 rounded-2xl p-4 flex flex-col justify-center">
          <span className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5"><Activity className="w-3.5 h-3.5"/> Average</span>
          <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{stats.avg}</span>
        </div>
        <div className="bg-purple-50/50 dark:bg-purple-500/5 border border-purple-100 dark:border-purple-500/10 rounded-2xl p-4 flex flex-col justify-center">
          <span className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5"><Award className="w-3.5 h-3.5"/> Best Score</span>
          <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{stats.best}</span>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl p-4 flex flex-col justify-center">
          <span className="text-xs text-slate-500 dark:text-slate-400 mb-1">Total Sessions</span>
          <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{stats.total}</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[280px] w-full mt-4">
        {filteredData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-slate-800/60" />
              <XAxis dataKey="displayDate" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} dy={10} minTickGap={20} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} dx={-10} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '3 3' }} />
              <Area 
                type="monotone" 
                dataKey="score" 
                stroke="#818cf8" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorScore)" 
                activeDot={{ r: 6, fill: '#818cf8', stroke: '#fff', strokeWidth: 2, style: { filter: 'drop-shadow(0 0 8px rgba(129,140,248,0.8))' } }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
            No data for selected filters
          </div>
        )}
      </div>

    </div>
  );
};
