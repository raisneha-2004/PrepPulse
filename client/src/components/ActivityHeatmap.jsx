import React, { useMemo } from 'react';
import { Calendar } from 'lucide-react';

export const ActivityHeatmap = ({ dailyCounts }) => {
  const WEEKS = 12;
  const DAYS = 7;

  // Generate the grid data
  const gridData = useMemo(() => {
    const today = new Date();
    // Start from the most recent Sunday to keep alignment
    const currentDayOfWeek = today.getDay(); // 0 is Sunday
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + (6 - currentDayOfWeek)); // Push to next Saturday to complete the week

    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - (WEEKS * DAYS) + 1);

    const grid = Array.from({ length: DAYS }, () => Array(WEEKS).fill(null));
    const monthLabels = [];

    let current = new Date(startDate);
    for (let col = 0; col < WEEKS; col++) {
      if (current.getDate() <= 7) {
        monthLabels.push({ col, label: current.toLocaleString('default', { month: 'short' }) });
      }
      for (let row = 0; row < DAYS; row++) {
        const dateStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
        const count = dailyCounts[dateStr] || 0;
        
        let colorClass = 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700/50';
        if (count === 1) colorClass = 'bg-indigo-300 dark:bg-indigo-900/60 border-indigo-400 dark:border-indigo-800/80';
        if (count === 2) colorClass = 'bg-indigo-400 dark:bg-indigo-700 border-indigo-500 dark:border-indigo-600';
        if (count >= 3) colorClass = 'bg-indigo-500 dark:bg-indigo-500 border-indigo-600 dark:border-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.6)]';

        // Do not render days in the future
        const isFuture = current > today;
        
        grid[row][col] = {
          dateStr,
          count,
          colorClass: isFuture ? 'bg-transparent border-transparent' : colorClass,
          displayDate: current.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
          isFuture
        };

        current.setDate(current.getDate() + 1);
      }
    }
    return { grid, monthLabels };
  }, [dailyCounts]);

  return (
    <div className="bg-white dark:bg-[#0b1020]/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-indigo-500/10 shadow-soft">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
        <Calendar className="w-5 h-5 text-indigo-500" />
        Activity Heatmap
      </h2>

      <div className="overflow-x-auto pb-4">
        <div className="min-w-max">
          {/* Month labels */}
          <div className="flex text-xs text-slate-500 dark:text-slate-400 mb-2 relative h-4">
            {gridData.monthLabels.map(({ col, label }, i) => (
              <span key={i} className="absolute" style={{ left: `${col * (12 + 4) + 24}px` }}>
                {label}
              </span>
            ))}
          </div>

          <div className="flex">
            {/* Day labels */}
            <div className="flex flex-col gap-1 pr-2 text-[10px] text-slate-500 dark:text-slate-400 pt-1 justify-between h-[108px]">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
            </div>

            {/* Grid */}
            <div className="flex gap-1">
              {Array.from({ length: WEEKS }).map((_, col) => (
                <div key={col} className="flex flex-col gap-1">
                  {gridData.grid.map((row, rIdx) => {
                    const cell = row[col];
                    if (!cell || cell.isFuture) return <div key={rIdx} className="w-3 h-3 rounded-sm" />;
                    return (
                      <div className="group relative" key={rIdx}>
                        <div className={`w-3 h-3 rounded-sm border ${cell.colorClass} transition-all`} />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-slate-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          {cell.count} session{cell.count !== 1 ? 's' : ''} on {cell.displayDate}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 mt-4 text-xs text-slate-500 dark:text-slate-400 ml-6">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm border bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700/50" />
              <div className="w-3 h-3 rounded-sm border bg-indigo-300 dark:bg-indigo-900/60 border-indigo-400 dark:border-indigo-800/80" />
              <div className="w-3 h-3 rounded-sm border bg-indigo-400 dark:bg-indigo-700 border-indigo-500 dark:border-indigo-600" />
              <div className="w-3 h-3 rounded-sm border bg-indigo-500 dark:bg-indigo-500 border-indigo-600 dark:border-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
            </div>
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
};
