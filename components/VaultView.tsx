
import React, { useState } from 'react';
import type { SavedMatchup } from '../types';
import { TrashIcon, AnalyticsIcon, LogoIcon, DoubleCheckIcon } from './Icons';

interface VaultViewProps {
    vault: SavedMatchup[];
    onClear: () => void;
    onRemove: (id: string) => void;
    onUpdateOutcome: (id: string, outcome: 'WIN' | 'LOSS' | 'PUSH', feedback?: string, rating?: number) => void;
}

export const VaultView: React.FC<VaultViewProps> = ({ vault, onClear, onRemove, onUpdateOutcome }) => {
    const [activeAnalysis, setActiveAnalysis] = useState<string | null>(null); // Format: "matchupId-propIdx"
    const [feedbackData, setFeedbackData] = useState<Record<string, { rating: number, note: string }>>({});

    const activeItems = vault.filter(v => v.outcome === 'PENDING' || !v.outcome);
    const displayedItems = activeItems;

    const toggleAnalysis = (matchupId: string, pIdx: number) => {
        const key = `${matchupId}-${pIdx}`;
        setActiveAnalysis(activeAnalysis === key ? null : key);
    };

    const handleFeedbackChange = (id: string, field: 'rating' | 'note', value: any) => {
        setFeedbackData(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                [field]: value
            }
        }));
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">Engine Vault</h2>
                    <p className="text-[10px] text-amber-500 font-black uppercase tracking-widest mt-1">
                        Secured Elite Matchup Data • Settlement Required
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    {vault.length > 0 && (
                        <button 
                            onClick={onClear}
                            className="text-[10px] font-black text-zinc-600 hover:text-red-500 uppercase tracking-widest flex items-center gap-2 transition-colors"
                        >
                            <TrashIcon className="w-4 h-4" />
                            Purge
                        </button>
                    )}
                </div>
            </div>

            {displayedItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-zinc-950/50 rounded-[3rem] border-2 border-dashed border-zinc-900">
                    <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4 border border-zinc-800">
                        <DoubleCheckIcon className="w-8 h-8 text-zinc-700" />
                    </div>
                    <p className="text-zinc-600 font-black text-sm uppercase tracking-widest">
                        No Active Signals
                    </p>
                    <p className="text-zinc-800 text-[9px] font-bold uppercase mt-2">
                        Run simulations to auto-lock elite signals here
                    </p>
                </div>
            ) : (
                <div className="grid gap-8">
                    {displayedItems.map((matchup) => {
                        const probPercent = Math.round(matchup.confidenceScore * 100);
                        
                        return (
                            <div key={matchup.id} className={`relative rounded-[3rem] border-2 p-8 shadow-2xl overflow-hidden group transition-all duration-500 ${
                                matchup.outcome === 'WIN' ? 'bg-green-950/20 border-green-500/50' :
                                matchup.outcome === 'LOSS' ? 'bg-red-950/20 border-red-500/50' :
                                'bg-gradient-to-br from-zinc-900 to-black border-zinc-800'
                            }`}>
                                {/* Vault Aesthetic Overlay */}
                                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
                                    <AnalyticsIcon className="w-48 h-48 text-amber-500" />
                                </div>

                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10 mb-8 pb-6 border-b border-white/5">
                                    <div className="flex items-center gap-6">
                                        <div className="flex -space-x-4">
                                            <img src={`https://avatar.vercel.sh/${encodeURIComponent(matchup.homeTeam)}.png?size=80`} className="w-16 h-16 rounded-full border-4 border-black bg-zinc-900" />
                                            <img src={`https://avatar.vercel.sh/${encodeURIComponent(matchup.awayTeam)}.png?size=80`} className="w-16 h-16 rounded-full border-4 border-black bg-zinc-900" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic">{matchup.homeTeam} vs {matchup.awayTeam}</h3>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Verdict: {matchup.winner} ({probPercent}%)</span>
                                                <span className="text-zinc-700">•</span>
                                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{new Date(matchup.timestamp).toLocaleDateString()}</span>
                                            </div>
                                            {matchup.analysis && (
                                                <div className="mt-3 p-3 bg-zinc-900/50 border-l-2 border-amber-500/50 rounded-r-lg">
                                                    <p className="text-[10px] text-zinc-400 leading-relaxed italic line-clamp-3 hover:line-clamp-none transition-all cursor-help" title="Click to expand">
                                                        "{matchup.analysis}"
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {matchup.outcome === 'PENDING' || !matchup.outcome ? (
                                            <div className="flex gap-2 bg-black/40 p-1.5 rounded-xl border border-zinc-800">
                                                <button 
                                                    onClick={() => onUpdateOutcome(matchup.id, 'WIN')}
                                                    className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-green-500 hover:bg-green-500/10 transition-all"
                                                >
                                                    Win
                                                </button>
                                                <button 
                                                    onClick={() => onUpdateOutcome(matchup.id, 'LOSS')}
                                                    className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition-all"
                                                >
                                                    Loss
                                                </button>
                                                <button 
                                                    onClick={() => onUpdateOutcome(matchup.id, 'PUSH')}
                                                    className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-white/10 transition-all"
                                                >
                                                    Push
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-end gap-2">
                                                <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                                                    matchup.outcome === 'WIN' ? 'bg-green-500 text-black' :
                                                    matchup.outcome === 'LOSS' ? 'bg-red-500 text-black' :
                                                    'bg-zinc-500 text-black'
                                                }`}>
                                                    {matchup.outcome}
                                                </div>
                                                
                                                {/* Rating & Feedback UI */}
                                                {!matchup.userFeedback && (
                                                    <div className="flex flex-col gap-2 bg-black/60 p-3 rounded-xl border border-zinc-800 w-64 animate-fade-in z-20">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-[9px] font-bold text-zinc-500 uppercase">Rate Accuracy</span>
                                                            <div className="flex gap-1">
                                                                {[1, 2, 3, 4, 5].map(star => (
                                                                    <button
                                                                        key={star}
                                                                        onClick={() => handleFeedbackChange(matchup.id, 'rating', star)}
                                                                        className={`w-4 h-4 text-[10px] flex items-center justify-center rounded ${
                                                                            (feedbackData[matchup.id]?.rating || 0) >= star ? 'text-amber-500' : 'text-zinc-700'
                                                                        }`}
                                                                    >
                                                                        ★
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <textarea
                                                            placeholder="Why was this right/wrong?"
                                                            className="bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-[10px] text-white focus:outline-none focus:border-amber-500/50 min-h-[40px]"
                                                            value={feedbackData[matchup.id]?.note || ''}
                                                            onChange={(e) => handleFeedbackChange(matchup.id, 'note', e.target.value)}
                                                        />
                                                        <button
                                                            disabled={!feedbackData[matchup.id]?.rating}
                                                            onClick={() => onUpdateOutcome(matchup.id, matchup.outcome as 'WIN' | 'LOSS' | 'PUSH', feedbackData[matchup.id]?.note, feedbackData[matchup.id]?.rating)}
                                                            className={`text-[9px] font-black uppercase tracking-widest py-1.5 rounded-lg transition-colors ${
                                                                !feedbackData[matchup.id]?.rating 
                                                                    ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' 
                                                                    : 'bg-zinc-800 hover:bg-amber-500 hover:text-black text-zinc-400'
                                                            }`}
                                                        >
                                                            Submit Feedback
                                                        </button>
                                                    </div>
                                                )}
                                                {matchup.userFeedback && (
                                                    <div className="text-right">
                                                        <div className="flex justify-end gap-0.5 mb-1">
                                                            {[...Array(matchup.accuracyRating || 0)].map((_, i) => (
                                                                <span key={i} className="text-amber-500 text-[8px]">★</span>
                                                            ))}
                                                        </div>
                                                        <p className="text-[9px] text-zinc-400 italic max-w-[200px] truncate">"{matchup.userFeedback}"</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        
                                        <button onClick={() => onRemove(matchup.id)} className="p-2 text-zinc-700 hover:text-red-500 transition-colors">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6 relative z-10">
                                    {matchup.elitePair.map((prop, pIdx) => {
                                        const analysisKey = `${matchup.id}-${pIdx}`;
                                        const isViewingAnalysis = activeAnalysis === analysisKey;
                                        
                                        return (
                                            <div key={pIdx} className="bg-zinc-950/80 border border-zinc-800 p-5 rounded-3xl hover:border-amber-500/30 transition-all group/prop relative overflow-hidden">
                                                <div className="flex items-center gap-4 mb-4">
                                                    <img src={`https://avatar.vercel.sh/${encodeURIComponent(prop.player)}.png?size=64`} className="w-12 h-12 rounded-full border border-zinc-800 bg-zinc-900" />
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <div className="text-xs font-black text-white uppercase tracking-tight">{prop.player}</div>
                                                            <button 
                                                                onClick={() => toggleAnalysis(matchup.id, pIdx)}
                                                                className={`p-1.5 rounded-lg border transition-all ${
                                                                    isViewingAnalysis ? 'bg-amber-500 border-amber-400 text-black shadow-lg shadow-amber-500/20' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-amber-500'
                                                                }`}
                                                                title="View Analysis"
                                                            >
                                                                <LogoIcon className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                        <div className="text-[9px] font-black text-amber-500/50 uppercase tracking-widest">{prop.stat}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest ${
                                                            prop.type === 'MORE' ? 'bg-green-500 text-black' : 'bg-red-500 text-black'
                                                        }`}>
                                                            {prop.type === 'MORE' ? 'OVER' : 'UNDER'}
                                                        </span>
                                                        <span className="text-2xl font-black text-white tabular-nums">{prop.line}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-[9px] font-black text-zinc-500 uppercase">Hit Probability</div>
                                                        <div className="text-sm font-black text-white">{prop.probability}</div>
                                                        <div className="text-sm font-black text-white">PROB: {prop.probability}%</div>
                                                    </div>
                                                </div>

                                                {/* Analysis Overlay */}
                                                {isViewingAnalysis && (
                                                    <div className="absolute inset-0 bg-zinc-950 z-20 flex flex-col animate-fade-in p-5">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div className="flex items-center gap-2">
                                                                <LogoIcon className="w-3.5 h-3.5 text-amber-500" />
                                                                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">AI Intelligence</span>
                                                            </div>
                                                            <button 
                                                                onClick={() => setActiveAnalysis(null)}
                                                                className="text-zinc-500 hover:text-white"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                                                            <p className="text-[11px] text-zinc-300 leading-relaxed italic border-l border-amber-500/30 pl-3">
                                                                {prop.analysis || "Engine data stream processed successfully. No textual summary recorded for this specific variant."}
                                                            </p>
                                                            {prop.situationalNote && (
                                                                <div className="mt-3 pt-3 border-t border-white/5">
                                                                    <span className="text-[8px] font-black text-zinc-600 uppercase block mb-1">Situational Variable</span>
                                                                    <p className="text-[10px] text-amber-500/70 italic">
                                                                        {prop.situationalNote}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            
            <div className="pt-10 text-center">
                <p className="text-[9px] font-bold text-zinc-800 uppercase tracking-[0.5em] animate-pulse">
                    Pro-N-Os High Fidelity Signal Archive
                </p>
            </div>
        </div>
    );
};
