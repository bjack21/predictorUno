
import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { SavedMatchup, PropBet } from '../types';
import { SearchIcon, LogoIcon, AnalyticsIcon } from './Icons';

interface SmartSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  vault: SavedMatchup[];
  onDeepScan: (query: string) => void;
}

export const SmartSearchModal: React.FC<SmartSearchModalProps> = ({ isOpen, onClose, vault, onDeepScan }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const results = useMemo(() => {
    if (!query.trim()) return { teams: [], players: [] };
    const lowerQ = query.toLowerCase();

    const teams = vault.filter(m => 
      m.homeTeam.toLowerCase().includes(lowerQ) || m.awayTeam.toLowerCase().includes(lowerQ)
    );

    const players: { player: string, prop: PropBet, matchup: SavedMatchup }[] = [];
    vault.forEach(m => {
        m.elitePair.forEach(p => {
            if (p.player.toLowerCase().includes(lowerQ)) {
                players.push({ player: p.player, prop: p, matchup: m });
            }
        });
    });

    return { teams, players };
  }, [query, vault]);

  if (!isOpen) return null;

  const handleDeepScan = () => {
    onDeepScan(query);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center pt-24 px-4 bg-black/80 backdrop-blur-md" onClick={onClose}>
      <div 
        className="w-full max-w-2xl bg-[#0a0a0a] border border-amber-500/30 rounded-[2rem] shadow-[0_0_50px_rgba(245,158,11,0.15)] overflow-hidden relative animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header / Input */}
        <div className="p-6 border-b border-zinc-800 flex items-center gap-4 bg-zinc-950/80">
            <SearchIcon className="w-6 h-6 text-amber-500" />
            <input 
                ref={inputRef}
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Database (Player, Team)..."
                className="w-full bg-transparent border-none text-xl font-bold text-white placeholder:text-zinc-700 focus:ring-0 focus:outline-none uppercase tracking-wider"
            />
            <button onClick={onClose} className="text-zinc-500 hover:text-white px-2">ESC</button>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-6 space-y-8 bg-black/50 min-h-[300px]">
            
            {/* Empty State */}
            {!query && (
                <div className="flex flex-col items-center justify-center h-48 opacity-40">
                    <LogoIcon className="w-16 h-16 text-zinc-800 mb-4" />
                    <p className="text-xs font-black text-zinc-600 uppercase tracking-[0.2em]">Awaiting Neural Query</p>
                </div>
            )}

            {/* Players Section */}
            {query && results.players.length > 0 && (
                <div className="space-y-4 animate-fade-in">
                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] pl-2 border-l-2 border-amber-500">Player Vault Hits</h3>
                    <div className="grid grid-cols-1 gap-3">
                        {results.players.map((item, idx) => (
                            <div key={idx} className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl flex items-center justify-between group hover:border-amber-500/40 transition-all">
                                <div className="flex items-center gap-4">
                                    <img src={`https://avatar.vercel.sh/${encodeURIComponent(item.player)}.png?size=50`} className="w-10 h-10 rounded-full bg-black border border-zinc-700" />
                                    <div>
                                        <div className="text-sm font-black text-white">{item.player}</div>
                                        <div className="text-[9px] text-zinc-500 uppercase tracking-wide">
                                            {item.prop.type} {item.prop.line} {item.prop.stat} • {new Date(item.matchup.timestamp).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[9px] font-black text-zinc-600 uppercase">Confidence</div>
                                    <div className="text-amber-500 font-bold">{item.prop.probability}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Teams Section */}
            {query && results.teams.length > 0 && (
                <div className="space-y-4 animate-fade-in">
                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] pl-2 border-l-2 border-amber-500">Matchup Archives</h3>
                    <div className="grid grid-cols-1 gap-3">
                        {results.teams.map((matchup) => (
                            <div key={matchup.id} className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl flex justify-between items-center group hover:border-amber-500/40 transition-all">
                                <div>
                                    <div className="text-xs font-black text-white uppercase">{matchup.homeTeam} vs {matchup.awayTeam}</div>
                                    <div className="text-[9px] text-zinc-500 uppercase mt-1">
                                        Winner: <span className="text-zinc-300">{matchup.winner}</span> • {new Date(matchup.timestamp).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border ${matchup.confidence === 'High' ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-zinc-800 border-zinc-700 text-zinc-500'}`}>
                                    {matchup.confidence} Signal
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Deep Scan CTA */}
            {query && (
                <div className="mt-8 pt-6 border-t border-zinc-800">
                    <button 
                        onClick={handleDeepScan}
                        className="w-full py-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-amber-500 rounded-2xl flex items-center justify-center gap-3 transition-all group"
                    >
                        <AnalyticsIcon className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-black text-white uppercase tracking-[0.2em]">
                            {results.players.length === 0 && results.teams.length === 0 ? "No Local Data. Initiate Deep Scout?" : "Run Fresh Deep Scout Analysis"}
                        </span>
                    </button>
                    <p className="text-center text-[8px] text-zinc-600 uppercase tracking-widest mt-3">
                        Queries live engine for real-time stats & trends
                    </p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
