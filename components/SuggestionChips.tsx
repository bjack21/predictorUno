import React, { memo } from 'react';
import type { Prediction } from '../types';

interface SuggestionChipsProps {
  prediction: Prediction;
  onSelect: (suggestion: string) => void;
}

export const SuggestionChips: React.FC<SuggestionChipsProps> = memo(({ prediction, onSelect }) => {
  const suggestions = [
    `Tell me more about ${prediction.winner}'s key players.`,
    `What is ${prediction.loser}'s recent form?`,
    `What's the head-to-head history between these two teams?`,
    `Why is your confidence level "${prediction.confidence}"?`
  ];

  return (
    <div className="w-full max-w-2xl mx-auto mt-4 animate-fade-in">
        <div className="flex flex-wrap justify-center gap-2">
            {suggestions.map((text, index) => (
                <button
                    key={index}
                    onClick={() => onSelect(text)}
                    className="px-3 py-1.5 text-xs font-semibold bg-gray-700/50 text-slate-300 rounded-full hover:bg-purple-600/50 hover:text-purple-300 border border-gray-700 transition-all duration-200"
                >
                    {text}
                </button>
            ))}
        </div>
    </div>
  );
});
