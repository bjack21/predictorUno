import React, { useState, memo } from 'react';
import type { PropBet } from '../types';
import { TicketIcon, TrashIcon, AnalyticsIcon } from './Icons';

interface PickSlipProps {
  picks: PropBet[];
  onRemove: (prop: PropBet) => void;
  onAnalyze: () => void;
}

export const PickSlip: React.FC<PickSlipProps> = memo(({ picks, onRemove, onAnalyze }) => {
  const [isOpen, setIsOpen] = useState(false);
  const maxPicks = 5;

  if (picks.length === 0) {
    return null;
  }

  return (
    <>
        {/* Collapsed FAB */}
        <button
            onClick={() => setIsOpen(!isOpen)}
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-3 rounded-full shadow-2xl hover:scale-105 transition-all duration-300 border border-purple-400/50 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
        >
            <TicketIcon className="w-6 h-6" />
            <span className="font-bold text-lg">{picks.length}</span>
        </button>

        {/* Expanded Slip Panel */}
        <div 
            className={`fixed bottom-6 right-6 z-50 w-80 bg-[#161b22] border border-gray-700 rounded-2xl shadow-2xl flex flex-col transition-all duration-300 transform origin-bottom-right ${
                isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
            }`}
        >
            {/* Header */}
            <div 
                className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 p-4 rounded-t-2xl border-b border-gray-700 flex justify-between items-center cursor-pointer"
                onClick={() => setIsOpen(false)}
            >
                <div className="flex items-center gap-2">
                    <TicketIcon className="w-5 h-5 text-purple-400" />
                    <h3 className="font-bold text-white">My Pick Slip</h3>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-purple-300 bg-purple-900/50 px-2 py-0.5 rounded-full border border-purple-500/30">
                        {picks.length} / {maxPicks}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-slate-400">
                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                </div>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                {picks.map((prop, idx) => {
                     const isMore = prop.type === 'MORE';
                     return (
                        <div key={`${prop.player}-${prop.stat}-${idx}`} className="bg-[#0d1117] rounded-lg p-3 border border-gray-800 flex justify-between items-center group">
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-200">{prop.player}</span>
                                <div className="text-xs text-slate-400 flex items-center gap-1">
                                    <span className={`font-bold ${isMore ? 'text-green-400' : 'text-red-400'}`}>
                                        {prop.type}
                                    </span>
                                    <span>{prop.line} {prop.stat}</span>
                                </div>
                            </div>
                            <button 
                                onClick={(e) => { e.stopPropagation(); onRemove(prop); }}
                                className="text-slate-600 hover:text-red-400 transition-colors p-1"
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                     );
                })}
                {picks.length === 0 && (
                    <div className="text-center py-6 text-slate-500 text-sm italic">
                        Select props to build your slip
                    </div>
                )}
            </div>

            {/* Footer / Analyze */}
            <div className="p-3 border-t border-gray-800">
                <button
                    onClick={onAnalyze}
                    disabled={picks.length < 2}
                    className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-800 disabled:text-gray-500 text-white font-bold py-2.5 rounded-xl transition-all shadow-lg shadow-purple-900/20"
                >
                    <AnalyticsIcon className="w-4 h-4" />
                    {picks.length < 2 ? 'Select at least 2' : 'Analyze Slip Risk'}
                </button>
            </div>
        </div>
    </>
  );
});