
import React, { memo } from 'react';

export const BackgroundArt: React.FC = memo(() => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Neural Hub Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-500/5 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-500/5 blur-[120px] rounded-full"></div>
      
      {/* Floating Sport Ornaments */}
      <div className="absolute top-[15%] left-[5%] opacity-10 floating-art" style={{ animationDelay: '0s' }}>
        <svg className="w-48 h-48 text-zinc-800" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 12.793V21m0-8.207A8.963 8.963 0 0012.793 3H12m9 9.793A8.963 8.963 0 013 12.793m18 0l-9-9" />
            <path d="M12 3a9 9 0 100 18 9 9 0 000-18z" />
        </svg>
      </div>

      <div className="absolute top-[45%] right-[2%] opacity-[0.05] floating-art" style={{ animationDelay: '-5s' }}>
        <svg className="w-64 h-64 text-zinc-800" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21a9 9 0 110-18 9 9 0 010 18z" />
            <path d="M12 3.75v16.5m-7.25-7.25h14.5" />
            <path d="m7.5 7.5 9 9m-9 0 9-9" />
        </svg>
      </div>

      <div className="absolute bottom-[10%] left-[8%] opacity-[0.08] floating-art" style={{ animationDelay: '-12s' }}>
        <svg className="w-56 h-56 text-zinc-800" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3a9 9 0 110 18 9 9 0 010-18z" />
            <path d="M15.91 15.91a4.5 4.5 0 01-6.364 0m6.364 0a4.5 4.5 0 00-6.364 0m-1.091-6.364a4.5 4.5 0 016.364 0m-6.364 0a4.5 4.5 0 006.364 0" />
        </svg>
      </div>

      {/* Hex Grid Subtle Overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, #f59e0b 1px, transparent 0)`, backgroundSize: '40px 40px' }}></div>
      
      {/* Depth Blur */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050505]"></div>
    </div>
  );
});
