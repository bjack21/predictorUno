import React, { memo } from 'react';
import { SPORTS } from '../constants';
import type { Sport } from '../types';

interface SportSelectorProps {
  selectedSport: string;
  onSelectSport: (sport: string) => void;
}

export const SportSelector: React.FC<SportSelectorProps> = memo(({ selectedSport, onSelectSport }) => {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {SPORTS.map((sport: Sport) => {
        const Icon = sport.icon;
        const isSelected = selectedSport === sport.name;
        return (
          <button
            key={sport.name}
            onClick={() => onSelectSport(sport.name)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
              isSelected
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30'
                : 'bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-stone-300'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{sport.name}</span>
          </button>
        );
      })}
    </div>
  );
});