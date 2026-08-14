
import React, { memo, useMemo } from 'react';
import type { Game, OddsFormat } from '../types';
import { AnalyticsIcon } from './Icons';

interface GameScheduleProps {
  games: Game[];
  isLoading: boolean;
  isRefreshing: boolean;
  lastUpdated: Date;
  error: string | null;
  onRefresh: (force?: boolean) => void;
  selectedGame: Game | null;
  onSelectGame: (game: Game) => void;
  oddsFormat?: OddsFormat;
  retryCooldown: number;
  sport: string;
}

const gcd = (a: number, b: number): number => {
  return b ? gcd(b, a % b) : a;
};

const convertOdds = (americanOdds: string | undefined, format: OddsFormat = 'American'): string => {
  if (!americanOdds || americanOdds === '-' || americanOdds.toLowerCase() === 'even') return americanOdds || '-';
  
  // Clean string to number
  const oddVal = parseInt(americanOdds.replace('+', ''));
  if (isNaN(oddVal)) return americanOdds;

  if (format === 'American') return americanOdds;

  if (format === 'Decimal') {
    if (oddVal > 0) {
      return (1 + (oddVal / 100)).toFixed(2);
    } else {
      return (1 + (100 / Math.abs(oddVal))).toFixed(2);
    }
  }

  if (format === 'Fractional') {
    let numerator, denominator;
    if (oddVal > 0) {
      numerator = oddVal;
      denominator = 100;
    } else {
      numerator = 100;
      denominator = Math.abs(oddVal);
    }
    
    const divisor = gcd(numerator, denominator);
    return `${numerator / divisor}/${denominator / divisor}`;
  }

  return americanOdds;
};

