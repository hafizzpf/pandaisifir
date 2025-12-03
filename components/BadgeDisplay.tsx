import React from 'react';
import { Award } from 'lucide-react';

interface BadgeDisplayProps {
  badges: string[];
}

export const BadgeDisplay: React.FC<BadgeDisplayProps> = ({ badges }) => {
  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 justify-center mt-4">
      {badges.map((badge, idx) => (
        <div key={idx} className="bg-yellow-100 border-2 border-yellow-400 text-yellow-800 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-sm animate-bounce-slow" style={{ animationDelay: `${idx * 0.2}s` }}>
          <Award size={14} />
          {badge}
        </div>
      ))}
    </div>
  );
};