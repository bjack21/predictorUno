import React, { useState, useEffect, memo } from 'react';
import type { SharpMoneySignal, PropBet } from '../types';

interface OddsComparisonViewProps {
  onAddToSlip?: (bet: PropBet) => void;
  onSelectGameForAnalysis?: (homeTeam: string, awayTeam: string) => void;
}

export const OddsComparisonView: React.FC<OddsComparisonViewProps> = memo(({
  onAddToSlip,
  onSelectGameForAnalysis
}) => {
  const [signals, setSignals] = useState<SharpMoneySignal[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedSport, setSelectedSport] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSignal, setActiveSignal] = useState<SharpMoneySignal | null>(null);

  const fetchSignals = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/odds/signals');
      if (res.ok) {
        const data = await res.json();
        setSignals(data.signals || []);
        if (data.signals && data.signals.length > 0 && !activeSignal) {
          setActiveSignal(data.signals[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch odds signals:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSignals();
  }, []);

  const sports = ['All', 'NBA', 'MLB', 'NFL', 'NHL', 'Soccer'];

  const filteredSignals = signals.filter(sig => {
    const matchesSport = selectedSport === 'All' || sig.sport === selectedSport;
    const matchesSearch = !searchQuery || 
      sig.matchup.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sig.sharpSide.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSport && matchesSearch;
  });

  const handleAddEVBetToSlip = (signal: SharpMoneySignal) => {
    if (!onAddToSlip) return;
    const bet: PropBet = {
      player: signal.sharpSide,
      bet: `Sharp +EV Bet: ${signal.evPick}`,
      line: signal.lineShift,
      stat: 'Game Spread / Market Discrepancy',
      type: 'MORE',
      odds: '-105',
      probability: `${Math.round(50 + signal.evEdge * 2)}%`,
      ev: signal.evEdge,
      edge: signal.evEdge,
      analysis: signal.rationale
    };
    onAddToSlip(bet);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2.5 h-8 bg-amber-500 rounded-full"></div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">
              Real-Time Odds Matrix & Sharp Money Tracker
            </h2>
          </div>
          <p className="text-zinc-400 text-sm">
            Live multi-sportsbook line comparison, Reverse Line Movement (RLM) scanner, and +EV mathematical arbitrage.
          </p>
        </div>

        <button 
          onClick={fetchSignals}
          disabled={isLoading}
          className="self-start md:self-auto px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-amber-400 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2"
        >
          <span className={`w-2 h-2 rounded-full ${isLoading ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`}></span>
          {isLoading ? 'Scanning Books...' : 'Refresh Matrix'}
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-950/80 border border-zinc-800/80 p-3 rounded-2xl">
        <div className="flex items-center gap-2 flex-wrap">
          {sports.map(s => (
            <button
              key={s}
              onClick={() => setSelectedSport(s)}
              className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                selectedSport === s ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search teams or lines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Main Grid: Matchups & Multi-Book Odds */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Signal Cards List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 px-1">
            Active Sharp Signals ({filteredSignals.length})
          </h3>

          {filteredSignals.length === 0 ? (
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-8 text-center text-zinc-500 text-xs">
              No sharp signals match the selected filters.
            </div>
          ) : (
            filteredSignals.map(sig => {
              const isSelected = activeSignal?.id === sig.id;
              return (
                <div
                  key={sig.id}
                  onClick={() => setActiveSignal(sig)}
                  className={`cursor-pointer rounded-2xl p-5 border transition-all duration-300 ${
                    isSelected 
                      ? 'bg-zinc-900 border-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.15)]' 
                      : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 bg-zinc-800 text-zinc-300 rounded text-[10px] font-black uppercase">
                      {sig.sport}
                    </span>
                    <span className="text-zinc-500 text-[10px]">{sig.time}</span>
                  </div>

                  <h4 className="text-sm font-black text-white mb-2">{sig.matchup}</h4>

                  {/* Sharp Action Badges */}
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {sig.isRLM && (
                      <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/30 text-red-400 text-[9px] font-black uppercase rounded">
                        Reverse Line Move
                      </span>
                    )}
                    <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-black uppercase rounded">
                      +{sig.evEdge}% Edge
                    </span>
                  </div>

                  {/* Ticket vs Handle Money Split Bar */}
                  <div className="space-y-1.5 text-[10px] mb-3">
                    <div className="flex justify-between text-zinc-400">
                      <span>Public Tickets: <strong className="text-zinc-200">{sig.publicTicketPct}%</strong></span>
                      <span>Sharp Handle: <strong className="text-amber-400">{sig.handleMoneyPct}%</strong></span>
                    </div>
                    <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden flex">
                      <div style={{ width: `${sig.publicTicketPct}%` }} className="bg-zinc-600 h-full"></div>
                      <div style={{ width: `${100 - sig.publicTicketPct}%` }} className="bg-amber-500 h-full"></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-zinc-800/80">
                    <span className="text-zinc-400">Sharp Pick: <strong className="text-amber-400">{sig.sharpSide}</strong></span>
                    <span className="text-zinc-500 font-bold">{sig.kellyUnit} Units</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Detailed Sportsbook Comparison Matrix & +EV Engine */}
        <div className="lg:col-span-2 space-y-6">
          {activeSignal ? (
            <div className="bg-zinc-950/80 border border-zinc-800 rounded-3xl p-6 space-y-6">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 bg-amber-500 text-black text-[10px] font-black uppercase rounded">
                      {activeSignal.sport} Sharp Signal
                    </span>
                    <span className="text-zinc-500 text-xs">{activeSignal.time}</span>
                  </div>
                  <h3 className="text-2xl font-black text-white tracking-tight">{activeSignal.matchup}</h3>
                </div>

                <div className="flex items-center gap-3">
                  {onSelectGameForAnalysis && (
                    <button
                      onClick={() => onSelectGameForAnalysis(activeSignal.homeTeam, activeSignal.awayTeam)}
                      className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                    >
                      AI Game Audit
                    </button>
                  )}
                  <button
                    onClick={() => handleAddEVBetToSlip(activeSignal)}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20"
                  >
                    + Add to Slip
                  </button>
                </div>
              </div>

              {/* Rationale & Line Shift Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-black">
                    Line Shift Progression
                  </span>
                  <p className="text-sm font-bold text-amber-400">{activeSignal.lineShift}</p>
                </div>
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-black">
                    Kelly Criterion Stake Size
                  </span>
                  <p className="text-sm font-bold text-emerald-400">{activeSignal.kellyUnit} Units ({activeSignal.evEdge}% Expected Value)</p>
                </div>
              </div>

              <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-black mb-1">
                  Syndicate Flow Rationale
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed">{activeSignal.rationale}</p>
              </div>

              {/* Multi-Sportsbook Odds Comparison Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400">
                    Live Sportsbook Consensus Table
                  </h4>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase">
                    ★ Highlights Best Market Price
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-500 uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-3">Sportsbook</th>
                        <th className="py-3 px-3">Spread & Juice</th>
                        <th className="py-3 px-3">Moneyline</th>
                        <th className="py-3 px-3">Total (O/U)</th>
                        <th className="py-3 px-3 text-right">Edge Rating</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {activeSignal.books.map((book) => (
                        <tr 
                          key={book.bookName}
                          className={`hover:bg-white/5 transition-colors ${
                            book.isBestLine ? 'bg-amber-500/5' : ''
                          }`}
                        >
                          <td className="py-3 px-3 font-bold text-white flex items-center gap-2">
                            {book.isBestLine && <span className="text-amber-400 text-xs">★</span>}
                            {book.bookName}
                          </td>
                          <td className="py-3 px-3 text-zinc-200">
                            <span className={book.isBestLine ? 'text-amber-400 font-black' : ''}>
                              {book.spread} ({book.spreadOdds})
                            </span>
                          </td>
                          <td className="py-3 px-3 text-zinc-300">
                            <span className={book.isBestLine ? 'text-emerald-400 font-black' : ''}>
                              {book.moneyline}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-zinc-400">
                            {book.total} ({book.totalOdds})
                          </td>
                          <td className="py-3 px-3 text-right">
                            {book.isBestLine ? (
                              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 font-black rounded text-[9px] uppercase">
                                Best Value
                              </span>
                            ) : (
                              <span className="text-zinc-600 text-[10px]">Standard</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-950/60 border border-zinc-800 rounded-3xl p-12 text-center text-zinc-500">
              Select a sharp signal on the left to view the sportsbook matrix.
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
