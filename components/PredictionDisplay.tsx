
import React, { memo, useState } from 'react';
import type { Prediction, OddsFormat, PropBet, AlphaSafeguard, ProjectionData, MatchupDelta, OfficialsAnalysis, VenueIntelligence, PlayerDeepDive, Game, AdvancedMetrics } from '../types';
import { PlusIcon, CheckIcon, LogoIcon, SpeakerWaveIcon, CoinIcon, AnalyticsIcon } from './Icons';
import { generatePlayerDeepDive } from '../services/geminiService';

interface PredictionDisplayProps {
  prediction: Prediction;
  oddsFormat: OddsFormat;
  pickSlip?: PropBet[];
  onTogglePick?: (prop: PropBet) => void;
  onSearchPlayer?: (player: string) => void;
  liveGame?: Game | null;
}

const confidenceStyles: Record<string, { bg: string; text: string; border: string; accent: string; glow: string }> = {
    High: { bg: 'bg-green-950/20', text: 'text-green-400', border: 'border-green-500/60', accent: 'bg-green-500', glow: 'shadow-[0_0_60px_rgba(34,197,94,0.2)]' },
    Medium: { bg: 'bg-amber-950/20', text: 'text-amber-400', border: 'border-amber-500/60', accent: 'bg-amber-500', glow: 'shadow-[0_0_60px_rgba(245,158,11,0.2)]' },
    Low: { bg: 'bg-zinc-900/40', text: 'text-zinc-400', border: 'border-zinc-800', accent: 'bg-zinc-600', glow: 'shadow-none' },
};

const CardAccent = () => (
    <>
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-amber-500/30 rounded-tl-2xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-amber-500/30 rounded-br-2xl pointer-events-none"></div>
    </>
);

const CriticalInjuryAlert = ({ safeguards }: { safeguards: AlphaSafeguard[] }) => {
    if (!safeguards) return null;
    const critical = safeguards.filter(s => s.status === 'FLAGGED');
    if (critical.length === 0) return null;

    return (
        <div className="bg-red-950/30 border border-red-500/50 rounded-2xl p-4 mb-6 animate-pulse">
            <div className="flex items-center gap-3 mb-2">
                <div className="bg-red-500 text-black text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">
                    Veto Alert
                </div>
                <span className="text-red-400 text-xs font-bold uppercase tracking-wide">Critical Variables Detected</span>
            </div>
            <div className="space-y-1">
                {critical.map((s, i) => (
                    <div key={i} className="text-red-300 text-xs flex items-start gap-2">
                        <span className="mt-1 w-1 h-1 bg-red-500 rounded-full"></span>
                        {s.finding}
                    </div>
                ))}
            </div>
        </div>
    );
};

const ProjectionMatrix = ({ data }: { data: ProjectionData }) => {
    if (!data) return null;
    return (
        <div className="grid grid-cols-3 gap-2 mt-4 bg-black/40 p-3 rounded-xl border border-zinc-800">
            <div className="text-center">
                <div className="text-[8px] text-zinc-500 font-black uppercase tracking-wider">L5 Avg</div>
                <div className="text-sm font-black text-white">{data.last5Average}</div>
            </div>
            <div className="text-center border-l border-zinc-800">
                <div className="text-[8px] text-zinc-500 font-black uppercase tracking-wider">Season</div>
                <div className="text-sm font-black text-zinc-400">{data.seasonAverage}</div>
            </div>
            <div className="text-center border-l border-zinc-800">
                <div className="text-[8px] text-zinc-500 font-black uppercase tracking-wider">Ceiling</div>
                <div className="text-sm font-black text-green-500">{data.ceiling}</div>
            </div>
            <div className="col-span-3 mt-2 pt-2 border-t border-zinc-800 flex justify-between items-center">
                 <span className="text-[9px] text-zinc-600 font-black uppercase">Consistency Score</span>
                 <div className="h-1.5 w-24 bg-zinc-900 rounded-full overflow-hidden">
                    <div 
                        className={`h-full ${data.consistencyScore > 80 ? 'bg-green-500' : data.consistencyScore > 50 ? 'bg-amber-500' : 'bg-red-500'}`} 
                        style={{ width: `${data.consistencyScore}%` }}
                    ></div>
                 </div>
            </div>
        </div>
    );
};

