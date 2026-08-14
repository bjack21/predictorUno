
import React, { memo, useState, useMemo } from 'react';
import type { PropBet, OpponentType, BankrollMetrics } from '../types';
import { AnalyticsIcon, CheckIcon, CoinIcon } from './Icons';

interface PerformanceSidebarProps {
  isOpen: boolean;
  activePicks: PropBet[];
  bankroll: BankrollMetrics;
  onClose: () => void;
}

type OutcomeFilter = 'All' | 'Hits' | 'Misses';
type RecencyFilter = 'All' | 'Last 3' | 'Last 5';

export const PerformanceSidebar: React.FC<PerformanceSidebarProps> = memo(({ isOpen, activePicks, bankroll, onClose }) => {
  const [outcomeFilter, setOutcomeFilter] = useState<OutcomeFilter>('All');
  const [opponentFilter, setOpponentFilter] = useState<OpponentType | 'All'>('All');
  const [recencyFilter] = useState<RecencyFilter>('All');

  const filteredPicks = useMemo(() => {
    return activePicks.map(pick => {
      if (!pick.performanceHistory) return pick;

      let history = [...pick.performanceHistory];

      // Outcome Filter
      if (outcomeFilter === 'Hits') history = history.filter(g => g.hit);
      if (outcomeFilter === 'Misses') history = history.filter(g => !g.hit);

      // Opponent Filter
      if (opponentFilter !== 'All') history = history.filter(g => g.opponentType === opponentFilter);

      // Recency Filter
      if (recencyFilter === 'Last 3') history = history.slice(0, 3);
      if (recencyFilter === 'Last 5') history = history.slice(0, 5);

      return { ...pick, performanceHistory: history };
    });
  }, [activePicks, outcomeFilter, opponentFilter, recencyFilter]);

  if (!isOpen) return null;

  return (
    <div className="fixed top-[73px] right-0 bottom-0 w-80 bg-zinc-950 border-l border-zinc-800 z-40 shadow-2xl flex flex-col animate-slide-in-right md:translate-x-0">
      <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-black/40">
        <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
          <AnalyticsIcon className="w-4 h-4" />
          Engine History Analysis
        </h3>
        <button 
          onClick={onClose} 
          className="p-2 -mr-2 text-zinc-500 hover:text-white transition-colors group"
          aria-label="Close sidebar"
        >
            <svg className="w-5 h-5 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
      </div>

      {/* ROI & Bankroll Dashboard */}
      <div className="p-4 bg-zinc-900/30 border-b border-zinc-800 space-y-4">
          <div className="flex items-center gap-2 mb-2">
              <CoinIcon className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Bankroll Performance</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
              <div className="bg-black border border-zinc-800 p-3 rounded-xl">
                  <div className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">Total P&L</div>
                  <div className={`text-xl font-black tabular-nums ${bankroll.totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {bankroll.totalProfit >= 0 ? '+' : ''}{bankroll.totalProfit.toFixed(2)}u
                  </div>
              </div>
              <div className="bg-black border border-zinc-800 p-3 rounded-xl">
                  <div className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">ROI</div>
                  <div className={`text-xl font-black tabular-nums ${bankroll.roi >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {bankroll.roi.toFixed(1)}%
                  </div>
              </div>
          </div>

          <div className="flex justify-between items-center text-[9px] font-bold text-zinc-500 uppercase px-1">
             <span>W: {bankroll.record.wins}</span>
             <span>L: {bankroll.record.losses}</span>
             <span>P: {bankroll.record.pushes}</span>
             <span className="text-zinc-300">Vol: {bankroll.totalWagered.toFixed(1)}u</span>
          </div>
      </div>

      {/* Advanced Filters */}
      {activePicks.length > 0 && (
          <div className="p-3 bg-zinc-900/30 border-b border-zinc-800 space-y-3">
            <div className="flex flex-col gap-2">
              <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest px-1">Outcome Signal</label>
              <div className="flex gap-1">
                {(['All', 'Hits', 'Misses'] as OutcomeFilter[]).map(f => (
                  <button
                    key={f}
                    onClick={() => setOutcomeFilter(f)}
                    className={`flex-1 py-1 text-[8px] font-black rounded border transition-all ${
                      outcomeFilter === f ? 'bg-amber-500 text-black border-amber-400' : 'bg-zinc-950 text-zinc-500 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest px-1">Opponent Archetype</label>
              <div className="grid grid-cols-2 gap-1">
                {(['All', 'Divisional', 'Playoff Team', 'Conference'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setOpponentFilter(f)}
                    className={`py-1 text-[8px] font-black rounded border transition-all ${
                      opponentFilter === f ? 'bg-amber-500 text-black border-amber-400' : 'bg-zinc-950 text-zinc-500 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar">
        {filteredPicks.length === 0 && activePicks.length === 0 ? (
            <div className="text-center py-10 opacity-50">
                <AnalyticsIcon className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">No Active Props to Analyze</p>
            </div>
        ) : (
            filteredPicks.map((pick, pIdx) => (
              <div key={`${pick.player}-${pIdx}`} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img src={`https://avatar.vercel.sh/${encodeURIComponent(pick.player)}.png?size=40`} className="w-10 h-10 rounded-full border-2 border-amber-500/50" />
                    {pick.isElite179 && (
                       <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-500 rounded-full border border-black flex items-center justify-center">
                          <svg className="w-2 h-2 text-black" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                       </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-white truncate">{pick.player}</span>
                    <span className="text-[10px] text-amber-500 font-bold uppercase tracking-tighter">
                      {pick.type} {pick.line} {pick.stat}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-[8px] font-black text-zinc-600 uppercase tracking-widest flex justify-between">
                    <span>Filtered Stream</span>
                    <span className="text-amber-500/50">{pick.performanceHistory?.length || 0} Data pts</span>
                  </div>
                  
                  {pick.performanceHistory?.length === 0 ? (
                    <div className="py-6 text-center border border-dashed border-zinc-900 rounded-xl">
                      <span className="text-[8px] font-black text-zinc-800 uppercase italic">No matches for active filters</span>
                    </div>
                  ) : (
                    pick.performanceHistory?.map((game, gIdx) => (
                      <div key={gIdx} className="bg-zinc-900/50 rounded-xl p-3 border border-zinc-800 flex items-center justify-between group hover:bg-zinc-800 transition-colors relative overflow-hidden">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-[10px] font-black text-zinc-200 uppercase tracking-tight">vs {game.opponent}</span>
                            {game.opponentType && (
                              <span className={`text-[6px] font-black uppercase px-1 rounded-sm border ${
                                game.opponentType === 'Divisional' ? 'border-amber-500/30 text-amber-500' : 
                                game.opponentType === 'Playoff Team' ? 'border-purple-500/30 text-purple-500' : 'border-zinc-800 text-zinc-600'
                              }`}>
                                {game.opponentType}
                              </span>
                            )}
                          </div>
                          <span className="text-[8px] text-zinc-600 font-mono tracking-tighter">{game.date}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className={`text-xs font-black tabular-nums block ${game.hit ? 'text-green-500' : 'text-rose-500'}`}>{game.actualValue}</span>
                            <span className="text-[7px] font-black text-zinc-700 uppercase">{game.hit ? 'HIT' : 'MISS'}</span>
                          </div>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${
                            game.hit ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                          }`}>
                            {game.hit ? <CheckIcon className="w-4 h-4" /> : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {pIdx < activePicks.length - 1 && <div className="border-b border-zinc-900 pt-2" />}
              </div>
            ))
        )}
      </div>
      
      <div className="p-4 bg-zinc-900/30 border-t border-zinc-800">
        <div className="text-[9px] font-black text-zinc-700 text-center uppercase tracking-widest flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
            Syncing Sharp Signal History
        </div>
      </div>
    </div>
  );
});