const GameCard = memo(({ game, isSelected, onSelectGame, oddsFormat }: { 
  game: Game, 
  isSelected: boolean, 
  onSelectGame: (game: Game) => void,
  oddsFormat: OddsFormat
}) => {
  const isLive = game.status === 'Live';
  const isFinished = game.status === 'Finished';
  const isScheduled = !isLive && !isFinished;
  
  const homeSimProb = useMemo(() => 50 + (Math.random() * 20 - 10), [game.id]);
  const moneyline = convertOdds(game.odds?.moneyline, oddsFormat);

  // Status-based styles
  const containerClasses = isLive
    ? 'bg-gradient-to-br from-red-950/30 to-zinc-950 border-red-500 shadow-[0_0_30px_rgba(220,38,38,0.25)]'
    : isFinished
      ? 'bg-zinc-950/40 border-zinc-800 opacity-70 grayscale-[0.3]'
      : 'bg-zinc-950/40 border-zinc-800 hover:border-cyan-500/30';

  const badgeClasses = isLive
    ? 'bg-red-500 text-black border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.6)] animate-pulse font-black'
    : isFinished
      ? 'bg-zinc-800 text-zinc-500 border-zinc-700'
      : 'bg-cyan-950/30 text-cyan-400 border-cyan-500/30';

  return (
    <button
      onClick={() => onSelectGame(game)}
      className={`relative flex flex-col group w-full text-left rounded-[2.5rem] border-2 transition-all duration-500 overflow-hidden ${
        isSelected
          ? 'bg-zinc-900 border-amber-500 shadow-[0_0_50px_rgba(245,158,11,0.25)] scale-[1.02] z-10 opacity-100 grayscale-0'
          : `${containerClasses} hover:bg-zinc-900/60`
      }`}
    >
      {/* Live Active Scanline */}
      {isLive && !isSelected && (
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_0%,rgba(220,38,38,0.1)_50%,transparent_100%)] bg-[length:100%_200%] animate-scan-y"></div>
      )}

      <div className="flex justify-between items-center p-5 pb-3 relative z-10">
          <div className={`px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2.5 transition-colors ${badgeClasses}`}>
              <span className="relative flex h-2 w-2">
                {isLive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-30"></span>}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isLive ? 'bg-black' : isFinished ? 'bg-zinc-600' : 'bg-cyan-500'}`}></span>
              </span>
              {isFinished ? 'Archived' : isLive ? 'LIVE' : game.time}
          </div>
          
          {game.isMustWin && !isFinished && !isLive && (
              <div className="flex items-center gap-2 animate-pulse">
                  <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/20 px-2 py-1 rounded border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.4)]">
                    ⚠️ MUST WIN
                  </span>
              </div>
          )}
          
          {isLive && (
             <div className="flex items-center gap-2 animate-pulse">
                <span className="text-[8px] font-black text-red-500 uppercase tracking-widest bg-red-500/10 px-2 py-1 rounded border border-red-500/20">IN PROGRESS</span>
             </div>
          )}
      </div>

      <div className="flex items-center justify-between px-6 py-4 relative z-10">
          <div className="flex flex-col items-center gap-3 group/team w-24">
              <div className="relative">
                  <img src={`https://avatar.vercel.sh/${encodeURIComponent(game.homeTeam)}.png?size=80`} className={`w-14 h-14 rounded-full border-2 transition-all duration-500 group-hover/team:scale-110 group-hover/team:rotate-3 ${isSelected ? 'border-amber-500' : 'border-zinc-800'}`} />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-black rounded-full border border-zinc-800 flex items-center justify-center text-[8px] font-black text-zinc-500">H</div>
              </div>
              <span className={`text-[10px] font-black uppercase tracking-tight text-center leading-none ${isSelected ? 'text-white' : 'text-zinc-400'}`}>{game.homeTeam}</span>
          </div>

          <div className="flex flex-col items-center justify-center flex-1 px-2">
              {(isLive || isFinished) && game.score ? (
                <div className="text-center space-y-1">
                  <div className={`text-3xl font-black tabular-nums tracking-tighter italic ${isLive ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]' : 'text-zinc-300'}`}>
                    {game.score}
                  </div>
                  {isLive && <span className="text-[8px] font-black text-red-500 uppercase tracking-widest animate-pulse">Live Update</span>}
                  {isFinished && <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Final Score</span>}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-black text-zinc-700 italic group-hover:text-amber-500 transition-colors">VS</span>
                  <div className={`h-8 w-[1px] mt-2 ${isScheduled ? 'bg-gradient-to-b from-transparent via-cyan-500/50 to-transparent' : 'bg-zinc-800'}`}></div>
                </div>
              )}
          </div>

          <div className="flex flex-col items-center gap-3 group/team w-24">
              <div className="relative">
                  <img src={`https://avatar.vercel.sh/${encodeURIComponent(game.awayTeam)}.png?size=80`} className={`w-14 h-14 rounded-full border-2 transition-all duration-500 group-hover/team:scale-110 group-hover/team:-rotate-3 ${isSelected ? 'border-amber-500' : 'border-zinc-800'}`} />
                   <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-black rounded-full border border-zinc-800 flex items-center justify-center text-[8px] font-black text-zinc-500">A</div>
              </div>
              <span className={`text-[10px] font-black uppercase tracking-tight text-center leading-none ${isSelected ? 'text-white' : 'text-zinc-400'}`}>{game.awayTeam}</span>
          </div>
      </div>

      {!isFinished && (
        <div className="px-6 py-3 bg-black/20 border-t border-white/5 relative z-10">
            <div className="flex justify-between items-center mb-1.5">
                <span className="text-[7px] font-black text-zinc-600 uppercase tracking-[0.2em]">Neural Delta</span>
                <span className={`text-[8px] font-black tabular-nums italic ${isSelected ? 'text-amber-500' : 'text-zinc-500'}`}>{homeSimProb.toFixed(1)}% | {(100 - homeSimProb).toFixed(1)}%</span>
            </div>
            <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden flex shadow-inner">
                <div className={`h-full transition-all duration-1000 ${isSelected ? 'bg-amber-500 shadow-[0_0_10px_orange]' : 'bg-zinc-700'}`} style={{ width: `${homeSimProb}%` }}></div>
                <div className="h-full bg-zinc-800/50 transition-all duration-1000" style={{ width: `${100 - homeSimProb}%` }}></div>
            </div>
        </div>
      )}

      {/* Live Odds Section */}
      <div className={`grid grid-cols-3 divide-x divide-white/5 border-t p-3 relative z-10 ${isLive ? 'bg-red-950/40 border-red-500/30' : 'bg-zinc-950/60 border-white/5'}`}>
          <div className="absolute top-1 right-2 flex items-center gap-1 opacity-80">
             <div className={`w-1 h-1 rounded-full ${isLive ? 'bg-white animate-ping' : 'bg-green-500'}`}></div>
             <span className={`text-[6px] font-bold uppercase tracking-widest ${isLive ? 'text-white' : 'text-zinc-600'}`}>{isLive ? 'LIVE ODDS' : 'CONSENSUS'}</span>
          </div>
          <div className="text-center group/odd pt-2">
              <span className={`text-[7px] font-black uppercase block mb-0.5 tracking-widest transition-colors ${isLive ? 'text-red-200' : 'text-zinc-700 group-hover/odd:text-zinc-500'}`}>Spread</span>
              <span className={`text-[10px] font-bold tabular-nums tracking-tight ${isLive ? 'text-white' : 'text-zinc-300'}`}>{game.odds?.spread || '-'}</span>
          </div>
          <div className="text-center group/odd pt-2">
              <span className={`text-[7px] font-black uppercase block mb-0.5 tracking-widest transition-colors ${isLive ? 'text-red-200' : 'text-zinc-700 group-hover/odd:text-zinc-500'}`}>M-Line</span>
              <span className={`text-[10px] font-bold tabular-nums tracking-tight ${isSelected || isLive ? 'text-amber-500' : 'text-zinc-300'}`}>{moneyline}</span>
          </div>
          <div className="text-center group/odd pt-2">
              <span className={`text-[7px] font-black uppercase block mb-0.5 tracking-widest transition-colors ${isLive ? 'text-red-200' : 'text-zinc-700 group-hover/odd:text-zinc-500'}`}>Total</span>
              <span className={`text-[10px] font-bold tabular-nums tracking-tight ${isLive ? 'text-white' : 'text-zinc-300'}`}>{game.odds?.total || '-'}</span>
          </div>
      </div>

      <div className={`absolute inset-x-0 bottom-0 h-0.5 bg-amber-500 transition-all duration-500 ${isSelected ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0 group-hover:scale-x-50 group-hover:opacity-30'}`}></div>
    </button>
  );
});

