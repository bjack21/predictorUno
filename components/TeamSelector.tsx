
import React, { memo } from 'react';

interface TeamSelectorProps {
  teamA: string;
  setTeamA: (value: string) => void;
  teamB: string;
  setTeamB: (value: string) => void;
  onEnter?: () => void;
}

export const TeamSelector: React.FC<TeamSelectorProps> = memo(({ teamA, setTeamA, teamB, setTeamB, onEnter }) => {
  // Use DiceBear Identicon for a "logo-like" geometric feel that is SVG based
  // Updated to use transparent background for better UI blending
  const getLogoUrl = (name: string) => 
    `https://api.dicebear.com/9.x/identicon/svg?seed=${encodeURIComponent(name)}&backgroundColor=transparent`;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && teamA && teamB && onEnter) {
      onEnter();
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-24 py-10 px-4">
      {/* Team A Input & Logo */}
      <div className="flex flex-col items-center gap-8 w-full md:w-auto">
        <div className="relative group">
          <div className={`w-32 h-32 rounded-[2rem] border-2 transition-all duration-700 flex items-center justify-center overflow-hidden bg-black shadow-2xl relative z-10 ${
            teamA 
              ? 'border-amber-500 scale-110 opacity-100 rotate-0 shadow-[0_0_60px_rgba(245,158,11,0.25)]' 
              : 'border-zinc-900 scale-95 opacity-30 rotate-3 shadow-none'
          }`}>
            {teamA ? (
              <img 
                src={getLogoUrl(teamA)} 
                alt={teamA} 
                className="w-20 h-20 object-contain animate-fade-in transition-transform duration-1000 group-hover:scale-110"
              />
            ) : (
              <div className="text-zinc-800 font-black text-4xl uppercase italic tracking-tighter opacity-50">?</div>
            )}
            
            {/* HUD Scanlines overlay */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(245,158,11,0.05)_1px,transparent_1px)] bg-[length:100%_3px] opacity-20"></div>
          </div>
          
          <div className="absolute -bottom-3 -right-3 bg-zinc-900 border-2 border-zinc-800 rounded-xl px-3 py-1 flex items-center justify-center text-[9px] font-black text-amber-500 z-20 shadow-2xl tracking-[0.2em]">
            HOME
          </div>
          
          {/* Decorative tactical aura */}
          {teamA && (
            <div className="absolute inset-0 bg-amber-500/10 blur-[40px] rounded-full -z-10 animate-pulse"></div>
          )}
        </div>
        
        <div className="relative w-full md:w-64 group/input">
            <input
              type="text"
              value={teamA}
              onChange={(e) => setTeamA(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="ENTER HOME TEAM"
              className="w-full bg-zinc-950 border-2 border-zinc-900 rounded-2xl px-6 py-4 text-center text-[10px] font-black text-white focus:outline-none focus:border-amber-500/50 transition-all placeholder:text-zinc-800 uppercase tracking-[0.3em] shadow-inner"
            />
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-amber-500 transition-all duration-500 group-focus-within/input:w-1/2"></div>
        </div>
      </div>

      {/* VS Spacer */}
      <div className="flex flex-col items-center py-6">
        <div className="relative">
            <div className="text-zinc-900 font-black text-5xl italic tracking-tighter select-none opacity-40 animate-pulse">VS</div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white font-black text-xs italic tracking-widest opacity-80">DELTA</div>
        </div>
        <div className="h-24 w-[1px] bg-gradient-to-b from-transparent via-zinc-800 to-transparent mt-4"></div>
      </div>

      {/* Team B Input & Logo */}
      <div className="flex flex-col items-center gap-8 w-full md:w-auto">
        <div className="relative group">
          <div className={`w-32 h-32 rounded-[2rem] border-2 transition-all duration-700 flex items-center justify-center overflow-hidden bg-black shadow-2xl relative z-10 ${
            teamB 
              ? 'border-amber-500 scale-110 opacity-100 rotate-0 shadow-[0_0_60px_rgba(245,158,11,0.25)]' 
              : 'border-zinc-900 scale-95 opacity-30 -rotate-3 shadow-none'
          }`}>
            {teamB ? (
              <img 
                src={getLogoUrl(teamB)} 
                alt={teamB} 
                className="w-20 h-20 object-contain animate-fade-in transition-transform duration-1000 group-hover:scale-110"
              />
            ) : (
              <div className="text-zinc-800 font-black text-4xl uppercase italic tracking-tighter opacity-50">?</div>
            )}

            {/* HUD Scanlines overlay */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(245,158,11,0.05)_1px,transparent_1px)] bg-[length:100%_3px] opacity-20"></div>
          </div>

          <div className="absolute -bottom-3 -right-3 bg-zinc-900 border-2 border-zinc-800 rounded-xl px-3 py-1 flex items-center justify-center text-[9px] font-black text-amber-500 z-20 shadow-2xl tracking-[0.2em]">
            AWAY
          </div>
          
          {/* Decorative tactical aura */}
          {teamB && (
            <div className="absolute inset-0 bg-amber-500/10 blur-[40px] rounded-full -z-10 animate-pulse"></div>
          )}
        </div>

        <div className="relative w-full md:w-64 group/input">
            <input
              type="text"
              value={teamB}
              onChange={(e) => setTeamB(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="ENTER AWAY TEAM"
              className="w-full bg-zinc-950 border-2 border-zinc-900 rounded-2xl px-6 py-4 text-center text-[10px] font-black text-white focus:outline-none focus:border-amber-500/50 transition-all placeholder:text-zinc-800 uppercase tracking-[0.3em] shadow-inner"
            />
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-amber-500 transition-all duration-500 group-focus-within/input:w-1/2"></div>
        </div>
      </div>
    </div>
  );
});
