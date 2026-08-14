import React, { useState, useEffect, memo } from 'react';
import type { InjuryAlert, LiveMomentumState } from '../types';

interface InjuryAlertFeedProps {
  onAnalyzeMatchup?: (teamName: string) => void;
}

export const InjuryAlertFeed: React.FC<InjuryAlertFeedProps> = memo(({
  onAnalyzeMatchup
}) => {
  const [alerts, setAlerts] = useState<InjuryAlert[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedSport, setSelectedSport] = useState<string>('All');

  // Live in-game momentum states
  const [momentumGames] = useState<LiveMomentumState[]>([
    {
      id: 'mom-1',
      gameId: 'live-nba-1',
      sport: 'NBA',
      homeTeam: 'New York Knicks',
      awayTeam: 'Boston Celtics',
      period: 'Q4 3:42',
      homeScore: 104,
      awayScore: 99,
      momentumSwing: 'Home Surge',
      quantumWaveState: 'Wave Function Collapsing to Knicks (86% Confidence)',
      liveWinProbHome: 82,
      keyDriver: 'Brunson 12pts in 4th quarter + Offensive glass dominance'
    },
    {
      id: 'mom-2',
      gameId: 'live-mlb-1',
      sport: 'MLB',
      homeTeam: 'San Francisco Giants',
      awayTeam: 'Los Angeles Dodgers',
      period: 'Bot 8th',
      homeScore: 3,
      awayScore: 2,
      momentumSwing: 'High Entropy Neutral',
      quantumWaveState: 'Superposition (Bases Loaded 1 Out)',
      liveWinProbHome: 61,
      keyDriver: 'Bullpen leverage index at 3.8x baseline'
    }
  ]);

  const fetchAlerts = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/injuries/alerts');
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts || []);
      }
    } catch (err) {
      console.error('Failed to fetch injury alerts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 15000);
    return () => clearInterval(interval);
  }, []);

  const sports = ['All', 'NBA', 'MLB', 'NFL', 'NHL'];

  const filteredAlerts = alerts.filter(a => {
    return selectedSport === 'All' || a.sport === selectedSport;
  });

  const getImpactBadge = (impact: InjuryAlert['lineImpact']) => {
    switch (impact) {
      case 'CRITICAL':
        return 'bg-red-500/20 text-red-400 border-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.3)] animate-pulse';
      case 'HIGH':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
      case 'MODERATE':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      default:
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  const getStatusBadge = (status: InjuryAlert['status']) => {
    switch (status) {
      case 'OUT':
        return 'bg-red-900/60 text-red-200 border-red-700 font-black';
      case 'DOUBTFUL':
        return 'bg-orange-900/60 text-orange-200 border-orange-700 font-bold';
      case 'QUESTIONABLE':
      case 'GAME_TIME_DECISION':
        return 'bg-amber-900/60 text-amber-200 border-amber-700 font-bold';
      default:
        return 'bg-emerald-900/60 text-emerald-200 border-emerald-700 font-bold';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2.5 h-8 bg-red-500 rounded-full"></div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">
              Live Injury Wire & Quantum Momentum Radar
            </h2>
          </div>
          <p className="text-zinc-400 text-sm">
            Breaking status reports, Vegas line shockwaves, and real-time in-game momentum shifts.
          </p>
        </div>

        <button 
          onClick={fetchAlerts}
          disabled={isLoading}
          className="self-start md:self-auto px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-red-400 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2"
        >
          <span className={`w-2 h-2 rounded-full ${isLoading ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`}></span>
          {isLoading ? 'Scanning Wire...' : 'Refresh Alerts'}
        </button>
      </div>

      {/* Live In-Game Momentum Radar Cards */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
          <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">
            Live Matchup Momentum Radar
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {momentumGames.map(game => (
            <div key={game.id} className="bg-zinc-950/80 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="px-2 py-0.5 bg-red-500/20 text-red-400 font-black rounded uppercase text-[10px] animate-pulse">
                  LIVE • {game.period}
                </span>
                <span className="text-zinc-400 font-bold">{game.sport}</span>
              </div>

              {/* Matchup & Score */}
              <div className="flex justify-between items-center text-lg font-black text-white">
                <div>
                  <span>{game.awayTeam}</span>
                  <span className="text-zinc-500 mx-2 text-sm">@</span>
                  <span className="text-amber-400">{game.homeTeam}</span>
                </div>
                <div className="font-mono text-xl tracking-wider">
                  {game.awayScore} - {game.homeScore}
                </div>
              </div>

              {/* Quantum Momentum Meter */}
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Momentum Phase: <strong className="text-emerald-400">{game.momentumSwing}</strong></span>
                  <span className="text-zinc-400">Home Win Prob: <strong className="text-amber-400">{game.liveWinProbHome}%</strong></span>
                </div>
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    style={{ width: `${game.liveWinProbHome}%` }} 
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-700"
                  ></div>
                </div>
              </div>

              <div className="bg-zinc-900/60 p-3 rounded-xl text-[11px] text-zinc-300 space-y-1">
                <span className="text-zinc-500 text-[10px] uppercase font-bold block">Quantum Driver:</span>
                <p>{game.keyDriver}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 flex-wrap bg-zinc-950/80 border border-zinc-800/80 p-3 rounded-2xl">
        <span className="text-xs font-black uppercase text-zinc-500 mr-2">Filter Wire:</span>
        {sports.map(s => (
          <button
            key={s}
            onClick={() => setSelectedSport(s)}
            className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              selectedSport === s ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Breaking Injury Wire List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-12 text-center text-zinc-500 text-xs">
            No active injury shockwaves reported for {selectedSport}.
          </div>
        ) : (
          filteredAlerts.map(alert => (
            <div 
              key={alert.id}
              className="bg-zinc-950/80 border border-zinc-800 hover:border-zinc-700 rounded-3xl p-6 space-y-4 transition-all duration-300 shadow-lg"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="px-2.5 py-0.5 bg-zinc-800 text-zinc-300 rounded text-[10px] font-black uppercase">
                    {alert.sport}
                  </span>
                  <h4 className="text-lg font-black text-white">{alert.player}</h4>
                  <span className="text-zinc-400 text-sm">({alert.team})</span>
                  <span className={`px-2.5 py-0.5 text-[10px] rounded border ${getStatusBadge(alert.status)}`}>
                    {alert.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-lg border ${getImpactBadge(alert.lineImpact)}`}>
                    {alert.lineImpact} Impact
                  </span>
                  {onAnalyzeMatchup && (
                    <button
                      onClick={() => onAnalyzeMatchup(alert.team)}
                      className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 rounded-lg text-xs font-bold transition-colors"
                    >
                      Audit Team Impact
                    </button>
                  )}
                </div>
              </div>

              {/* Injury Details & Shockwave Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4">
                  <span className="text-[10px] text-zinc-500 uppercase font-black block mb-1">Injury Diagnosis</span>
                  <p className="text-sm font-bold text-white">{alert.injury}</p>
                </div>

                <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4">
                  <span className="text-[10px] text-zinc-500 uppercase font-black block mb-1">Vegas Line Shockwave</span>
                  <p className="text-sm font-bold text-amber-400">{alert.spreadShift}</p>
                </div>

                <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4">
                  <span className="text-[10px] text-zinc-500 uppercase font-black block mb-1">Quantum Wave Disruption</span>
                  <p className="text-sm font-bold text-cyan-400">{alert.quantumEffect}</p>
                </div>
              </div>

              <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4">
                <span className="text-[10px] text-zinc-500 uppercase font-black block mb-1">Strategic Audit & Prop Adjustments</span>
                <p className="text-xs text-zinc-300 leading-relaxed">{alert.analysis}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
});