export const GameSchedule: React.FC<GameScheduleProps> = memo(({ 
  games, 
  isLoading, 
  isRefreshing, 
  lastUpdated, 
  error, 
  onRefresh, 
  selectedGame, 
  onSelectGame, 
  oddsFormat = 'American',
  retryCooldown,
  sport
}) => {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
       <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center border border-zinc-800">
                <AnalyticsIcon className="w-5 h-5 text-zinc-500" />
             </div>
             <div>
                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Live Market Feed</h3>
                <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{sport} PROTOCOL ACTIVE</span>
                    <span className="text-[9px] text-zinc-600">•</span>
                    <span className="text-[9px] text-zinc-600">Updated: {lastUpdated.toLocaleTimeString()}</span>
                </div>
             </div>
          </div>

          <button 
             onClick={() => onRefresh(true)}
             disabled={isRefreshing || retryCooldown > 0}
             className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                 isRefreshing
                 ? 'bg-amber-500/20 text-amber-500 cursor-wait' 
                 : retryCooldown > 0
                   ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                   : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
             }`}
          >
             <div className={`w-1.5 h-1.5 rounded-full ${isRefreshing ? 'bg-amber-500 animate-ping' : 'bg-green-500'}`}></div>
             {isRefreshing ? 'Syncing...' : retryCooldown > 0 ? `Cooling Down (${retryCooldown}s)` : 'Sync Live Odds'}
          </button>
       </div>

       {error && (
          <div className="p-8 rounded-[2.5rem] bg-red-950/10 border border-red-500/20 text-center space-y-4 mb-6">
             <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-2">
                <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
             </div>
             <p className="text-red-400 font-bold text-sm uppercase tracking-widest">{error}</p>
             {!error.includes("Quota") && (
                 <button onClick={() => onRefresh(true)} className="text-[10px] font-black text-red-500 uppercase tracking-widest border-b border-red-500/50 hover:text-white hover:border-white transition-colors">
                    Retry Connection
                 </button>
             )}
          </div>
       )}
       
       {games.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
             {games.map((game) => (
                <GameCard 
                    key={game.id} 
                    game={game} 
                    isSelected={selectedGame?.id === game.id} 
                    onSelectGame={onSelectGame} 
                    oddsFormat={oddsFormat}
                />
             ))}
          </div>
       )}

       {games.length === 0 && !error && !isLoading && (
          <div className="p-8 rounded-[2.5rem] bg-zinc-900/50 border border-zinc-800 text-center space-y-4">
             <p className="text-zinc-500 font-bold text-sm uppercase tracking-widest">No active markets found</p>
          </div>
       )}
    </div>
  );
});
