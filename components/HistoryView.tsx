import React from 'react';
import type { SavedMatchup } from '../types';

interface HistoryViewProps {
    vault: SavedMatchup[];
}

export const HistoryView: React.FC<HistoryViewProps> = ({ vault }) => {
    const historyItems = vault.sort((a, b) => b.timestamp - a.timestamp);

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            <div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">Prediction History</h2>
                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-1">
                    Historical Game Predictions and Outcomes
                </p>
            </div>

            {historyItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-zinc-950/50 rounded-[3rem] border-2 border-dashed border-zinc-900">
                    <p className="text-zinc-600 font-black text-sm uppercase tracking-widest">
                        No History Recorded
                    </p>
                    <p className="text-zinc-800 text-[9px] font-bold uppercase mt-2">
                        Settle active bets in the Vault to build history
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {historyItems.map((matchup) => (
                        <div key={matchup.id} className={`p-6 rounded-2xl border ${
                            matchup.outcome === 'WIN' ? 'bg-green-950/20 border-green-500/30' :
                            matchup.outcome === 'LOSS' ? 'bg-red-950/20 border-red-500/30' :
                            'bg-zinc-900/50 border-zinc-800'
                        }`}>
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="text-xs text-zinc-500 font-black uppercase tracking-widest mb-1">
                                        {new Date(matchup.timestamp).toLocaleDateString()} • {matchup.confidence} Confidence ({Math.round(matchup.confidenceScore * 100)}%)
                                    </div>
                                    <div className="text-xl font-black text-white uppercase italic">
                                        {matchup.homeTeam} vs {matchup.awayTeam}
                                    </div>
                                    <div className="text-sm text-amber-500 font-bold mt-1">
                                        Prediction: {matchup.winner}
                                    </div>
                                    {matchup.analysis && (
                                        <div className="mt-2 text-xs text-zinc-400 italic">
                                            "{matchup.analysis}"
                                        </div>
                                    )}
                                    {matchup.userFeedback && (
                                        <div className="mt-2 text-xs text-zinc-400 italic">
                                            Feedback: "{matchup.userFeedback}"
                                        </div>
                                    )}
                                    {matchup.accuracyRating && (
                                        <div className="mt-1 text-xs text-amber-500 font-bold">
                                            Rating: {matchup.accuracyRating}/10
                                        </div>
                                    )}
                                    {matchup.elitePair && matchup.elitePair.length > 0 && (
                                        <div className="mt-4 space-y-2">
                                            <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Key Props</div>
                                            {matchup.elitePair.map((prop: any, idx: number) => (
                                                <div key={idx} className="flex items-center gap-2 text-xs bg-black/40 px-3 py-2 rounded-lg border border-zinc-800">
                                                    <span className="font-bold text-white">{prop.player}</span>
                                                    <span className="text-zinc-400">{prop.type} {prop.line} {prop.stat}</span>
                                                    <span className="text-amber-500 font-mono ml-auto">{prop.odds}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest ${
                                    matchup.outcome === 'WIN' ? 'bg-green-500 text-black' :
                                    matchup.outcome === 'LOSS' ? 'bg-red-500 text-black' :
                                    matchup.outcome === 'PUSH' ? 'bg-zinc-500 text-black' :
                                    'bg-amber-500/20 text-amber-500 border border-amber-500/50'
                                }`}>
                                    {matchup.outcome || 'PENDING'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
