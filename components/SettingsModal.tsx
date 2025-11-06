import React, { useState, useEffect } from 'react';
import type { UserSettings, ConfidenceFilterLevel, OddsFormat } from '../types';
import { SPORTS } from '../constants';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: UserSettings;
  onSave: (newSettings: UserSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, currentSettings, onSave }) => {
  const [settings, setSettings] = useState<UserSettings>(currentSettings);

  useEffect(() => {
    setSettings(currentSettings);
  }, [currentSettings, isOpen]);
  
  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    onSave(settings);
  };

  const confidenceOptions: ConfidenceFilterLevel[] = ['All', 'High', 'Medium', 'Low'];
  const oddsOptions: OddsFormat[] = ['American', 'Decimal'];

  return (
    <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
    >
      <div 
        className="bg-[#161b22] border border-gray-700 rounded-2xl shadow-2xl w-full max-w-md m-4 p-6 space-y-6 animate-fade-in"
        onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside
      >
        <div className="flex justify-between items-center">
            <h2 id="settings-title" className="text-2xl font-bold text-purple-400">Settings</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-white">&times;</button>
        </div>

        {/* Preferred Sport */}
        <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">Preferred Sport</label>
            <select
                value={settings.preferredSport}
                onChange={(e) => setSettings({ ...settings, preferredSport: e.target.value })}
                className="w-full bg-[#0d1117] border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
                {SPORTS.map(sport => <option key={sport.name} value={sport.name}>{sport.name}</option>)}
            </select>
        </div>

        {/* Default Confidence Filter */}
        <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">Default Confidence Filter</label>
            <div className="flex gap-2 flex-wrap">
                {confidenceOptions.map(option => (
                    <button
                        key={option}
                        onClick={() => setSettings({ ...settings, defaultConfidenceFilter: option })}
                        className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${
                            settings.defaultConfidenceFilter === option
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-700 hover:bg-gray-600 text-slate-300'
                        }`}
                    >
                        {option}
                    </button>
                ))}
            </div>
        </div>

        {/* Preferred Odds Format */}
        <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">Preferred Odds Format</label>
             <div className="flex gap-2 flex-wrap">
                {oddsOptions.map(option => (
                    <button
                        key={option}
                        onClick={() => setSettings({ ...settings, oddsFormat: option })}
                        className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${
                            settings.oddsFormat === option
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-700 hover:bg-gray-600 text-slate-300'
                        }`}
                    >
                        {option}
                    </button>
                ))}
            </div>
        </div>
        
        <div className="flex justify-end gap-4 pt-4">
            <button onClick={onClose} className="text-slate-400 hover:text-white font-semibold py-2 px-4 rounded-md">Cancel</button>
            <button onClick={handleSave} className="bg-purple-600 text-white font-bold py-2 px-6 rounded-md hover:bg-purple-500 transition-colors">Save</button>
        </div>
      </div>
    </div>
  );
};
