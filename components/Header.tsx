import React from 'react';
import { LogoIcon, SettingsIcon } from './Icons';

interface HeaderProps {
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  return (
    <header className="bg-[#161b22]/60 backdrop-blur-md border-b border-gray-800 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
            <LogoIcon className="w-8 h-8 mr-3 text-purple-400" />
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-purple-400">
            Prognos AI Predictor
            </h1>
        </div>
        <button
            onClick={onOpenSettings}
            className="text-slate-400 hover:text-purple-400 transition-colors"
            aria-label="Open settings"
        >
            <SettingsIcon className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};