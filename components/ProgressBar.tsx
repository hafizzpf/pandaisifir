import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  colorClass?: string;
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, total, colorClass = "bg-green-500", label }) => {
  const percentage = Math.min(100, Math.max(0, (current / total) * 100));

  return (
    <div className="w-full">
      {label && <div className="text-xs font-bold uppercase text-gray-500 mb-1">{label}</div>}
      <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden shadow-inner">
        <div 
          className={`h-full ${colorClass} transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};