const TrendChart = ({ data, line, label }: { data: number[], line: number, label: string }) => {
    if (!data || data.length === 0) return null;
    const maxVal = Math.max(...data, line) * 1.2;
    
    return (
        <div className="bg-black/40 p-3 rounded-xl border border-zinc-800 mt-2">
            <div className="flex justify-between items-end mb-2">
                <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">{label}</span>
                <span className="text-[8px] font-mono text-zinc-500">Line: {line}</span>
            </div>
            <div className="flex items-end justify-between h-16 gap-1 relative">
                {/* Line Marker */}
                <div 
                    className="absolute w-full border-t border-dashed border-zinc-500 z-10 opacity-50" 
                    style={{ bottom: `${(line / maxVal) * 100}%` }}
                ></div>
                
                {data.map((val, i) => {
                    const isOver = val > line;
                    return (
                        <div key={i} className="flex-1 flex flex-col justify-end group/bar relative h-full">
                            <div 
                                className={`w-full rounded-sm transition-all duration-500 ${isOver ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]' : 'bg-red-500/50'}`}
                                style={{ height: `${(val / maxVal) * 100}%` }}
                            ></div>
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[8px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity z-20 pointer-events-none border border-zinc-700">
                                {val}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const DeltaTacticalView = ({ deltas }: { deltas: MatchupDelta[] }) => {
    if (!deltas || deltas.length === 0) return null;
    return (
        <div className="mt-4 space-y-2">
            <div className="flex justify-between items-center px-1">
                <span className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">Matchup Delta</span>
                <span className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">Advantage</span>
            </div>
            <div className="space-y-1">
                {deltas.map((d, i) => (
                    <div key={i} className="flex items-center justify-between bg-zinc-900/40 p-2 rounded-lg border border-zinc-800/50">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-zinc-400 uppercase">{d.category}</span>
                            <div className="flex items-center gap-2 text-[10px]">
                                <span className="text-white font-mono">{d.playerStat}</span>
                                <span className="text-zinc-600">vs</span>
                                <span className="text-zinc-400 font-mono">{d.opponentStat}</span>
                            </div>
                        </div>
                        <div className={`text-[9px] font-black uppercase px-2 py-1 rounded ${
                            d.advantage === 'Player' ? 'bg-green-950/30 text-green-500 border border-green-500/20' :
                            d.advantage === 'Opponent' ? 'bg-red-950/30 text-red-500 border border-red-500/20' :
                            'text-zinc-500'
                        }`}>
                            {d.advantage}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const OfficialsCard = ({ data }: { data: OfficialsAnalysis }) => {
    if (!data) return null;
    return (
        <div className="bg-zinc-950/40 border border-zinc-800 p-5 rounded-3xl relative overflow-hidden group">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest">Official Intel</h3>
                <span className="text-[10px] font-black text-amber-500 uppercase">{data.referee}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
                 <div className="bg-black/40 p-2 rounded-xl border border-zinc-800">
                    <div className="text-[8px] text-zinc-600 uppercase">Tendency</div>
                    <div className="text-xs font-black text-white">{data.tendency}</div>
                 </div>
                 <div className="bg-black/40 p-2 rounded-xl border border-zinc-800">
                    <div className="text-[8px] text-zinc-600 uppercase">Impact Rating</div>
                    <div className="text-xs font-black text-amber-500">{data.impactRating}/10</div>
                 </div>
            </div>
            <div className="flex justify-between items-center text-[10px] text-zinc-400 bg-zinc-900/50 p-2 rounded-lg">
                <span>Home Win %: {data.homeWinPct}</span>
                <span>Avg Pts: {data.avgPoints}</span>
            </div>
        </div>
    );
};

const VenueCard = ({ data }: { data: VenueIntelligence }) => {
    if (!data) return null;
    return (
        <div className="bg-zinc-950/40 border border-zinc-800 p-5 rounded-3xl relative overflow-hidden group">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest">Venue Logic</h3>
                <span className="text-[10px] font-black text-zinc-400 uppercase truncate max-w-[100px]">{data.name}</span>
            </div>
            <div className="flex items-center gap-2 mb-3">
                 <div className="px-2 py-1 bg-zinc-900 rounded text-[9px] font-bold text-zinc-400">{data.weatherCondition}</div>
                 <div className="px-2 py-1 bg-zinc-900 rounded text-[9px] font-bold text-zinc-400">{data.surface}</div>
            </div>
            <div className="space-y-2">
                 <div className="flex justify-between items-center">
                    <span className="text-[9px] text-zinc-600 uppercase">Altitude Impact</span>
                    <span className={`text-[9px] font-black uppercase ${data.altitudeImpact === 'High' ? 'text-red-500' : 'text-zinc-400'}`}>{data.altitudeImpact}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-[9px] text-zinc-600 uppercase">Home Advantage</span>
                    <div className="h-1.5 w-16 bg-zinc-900 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500" style={{ width: `${data.homeAdvantageScore}%` }}></div>
                    </div>
                 </div>
            </div>
        </div>
    );
};

const SituationalFactorsCard = ({ data }: { data: NonNullable<Prediction['situationalFactors']> }) => {
    if (!data) return null;
    return (
        <div className="bg-zinc-950/40 border border-zinc-800 p-5 rounded-3xl relative overflow-hidden">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest">Situational Factors</h3>
                <span className="text-[10px] font-black text-amber-500 uppercase">{data.restAdvantage} Rest Adv</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center mb-3">
                 <div className="bg-black/40 p-2 rounded-xl border border-zinc-800">
                    <div className="text-[8px] text-zinc-600 uppercase">Travel Fatigue</div>
                    <div className={`text-xs font-black ${data.travelFatigue === 'High' ? 'text-red-400' : data.travelFatigue === 'Moderate' ? 'text-amber-400' : 'text-green-400'}`}>{data.travelFatigue}</div>
                 </div>
                 <div className="bg-black/40 p-2 rounded-xl border border-zinc-800">
                    <div className="text-[8px] text-zinc-600 uppercase">Motivation</div>
                    <div className="text-xs font-black text-zinc-300 truncate px-1" title={data.motivation}>{data.motivation}</div>
                 </div>
            </div>
            {data.scheduleQuirk && (
                <div className="text-[9px] text-zinc-400 italic bg-black/20 p-2 rounded-lg border border-zinc-800/50">
                    <span className="text-zinc-500 font-bold uppercase mr-1">Quirk:</span> {data.scheduleQuirk}
                </div>
            )}
        </div>
    );
};

const MicroMatchupsCard = ({ data }: { data: NonNullable<Prediction['microMatchups']> }) => {
    if (!data || data.length === 0) return null;
    return (
        <div className="bg-zinc-950/40 border border-zinc-800 p-5 rounded-3xl relative overflow-hidden col-span-1 md:col-span-2">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest">Micro-Matchups</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.map((matchup, idx) => (
                    <div key={idx} className="bg-black/40 p-3 rounded-xl border border-zinc-800">
                        <div className="flex justify-between items-start mb-2">
                            <div className="text-[10px] font-black text-white uppercase tracking-wider">{matchup.matchup}</div>
                            <div className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${matchup.advantage === 'Home' ? 'bg-amber-500/20 text-amber-500' : matchup.advantage === 'Away' ? 'bg-cyan-500/20 text-cyan-500' : 'bg-zinc-800 text-zinc-400'}`}>
                                {matchup.advantage} Adv
                            </div>
                        </div>
                        <p className="text-[10px] text-zinc-400 leading-relaxed">{matchup.analysis}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const RosterIntegrityCard = ({ data }: { data: { homeRosterCheck: string[], awayRosterCheck: string[], dataIntegrityStatus: string } }) => {
    if (!data) return null;
    return (
        <div className="bg-zinc-950/40 border border-zinc-800 p-5 rounded-3xl relative overflow-hidden group md:col-span-2">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest">Roster Integrity Protocol</h3>
                <span className={`text-[10px] font-black px-2 py-1 rounded uppercase ${data.dataIntegrityStatus === 'VERIFIED' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                    {data.dataIntegrityStatus}
                </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <div className="text-[8px] text-zinc-600 uppercase mb-1">Home Key Players</div>
                    <div className="flex flex-wrap gap-1">
                        {data.homeRosterCheck.map((p, i) => (
                            <span key={i} className="text-[9px] bg-zinc-900 text-zinc-300 px-1.5 py-0.5 rounded border border-zinc-800">{p}</span>
                        ))}
                    </div>
                </div>
                <div>
                    <div className="text-[8px] text-zinc-600 uppercase mb-1">Away Key Players</div>
                    <div className="flex flex-wrap gap-1">
                        {data.awayRosterCheck.map((p, i) => (
                            <span key={i} className="text-[9px] bg-zinc-900 text-zinc-300 px-1.5 py-0.5 rounded border border-zinc-800">{p}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const StreakBar = ({ streak, line }: { streak: NonNullable<PropBet['last4GamesStreak']>, line: number }) => {
    if (!streak || !streak.games) return null;
    const maxVal = Math.max(...streak.games, line) * 1.2;

    return (
        <div className="mt-3 bg-black/40 p-2 rounded-xl border border-zinc-800">
            <div className="flex justify-between items-center mb-2">
                <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">L4 Streak Analysis</span>
                <div className={`flex items-center gap-1 text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                    streak.type === 'HOT' ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 
                    streak.type === 'COLD' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 
                    'bg-zinc-800 text-zinc-500 border border-zinc-700'
                }`}>
                    {streak.type === 'HOT' && <span className="animate-pulse">🔥</span>}
                    {streak.type === 'COLD' && <span>❄️</span>}
                    {streak.type} • {streak.hitRate}
                </div>
            </div>
            <div className="flex gap-1 h-10 items-end relative">
                {/* Line Marker */}
                <div 
                    className="absolute w-full border-t border-dashed border-zinc-600 z-10 opacity-50" 
                    style={{ bottom: `${(line / maxVal) * 100}%` }}
                ></div>

                {streak.games.map((val, i) => {
                    // Assuming 'Over' logic for visualization, though type matters. 
                    // Ideally we check prop.type but for simple viz, green = high value.
                    // Actually, let's just color by value relative to line.
                    const colorClass = val > line ? 'bg-green-500' : 'bg-red-500';
                    
                    return (
                        <div key={i} className="flex-1 flex flex-col justify-end h-full group/bar relative">
                            <div 
                                className={`w-full rounded-sm transition-all ${colorClass} opacity-80 group-hover/bar:opacity-100`}
                                style={{ height: `${(val / maxVal) * 100}%` }}
                            ></div>
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] font-black text-white opacity-0 group-hover/bar:opacity-100 transition-opacity bg-black/80 px-1 rounded">
                                {val}
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="flex justify-between items-center mt-1.5 pt-1.5 border-t border-white/5">
                 <span className="text-[8px] text-zinc-600 uppercase">L4 Average</span>
                 <span className="text-[9px] font-mono text-zinc-300">{streak.avg}</span>
            </div>
        </div>
    );
};

const PropCard = memo(({ 
    prop, 
    onTogglePick, 
    isSelected,
    onSearchPlayer,
    matchupContext
}: { 
    prop: PropBet, 
    onTogglePick: () => void, 
    isSelected: boolean,
    onSearchPlayer?: (player: string) => void,
    matchupContext: string
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLoadingDeepDive, setIsLoadingDeepDive] = useState(false);
    const [deepDiveData, setDeepDiveData] = useState<PlayerDeepDive | null>(null);

    const isOver = prop.type === 'MORE';
    const lineVal = parseFloat(prop.line);

    const handleDeepAnalyze = async () => {
        if (isExpanded) {
            setIsExpanded(false);
            return;
        }

        setIsExpanded(true);
        if (deepDiveData) return; // Already fetched

        setIsLoadingDeepDive(true);
        try {
            const data = await generatePlayerDeepDive(prop.player, prop.stat, prop.line, matchupContext);
            setDeepDiveData(data);
        } catch (error) {
            console.error("Deep dive failed", error);
        } finally {
            setIsLoadingDeepDive(false);
        }
    };
    
    return (
        <div className={`relative bg-zinc-900/40 border p-5 rounded-3xl transition-all duration-300 group ${isSelected ? 'border-amber-500 bg-amber-500/5 shadow-[0_0_30px_rgba(245,158,11,0.1)]' : 'border-zinc-800 hover:border-zinc-700'}`}>
            <CardAccent />
            
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center gap-3">
                    <button onClick={() => onSearchPlayer?.(prop.player)} className="group/avatar relative">
                        <img 
                            src={`https://avatar.vercel.sh/${encodeURIComponent(prop.player)}.png?size=64`} 
                            className="w-10 h-10 rounded-full border border-zinc-700 bg-zinc-800 group-hover/avatar:border-amber-500 transition-colors" 
                            alt={prop.player}
                        />
                        <div className="absolute -bottom-1 -right-1 bg-zinc-900 rounded-full p-0.5 border border-zinc-800">
                           <AnalyticsIcon className="w-3 h-3 text-zinc-500 group-hover/avatar:text-amber-500" />
                        </div>
                        
                        {/* Hot Streak Bubble */}
                        {prop.isHot && prop.projectionData?.last5Average && (
                            <div className="absolute -top-3 -right-6 bg-red-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.5)] border border-red-400 z-20 animate-bounce whitespace-nowrap">
                                L5: {prop.projectionData.last5Average}
                            </div>
                        )}
                    </button>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-black text-white uppercase tracking-tight leading-none">{prop.player}</h4>
                            {prop.isHot && (
                                <span className="text-[8px] bg-red-500/20 text-red-500 border border-red-500/30 px-1.5 py-0.5 rounded uppercase tracking-widest animate-pulse">
                                    🔥 Hot
                                </span>
                            )}
                            {(!prop.last3Games || prop.last3Games.length < 3) && (
                                <span className="text-[8px] bg-amber-500/20 text-amber-500 border border-amber-500/30 px-1.5 py-0.5 rounded uppercase tracking-widest" title="Low Sample Size / High Variance">
                                    ⚠️ Volatile
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${isOver ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                {isOver ? 'Over' : 'Under'}
                            </span>
                            <span className="text-xl font-black text-white tabular-nums">{prop.line}</span>
                            <span className="text-[10px] font-bold text-zinc-500 uppercase">{prop.stat}</span>
                        </div>
                        {(prop.last3GamesAvg || (prop.last3Games && prop.last3Games.length > 0)) && (
                            <div className="flex items-center gap-2 mt-1">
                                {prop.last3GamesAvg && (
                                    <span className="text-[9px] font-black text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                                        L3 Avg: {prop.last3GamesAvg}
                                    </span>
                                )}
                                {prop.last3GamesHitRate && (
                                    <span className="text-[9px] font-black text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20">
                                        Hit: {prop.last3GamesHitRate}
                                    </span>
                                )}
                                {prop.last3Games && prop.last3Games.length > 0 && (
                                    <span className="text-[9px] font-black text-zinc-400 bg-zinc-800/50 px-1.5 py-0.5 rounded border border-zinc-700/50">
                                        [{prop.last3Games.join(', ')}]
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <button 
                        onClick={handleDeepAnalyze}
                        className={`p-2 rounded-xl transition-all border ${isExpanded ? 'bg-amber-500 text-black border-amber-500' : 'bg-zinc-800/50 text-zinc-400 border-zinc-700 hover:text-white hover:border-amber-500'}`}
                        title="Deep Analysis"
                    >
                        <LogoIcon className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={onTogglePick}
                        className={`p-2 rounded-xl transition-all border ${isSelected ? 'bg-green-500 text-black border-green-500' : 'bg-zinc-800/50 text-zinc-400 border-zinc-700 hover:text-white hover:border-zinc-500'}`}
                        title="Add to Slip"
                    >
                        {isSelected ? <CheckIcon className="w-4 h-4" /> : <PlusIcon className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            <div className="space-y-3 relative z-10">
                <div className="flex justify-between items-center py-2 border-t border-zinc-800/50">
                    <div className="flex flex-col w-full">
                        <div className="flex justify-between items-end mb-1">
                            <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Engine Probability</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-lg font-black text-amber-500">{prop.probability}</span>
                                {prop.edge && <span className="text-[10px] font-bold text-green-500">+{prop.edge}% Edge</span>}
                            </div>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-amber-500 transition-all duration-1000"
                                style={{ width: prop.probability }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Deep Psyche Simulation */}
                {prop.deepPsyche && (
                    <div className="bg-purple-950/20 border border-purple-500/30 p-3 rounded-xl mt-2 relative overflow-hidden group/psyche">
                        <div className="absolute top-0 left-0 w-1 h-full bg-purple-500/50"></div>
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-[8px] font-black text-purple-400 uppercase tracking-widest flex items-center gap-1">
                                🧠 Deep Psyche
                            </span>
                            <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${prop.deepPsyche.visceralImpactScore > 7 ? 'bg-red-500/20 text-red-500' : 'bg-purple-500/20 text-purple-400'}`}>
                                {prop.deepPsyche.motivationOverride}
                            </span>
                        </div>
                        <p className="text-[10px] text-zinc-300 italic">"{prop.deepPsyche.internalMonologue}"</p>
                    </div>
                )}

                {/* New L4 Streak Bar */}
                {prop.last4GamesStreak && <StreakBar streak={prop.last4GamesStreak} line={lineVal} />}

                {/* Deep Dive Section */}
                {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-zinc-800 animate-fade-in">
                        {isLoadingDeepDive ? (
                            <div className="py-8 text-center space-y-2">
                                <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest animate-pulse">Scanning Archives...</p>
                            </div>
                        ) : deepDiveData ? (
                            <div className="space-y-4">
                                <div className="bg-amber-500/5 p-3 rounded-xl border border-amber-500/20">
                                    <p className="text-[10px] text-zinc-300 italic leading-relaxed">"{deepDiveData.summary}"</p>
                                </div>
                                
                                <TrendChart data={deepDiveData.last10Games} line={lineVal} label="Last 10 Games Trend" />
                                
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-zinc-950/50 p-2 rounded-xl border border-zinc-800">
                                        <div className="text-[8px] text-zinc-600 uppercase">Consistency</div>
                                        <div className={`text-xl font-black ${deepDiveData.consistencyScore > 70 ? 'text-green-500' : 'text-amber-500'}`}>
                                            {deepDiveData.consistencyScore}%
                                        </div>
                                    </div>
                                    <div className="bg-zinc-900/50 p-2 rounded-xl border border-zinc-800">
                                        <div className="text-[8px] text-zinc-600 uppercase">Trend</div>
                                        <div className="text-xl font-black text-white">{deepDiveData.trendDirection}</div>
                                    </div>
                                </div>

                                {deepDiveData.h2hGames.length > 0 && (
                                     <TrendChart data={deepDiveData.h2hGames} line={lineVal} label="Head-to-Head History" />
                                )}
                            </div>
                        ) : (
                            <p className="text-[10px] text-red-500 text-center">Data Unavailable</p>
                        )}
                    </div>
                )}

                {prop.vsOpponentStats && !isExpanded && (
                    <div className="bg-zinc-950/50 p-2 rounded-lg border border-zinc-800/50 text-center">
                        <span className="text-[10px] text-zinc-400 italic">"{prop.vsOpponentStats}"</span>
                    </div>
                )}
                
                {prop.projectionData && <ProjectionMatrix data={prop.projectionData} />}
                {prop.matchupDeltas && <DeltaTacticalView deltas={prop.matchupDeltas} />}
                
                <p className="text-[10px] text-zinc-500 leading-relaxed line-clamp-2 hover:line-clamp-none transition-all cursor-help border-l-2 border-amber-500/20 pl-2">
                    {prop.analysis}
                </p>
            </div>
        </div>
    );
});

const AdvancedMetricsCard = ({ data }: { data: AdvancedMetrics }) => {
    if (!data) return null;
    return (
        <div className="bg-zinc-950/40 border border-zinc-800 p-5 rounded-3xl relative overflow-hidden group md:col-span-2">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest">Advanced Metrics</h3>
                <span className="text-[10px] font-black text-zinc-400 uppercase">Efficiency Profile</span>
            </div>
            
            <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-black/40 p-2 rounded-xl border border-zinc-800 text-center">
                    <div className="text-[8px] text-zinc-600 uppercase mb-1">Offensive Rtg</div>
                    <div className="text-sm font-black text-white">{data.efficiency.offensiveRating}</div>
                </div>
                <div className="bg-black/40 p-2 rounded-xl border border-zinc-800 text-center">
                    <div className="text-[8px] text-zinc-600 uppercase mb-1">Defensive Rtg</div>
                    <div className="text-sm font-black text-white">{data.efficiency.defensiveRating}</div>
                </div>
                <div className="bg-black/40 p-2 rounded-xl border border-zinc-800 text-center">
                    <div className="text-[8px] text-zinc-600 uppercase mb-1">Net Rating</div>
                    <div className={`text-sm font-black ${parseFloat(data.efficiency.netRating) > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {data.efficiency.netRating}
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center border-b border-zinc-800/50 pb-2">
                     <span className="text-[9px] text-zinc-500 uppercase font-bold">Pace Factor</span>
                     <span className="text-[10px] font-mono text-zinc-300">{data.pace}</span>
                </div>
                {data.sportSpecific.map((stat, i) => (
                    <div key={i} className="flex justify-between items-center">
                        <span className="text-[9px] text-zinc-500 uppercase font-bold">{stat.label}</span>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-white">{stat.value}</span>
                            {stat.rank && <span className="text-[8px] bg-zinc-900 px-1.5 py-0.5 rounded text-zinc-400">{stat.rank}</span>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const PredictionDisplay: React.FC<PredictionDisplayProps> = memo(({ 
    prediction, 
    pickSlip = [], 
    onTogglePick,
    onSearchPlayer,
    liveGame
}) => {
    const [activeTab, setActiveTab] = useState<'TACTICAL' | 'SIGNALS'>('TACTICAL');
    const style = confidenceStyles[prediction.confidence] || confidenceStyles.Low;

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            {/* Live Game Status Banner */}
            {liveGame && (liveGame.status === 'Live' || liveGame.status === 'Finished') && (
                <div className={`rounded-2xl p-4 flex items-center justify-between border ${liveGame.status === 'Live' ? 'bg-red-950/30 border-red-500/30 animate-pulse' : 'bg-zinc-900/50 border-zinc-800'}`}>
                    <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${liveGame.status === 'Live' ? 'bg-red-500 animate-ping' : 'bg-zinc-500'}`}></div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${liveGame.status === 'Live' ? 'text-red-400' : 'text-zinc-500'}`}>
                            {liveGame.status === 'Live' ? 'LIVE GAME UPDATE' : 'FINAL SCORE'}
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-black text-white">{liveGame.homeTeam} {liveGame.score?.split('-')[0] || '0'}</span>
                        <span className="text-[10px] text-zinc-600 font-black">VS</span>
                        <span className="text-xs font-black text-white">{liveGame.score?.split('-')[1] || '0'} {liveGame.awayTeam}</span>
                    </div>
                </div>
            )}

            {/* Header Card */}
            <div className={`relative overflow-hidden rounded-[3rem] p-8 border-2 ${style.border} ${style.bg} transition-all duration-500 group tactical-outline`}>
                <div className={`absolute top-0 right-0 w-64 h-64 ${style.accent} blur-[120px] opacity-20 rounded-full`}></div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${style.border} ${style.text} flex items-center gap-2`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${style.accent} animate-pulse`}></span>
                                {prediction.confidence} Confidence
                            </div>
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Score: {prediction.confidenceScore}/100</span>
                            {prediction.confidenceScore < 82 && (
                                <span className="px-2 py-0.5 bg-red-500/20 text-red-500 border border-red-500/50 rounded text-[9px] font-black uppercase tracking-widest animate-pulse">
                                    NO PLAY ZONE
                                </span>
                            )}
                            {prediction.situationalIntelligence?.socialMediaDramaScalar && prediction.situationalIntelligence.socialMediaDramaScalar < 0 && (
                                <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 border border-purple-500/50 rounded text-[9px] font-black uppercase tracking-widest" title={prediction.situationalIntelligence.scandalContext}>
                                    🎭 DISTRACTION PENALTY ({prediction.situationalIntelligence.socialMediaDramaScalar})
                                </span>
                            )}
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter mb-1">
                            {prediction.winner}
                        </h2>
                        <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wide">
                            <span>Defeats</span>
                            <span className="text-zinc-600">{prediction.loser}</span>
                        </div>
                    </div>
                    
                    {prediction.bestBet && prediction.confidenceScore >= 82 && (
                        <div className={`bg-black/60 backdrop-blur-xl p-6 rounded-3xl border border-white/10 max-w-sm w-full relative overflow-hidden ${style.glow}`}>
                            <div className={`absolute top-0 left-0 w-full h-1 ${style.accent}`}></div>
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <CoinIcon className={`w-5 h-5 ${style.text}`} />
                                    <span className={`text-[10px] font-black ${style.text} uppercase tracking-widest`}>Alpha Lock</span>
                                </div>
                                <div className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[9px] font-mono text-zinc-400">
                                    EV+
                                </div>
                            </div>
                            <div className="text-2xl font-black text-white uppercase italic tracking-tight mb-2 leading-none">
                                {prediction.bestBet.selection}
                            </div>
                            <div className="flex justify-between items-end mt-4 pt-4 border-t border-white/10">
                                <div>
                                    <div className="text-[8px] text-zinc-500 uppercase tracking-widest mb-1">Odds</div>
                                    <div className="text-lg font-mono text-white">{prediction.bestBet.odds}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[8px] text-zinc-500 uppercase tracking-widest mb-1">Calculated Edge</div>
                                    <div className="text-lg font-black text-green-400">+{prediction.bestBet.edge}%</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {prediction.confidenceScore < 82 && (
                        <div className="bg-red-950/20 backdrop-blur-xl p-6 rounded-3xl border border-red-500/30 max-w-sm w-full relative overflow-hidden">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-red-500">⚠️</span>
                                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">System Warning</span>
                            </div>
                            <div className="text-sm font-bold text-red-400 uppercase italic tracking-tight mb-1">
                                Edge Too Low to Recommend
                            </div>
                            <div className="text-[10px] text-red-300/70">
                                The Alpha model requires a minimum confidence score of 82 to issue a lock. This matchup is too volatile.
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-8 pt-6 border-t border-white/5">
                    <CriticalInjuryAlert safeguards={prediction.alphaSafeguards || []} />
                    <p className="text-sm md:text-base text-zinc-200 leading-relaxed font-medium">
                        {prediction.analysis}
                    </p>
                    
                    {/* Simulated Scenario Mini-View */}
                    {prediction.simulatedScenarios && (
                        <div className="mt-6 bg-black/30 p-4 rounded-2xl border border-white/5">
                            <div className="flex justify-between items-end mb-2">
                                <div className="flex items-center gap-2">
                                    <AnalyticsIcon className="w-4 h-4 text-zinc-500" />
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Monte Carlo Simulation</span>
                                </div>
                                <span className="text-[10px] font-mono text-zinc-600">{prediction.simulatedScenarios.total.toLocaleString()} Iterations</span>
                            </div>
                            <div className="h-3 w-full bg-zinc-900 rounded-full overflow-hidden flex">
                                <div 
                                    className={`h-full ${style.accent} transition-all duration-1000 ease-out`}
                                    style={{ width: `${(prediction.simulatedScenarios.wins / prediction.simulatedScenarios.total) * 100}%` }}
                                ></div>
                                <div 
                                    className="h-full bg-zinc-800 transition-all duration-1000 ease-out"
                                    style={{ width: `${100 - ((prediction.simulatedScenarios.wins / prediction.simulatedScenarios.total) * 100)}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <span className={`text-xs font-black ${style.text}`}>
                                    {((prediction.simulatedScenarios.wins / prediction.simulatedScenarios.total) * 100).toFixed(1)}% Win Prob
                                </span>
                                <span className="text-[10px] font-mono text-zinc-400">
                                    Avg Margin: {parseFloat(prediction.simulatedScenarios.avgMargin) > 0 ? '+' : ''}{prediction.simulatedScenarios.avgMargin}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex justify-center mb-6">
                <div className="bg-zinc-900/50 p-1 rounded-2xl border border-zinc-800 flex gap-2">
                    {(['TACTICAL', 'SIGNALS'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                                activeTab === tab
                                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                                    : 'text-zinc-500 hover:text-white hover:bg-zinc-800'
                            }`}
                        >
                            {tab === 'TACTICAL' ? 'Hard Analytics' : 'Neural Signals'}
                        </button>
                    ))}
                </div>
            </div>

            {/* TAB CONTENT: TACTICAL */}
            {activeTab === 'TACTICAL' && (
                <div className="space-y-6 animate-fade-in">
                    {/* Props Grid */}
                    {prediction.props && prediction.props.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 px-2">
                                <SpeakerWaveIcon className="w-5 h-5 text-amber-500" />
                                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">High Efficiency Props</h3>
                            </div>
                            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-4">
                                {prediction.props.map((prop, idx) => {
                                    const isSelected = pickSlip.some(p => p.player === prop.player && p.stat === prop.stat);
                                    return (
                                        <PropCard 
                                            key={idx} 
                                            prop={prop} 
                                            onTogglePick={() => onTogglePick?.(prop)}
                                            isSelected={isSelected}
                                            onSearchPlayer={onSearchPlayer}
                                            matchupContext={`${prediction.homeTeam} vs ${prediction.awayTeam}`}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* TAB CONTENT: SIGNALS */}
            {activeTab === 'SIGNALS' && (
                <div className="grid md:grid-cols-2 gap-4 animate-fade-in">
                    
                    {/* Roster Integrity */}
                    {prediction.rosterValidation && <RosterIntegrityCard data={prediction.rosterValidation} />}

                    {/* Advanced Metrics */}
                    {prediction.advancedMetrics && <AdvancedMetricsCard data={prediction.advancedMetrics} />}

                    {/* New Data Cards: Officials & Venue */}
                    {prediction.officialsAnalysis && <OfficialsCard data={prediction.officialsAnalysis} />}
                    {prediction.venueIntelligence && <VenueCard data={prediction.venueIntelligence} />}
                    
                    {/* Situational & Matchups */}
                    {prediction.situationalFactors && <SituationalFactorsCard data={prediction.situationalFactors} />}
                    {prediction.microMatchups && <MicroMatchupsCard data={prediction.microMatchups} />}

                    {/* Trap Detection */}
                    {prediction.trapDetection && (
                        <div className="bg-zinc-950/40 border border-zinc-800 p-5 rounded-3xl relative overflow-hidden">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest">Trap Scanner</h3>
                                <span className={`text-[10px] font-black px-2 py-1 rounded uppercase ${prediction.trapDetection.isTrap ? 'bg-red-500 text-black' : 'bg-green-500/20 text-green-500'}`}>
                                    {prediction.trapDetection.isTrap ? 'TRAP DETECTED' : 'CLEAN'}
                                </span>
                            </div>
                            <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden mb-2">
                                 <div 
                                    className={`h-full transition-all duration-1000 ${prediction.trapDetection.trapScore > 50 ? 'bg-red-500' : 'bg-green-500'}`} 
                                    style={{ width: `${prediction.trapDetection.trapScore}%` }}
                                ></div>
                            </div>
                            <p className="text-[10px] text-zinc-400 italic">{prediction.trapDetection.trapReason}</p>
                        </div>
                    )}

                    {/* Syndicate Intel */}
                    {prediction.syndicateIntel && (
                        <div className="bg-zinc-950/40 border border-zinc-800 p-5 rounded-3xl relative overflow-hidden">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest">Smart Money</h3>
                                <span className="text-[10px] font-black text-amber-500 uppercase">{prediction.syndicateIntel.smartMoney}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-center">
                                 <div className="bg-black/40 p-2 rounded-xl border border-zinc-800">
                                    <div className="text-[8px] text-zinc-600 uppercase">Public</div>
                                    <div className="text-xs font-black text-zinc-300">{prediction.syndicateIntel.publicConsensus}</div>
                                 </div>
                                 <div className="bg-black/40 p-2 rounded-xl border border-zinc-800">
                                    <div className="text-[8px] text-zinc-600 uppercase">Movement</div>
                                    <div className="text-xs font-black text-zinc-300">{prediction.syndicateIntel.lineMovement}</div>
                                 </div>
                            </div>
                        </div>
                    )}

                    {/* Gematria */}
                    {prediction.gematriaIntel && (
                         <div className="bg-purple-950/20 border border-purple-500/30 p-5 rounded-3xl relative overflow-hidden">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xs font-black text-purple-400 uppercase tracking-widest">Gematria Resonance</h3>
                                <span className="text-[10px] font-black text-purple-300 uppercase">{prediction.gematriaIntel.resonance}</span>
                            </div>
                            <p className="text-[10px] text-zinc-400 italic mb-2">{prediction.gematriaIntel.interpretation}</p>
                            <div className="flex gap-2 text-[9px] font-mono text-zinc-500">
                                <span>Name: {prediction.gematriaIntel.teamNameSum}</span>
                                <span>Pythag: {prediction.gematriaIntel.pythagoreanSum}</span>
                                <span>Date: {prediction.gematriaIntel.dateNumerology}</span>
                            </div>
                         </div>
                    )}

                    {/* Quantum */}
                    {prediction.quantumAnalysis && (
                         <div className="bg-cyan-950/20 border border-cyan-500/30 p-5 rounded-3xl relative overflow-hidden group">
                             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay pointer-events-none transition-opacity group-hover:opacity-20 duration-1000"></div>
                            <div className="flex justify-between items-center mb-4 relative z-10">
                                <h3 className="text-xs font-black text-cyan-400 flex items-center gap-2 uppercase tracking-widest">
                                    <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
                                    Quantum Entanglement
                                </h3>
                                <span className="text-[10px] bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/50 font-black text-cyan-300 uppercase">{prediction.quantumAnalysis.waveFunction}</span>
                            </div>
                            
                            {prediction.quantumAnalysis.algorithmicModel && (
                                <div className="mb-3 p-2 bg-black/40 border border-cyan-500/20 rounded-lg relative z-10">
                                    <div className="text-[8px] text-cyan-600 font-bold uppercase tracking-widest mb-0.5">Active Algorithm Matrix</div>
                                    <div className="text-xs font-mono text-cyan-300">{prediction.quantumAnalysis.algorithmicModel}</div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-2 mb-3 relative z-10">
                                <div className="bg-zinc-950/50 p-2 rounded-xl text-center border border-zinc-800">
                                    <div className="text-[8px] text-zinc-500 uppercase tracking-widest mb-1">Entropy Score</div>
                                    <div className={`text-lg font-black ${prediction.quantumAnalysis.entropyScore > 50 ? 'text-red-400' : 'text-green-400'}`}>
                                        {prediction.quantumAnalysis.entropyScore}%
                                    </div>
                                </div>
                                <div className="bg-zinc-950/50 p-2 rounded-xl text-center border border-zinc-800">
                                    <div className="text-[8px] text-zinc-500 uppercase tracking-widest mb-1">Volatility Index</div>
                                    <div className="text-lg font-black text-white">
                                        {prediction.quantumAnalysis.volatilityIndex}
                                    </div>
                                </div>
                            </div>
                            
                            {prediction.quantumAnalysis.butterflyVariable && (
                                <div className="text-[10px] text-zinc-300 mb-2 relative z-10">
                                    <span className="text-amber-500 font-bold uppercase tracking-wider text-[9px] mr-2">Butterfly Variable:</span>
                                    {prediction.quantumAnalysis.butterflyVariable}
                                </div>
                            )}
                            
                            {prediction.quantumAnalysis.interferencePattern && (
                                <div className="text-[10px] text-zinc-300 mb-2 relative z-10">
                                    <span className="text-purple-400 font-bold uppercase tracking-wider text-[9px] mr-2">Interference:</span>
                                    {prediction.quantumAnalysis.interferencePattern}
                                </div>
                            )}
                            
                            <div className="text-[11px] text-cyan-100 font-medium leading-relaxed bg-cyan-900/20 p-3 rounded-xl border border-cyan-500/20 relative z-10">
                                <span className="text-cyan-500 font-bold uppercase tracking-wider text-[9px] block mb-1">Dominant Energy Vector</span>
                                {prediction.quantumAnalysis.dominantEnergy}
                            </div>
                         </div>
                    )}
                </div>
            )}
            
            {/* Footer Metrics */}
            {prediction.dataQuality && (
                <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-4 flex flex-col gap-2 mt-4">
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                        <span>DATA FIDELITY: {prediction.dataQuality.fidelityScore}%</span>
                        <span>POINTS ANALYZED: {prediction.dataQuality.dataPointsAnalyzed}</span>
                        <span>LATENCY: {prediction.dataQuality.freshness}</span>
                    </div>
                    {prediction.dataQuality.sourcesQueried && prediction.dataQuality.sourcesQueried.length > 0 && (
                        <div className="pt-2 border-t border-zinc-800/50 flex flex-wrap gap-2 items-center">
                            <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Sources Verified:</span>
                            {prediction.dataQuality.sourcesQueried.map((source, idx) => (
                                <span key={idx} className="text-[9px] bg-black/40 px-2 py-0.5 rounded border border-zinc-800 text-zinc-400">
                                    {source}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
});
