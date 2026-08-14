
import React, { memo } from 'react';
import { LogoIcon, SettingsIcon, SearchIcon } from './Icons';

export type MainViewType = 'Feed' | 'Odds' | 'Injuries' | 'Vault' | 'Analytics' | 'History';

interface HeaderProps {
  onOpenSettings: () => void;
  currentView: MainViewType;
  onSetView: (view: MainViewType) => void;
  vaultCount: number;
  onOpenReflection: () => void;
  onOpenSearch: () => void;
  onOpenDevMonitor: () => void;
  isPremium?: boolean;
  dailyUsage?: number;
  limit?: number;
}

export const Header: React.FC<HeaderProps> = memo(({
  onOpenSettings,
  currentView,
  onSetView,
  vaultCount,
  onOpenReflection,
  onOpenSearch,
  onOpenDevMonitor,
  isPremium,
  dailyUsage = 0,
  limit = 2
}) => {
  return (
    <header className="bg-black/95 backdrop-blur-2xl border-b border-zinc-900 sticky top-0 z-50 shadow-2xl art-border-glow">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
        <div className="flex items-center gap-4 lg:gap-6 flex-wrap">
            <button onClick={() => onSetView('Feed')} className="flex items-center group">
                <div className="relative">
                    <LogoIcon className={`w-8 h-8 sm:w-9 sm:h-9 mr-2 sm:mr-3 transition-colors ${currentView === 'Feed' ? 'text-amber-500' : 'text-zinc-700 group-hover:text-amber-500'}`} />
                    <div className="absolute inset-0 bg-amber-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-full"></div>
                </div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tighter uppercase italic text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-100 to-amber-500 hidden sm:block">
                    Pro N os
                </h1>
            </button>

            <nav className="flex items-center gap-1 sm:gap-1.5 bg-zinc-900/50 p-1 rounded-2xl border border-zinc-800 backdrop-blur-md overflow-x-auto max-w-[58vw] sm:max-w-none custom-scrollbar">
                <button 
                    onClick={() => onSetView('Feed')}
                    className={`px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-[0.15em] transition-all shrink-0 ${
                        currentView === 'Feed' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                >
                    Feed
                </button>
                <button 
                    onClick={() => onSetView('Odds')}
                    className={`px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-[0.15em] transition-all shrink-0 flex items-center gap-1.5 ${
                        currentView === 'Odds' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                >
                    Odds Matrix
                </button>
                <button 
                    onClick={() => onSetView('Injuries')}
                    className={`px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-[0.15em] transition-all shrink-0 flex items-center gap-1.5 ${
                        currentView === 'Injuries' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                >
                    Injury Wire
                </button>
                <button 
                    onClick={() => onSetView('Vault')}
                    className={`px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-[0.15em] transition-all shrink-0 relative flex items-center gap-1.5 ${
                        currentView === 'Vault' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                >
                    Vault
                    {vaultCount > 0 && (
                        <span className="w-4 h-4 sm:w-5 sm:h-5 bg-white text-black text-[9px] font-black rounded-full flex items-center justify-center shadow-md">
                            {vaultCount}
                        </span>
                    )}
                </button>
                <button 
                    onClick={() => onSetView('Analytics')}
                    className={`px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-[0.15em] transition-all shrink-0 ${
                        currentView === 'Analytics' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                >
                    Analytics
                </button>
                <button 
                    onClick={() => onSetView('History')}
                    className={`px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-[0.15em] transition-all shrink-0 ${
                        currentView === 'History' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                >
                    History
                </button>
            </nav>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3">
            {/* Dev Telemetry / Neural Heartbeat Trigger */}
            <button
              onClick={onOpenDevMonitor}
              className="hidden lg:flex flex-col items-end px-4 py-1.5 border-r border-zinc-800 hover:bg-zinc-900/50 rounded-xl transition-all group"
              title="Click to open Developer Telemetry & System Monitor"
            >
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                <span className="text-[9px] font-black text-zinc-400 group-hover:text-amber-400 uppercase tracking-[0.2em] transition-colors">Dev Monitor</span>
              </div>
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">LIVE TELEMETRY</span>
            </button>
            
            {/* Account Status / Usage Badge */}
            <div className="hidden md:flex items-center px-2">
                {isPremium ? (
                    <div className="bg-amber-500/10 border border-amber-500/50 px-3 py-1.5 rounded-lg flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse shadow-[0_0_8px_orange]"></span>
                        <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">ALPHA ELITE</span>
                    </div>
                ) : (
                    <div className="bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg flex flex-col items-end">
                        <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Daily Scans</span>
                        <div className="flex items-center gap-1">
                             <span className={`text-[11px] font-black ${dailyUsage >= limit ? 'text-red-500' : 'text-white'}`}>{dailyUsage}</span>
                             <span className="text-[9px] text-zinc-600">/</span>
                             <span className="text-[11px] font-black text-zinc-600">{limit}</span>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Dev Monitor Mobile Icon Button */}
            <button
              onClick={onOpenDevMonitor}
              className="lg:hidden text-amber-400 hover:text-amber-300 transition-all p-2.5 bg-zinc-900/60 rounded-2xl border border-amber-500/20"
              title="Developer Telemetry Monitor"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </button>

            {/* Search Trigger */}
            <button
                onClick={onOpenSearch}
                className="text-zinc-400 hover:text-white transition-all p-2.5 sm:p-3 hover:bg-zinc-800/50 rounded-2xl border border-transparent hover:border-zinc-800"
                aria-label="Smart Search"
            >
                <SearchIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Neural Optimization Trigger */}
            <button
                onClick={onOpenReflection}
                className="text-zinc-500 hover:text-purple-400 transition-all p-2.5 sm:p-3 bg-zinc-900/50 rounded-2xl border border-white/5 group relative hidden sm:block"
                title="End of Day Neural Optimization"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6 group-hover:animate-pulse">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
                <div className="absolute top-0 right-0 w-2 h-2 bg-purple-500 rounded-full animate-ping"></div>
            </button>

            <button
                onClick={onOpenSettings}
                className="text-zinc-500 hover:text-amber-500 transition-all p-2.5 sm:p-3 hover:rotate-90 duration-700 bg-zinc-900/50 rounded-2xl border border-white/5"
                aria-label="Open settings"
            >
                <SettingsIcon className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>
        </div>
      </div>
    </header>
  );
});

