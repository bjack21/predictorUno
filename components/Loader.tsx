
import React, { useState, useEffect } from 'react';

const LOAD_MESSAGES = [
  "Mapping Neural Game Geometry...",
  "Calculating Highest Possibility...",
  "Aggregating Global Data Streams...",
  "Analyzing 32k Thinking Tokens...",
  "Calibrating Human Variables...",
  "Simulating Individual Clamps...",
  "Cross-Referencing Travel Fatigue...",
  "Running Veto Scrutiny Phase...",
  "Locking 180-Alpha Signal..."
];

interface LoaderProps {
  variant?: 'full' | 'inline';
  size?: 'sm' | 'md' | 'lg';
}

export const Loader: React.FC<LoaderProps> = ({ variant = 'full', size = 'lg' }) => {
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    if (variant === 'inline') return;
    const timer = setInterval(() => {
      setMsgIdx((prev) => (prev + 1) % LOAD_MESSAGES.length);
    }, 1500);
    return () => clearInterval(timer);
  }, [variant]);

  if (variant === 'inline') {
    const sizeClasses = {
      sm: 'w-4 h-4 border-2',
      md: 'w-6 h-6 border-2',
      lg: 'w-8 h-8 border-4'
    };
    return (
      <div className={`inline-block rounded-full border-current border-t-transparent animate-spin ${sizeClasses[size]}`} role="status" aria-label="loading">
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-10 animate-fade-in" role="status" aria-live="polite">
      <div className="relative flex items-center justify-center w-32 h-32">
        <div className="absolute inset-0 border-2 border-amber-500/10 rounded-full"></div>
        <div className="absolute inset-0 border-2 border-t-amber-500 rounded-full animate-spin"></div>
        <div className="absolute inset-4 border-2 border-b-amber-500/40 rounded-full animate-spin [animation-direction:reverse] [animation-duration:3s]"></div>
        <div className="w-6 h-6 bg-amber-500 rounded-full shadow-[0_0_30px_rgba(245,158,11,1)] animate-pulse"></div>
      </div>
      
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-black text-white tracking-[0.4em] uppercase italic">Scrutiny Active</h2>
        <div className="flex items-center justify-center gap-4">
            <span className="h-px w-12 bg-amber-500/20"></span>
            <p className="text-[11px] font-black text-amber-500 uppercase tracking-[0.3em] min-w-[280px]">
                {LOAD_MESSAGES[msgIdx]}
            </p>
            <span className="h-px w-12 bg-amber-500/20"></span>
        </div>
        <div className="max-w-xs mx-auto pt-4 opacity-40">
            <p className="text-zinc-600 text-[9px] font-bold leading-relaxed uppercase tracking-widest">
                Neural Mapping • Kinetic Scrutiny • Human Variable Scan
            </p>
        </div>
      </div>
    </div>
  );
};
