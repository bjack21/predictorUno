import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { SportSelector } from './components/SportSelector';
import { TeamSelector } from './components/TeamSelector';
import { PredictionDisplay } from './components/PredictionDisplay';
import { Loader } from './components/Loader';
import { Footer } from './components/Footer';
import { SettingsModal } from './components/SettingsModal';
import { getPrediction } from './services/geminiService';
import type { Prediction, UserSettings } from './types';
import { SPORTS } from './constants';

const App: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const storedSettings = localStorage.getItem('prognosSettings');
      if (storedSettings) {
        return JSON.parse(storedSettings);
      }
    } catch (error) {
      console.error("Failed to parse settings from localStorage", error);
    }
    return {
      preferredSport: SPORTS[0].name,
      defaultConfidenceFilter: 'All',
      oddsFormat: 'American',
    };
  });
  
  const [selectedSport, setSelectedSport] = useState<string>(settings.preferredSport);
  const [teamA, setTeamA] = useState<string>('');
  const [teamB, setTeamB] = useState<string>('');
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  useEffect(() => {
    setSelectedSport(settings.preferredSport);
  }, [settings.preferredSport]);

  const handleSaveSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    try {
        localStorage.setItem('prognosSettings', JSON.stringify(newSettings));
    } catch (error) {
        console.error("Failed to save settings to localStorage", error);
    }
    setIsSettingsOpen(false);
  };

  const handlePredict = useCallback(async () => {
    if (!teamA || !teamB) {
      setError('Please enter both team names.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const result = await getPrediction(selectedSport, teamA, teamB, settings.oddsFormat);
      setPrediction(result);
    } catch (err) {
      setError('Failed to get prediction. The AI assistant might be busy. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedSport, teamA, teamB, settings.oddsFormat]);

  const predictionMatchesFilter = prediction && (settings.defaultConfidenceFilter === 'All' || settings.defaultConfidenceFilter === prediction.confidence);

  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-200 font-sans flex flex-col">
      <Header onOpenSettings={() => setIsSettingsOpen(true)} />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12 flex flex-col items-center">
        <div className="w-full max-w-2xl space-y-8">
          
          <div className="bg-[#161b22]/70 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-gray-800">
            <h2 className="text-xl font-bold text-purple-400 mb-4 text-center">1. Select a Sport</h2>
            <SportSelector selectedSport={selectedSport} onSelectSport={setSelectedSport} />
          </div>
          
          <div className="bg-[#161b22]/70 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-gray-800">
            <h2 className="text-xl font-bold text-purple-400 mb-4 text-center">2. Enter Teams</h2>
            <TeamSelector
              teamA={teamA}
              setTeamA={setTeamA}
              teamB={teamB}
              setTeamB={setTeamB}
            />
          </div>

          <div className="text-center">
            <button
              onClick={handlePredict}
              disabled={isLoading || !teamA || !teamB}
              className="bg-purple-600 text-white font-bold py-3 px-8 rounded-full hover:bg-purple-500 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-600/20"
            >
              {isLoading ? 'Analyzing...' : 'Get Prediction'}
            </button>
          </div>
          
          {isLoading && <Loader />}
          
          {error && <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg text-center">{error}</div>}

          {prediction && !predictionMatchesFilter && (
             <div className="bg-blue-900/50 border border-blue-700 text-blue-300 p-4 rounded-lg text-center mt-8 animate-fade-in">
               A prediction was found but it did not match your confidence filter of "{settings.defaultConfidenceFilter}". You can change the filter in settings.
             </div>
          )}

          {prediction && predictionMatchesFilter && (
            <div className="mt-8 w-full animate-fade-in">
                <PredictionDisplay 
                  prediction={prediction} 
                />
            </div>
          )}

        </div>
      </main>
      <Footer />
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentSettings={settings}
        onSave={handleSaveSettings}
      />
    </div>
  );
};

export default App;