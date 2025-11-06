import React from 'react';
import type { Prediction, ConfidenceLevel } from '../types';

// FIX: Define props for the PredictionDisplay component.
interface PredictionDisplayProps {
  prediction: Prediction;
}

const confidenceStyles: Record<ConfidenceLevel, { bg: string; text: string; border: string }> = {
    High: { bg: 'bg-green-900/50', text: 'text-green-300', border: 'border-green-700' },
    Medium: { bg: 'bg-yellow-900/50', text: 'text-yellow-300', border: 'border-yellow-700' },
    Low: { bg: 'bg-red-900/50', text: 'text-red-300', border: 'border-red-700' },
};

// FIX: Implement the PredictionDisplay component to show prediction details.
export const PredictionDisplay: React.FC<PredictionDisplayProps> = ({ prediction }) => {

  const confidenceStyle = confidenceStyles[prediction.confidence];
  const confidencePercentage = (prediction.confidenceScore * 100).toFixed(0);

  return (
    <div className="bg-[#161b22]/70 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-gray-800 space-y-6">
      
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-purple-400">Match Prediction</h2>
        <p className="text-slate-400">{prediction.winner} vs {prediction.loser}</p>
      </div>

      {/* Winner/Loser */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
        <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/30">
          <p className="text-sm font-semibold text-green-400 uppercase tracking-wider">Predicted Winner</p>
          <p className="text-2xl font-bold text-white mt-1">{prediction.winner}</p>
        </div>
        <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/30">
          <p className="text-sm font-semibold text-red-400 uppercase tracking-wider">Predicted Loser</p>
          <p className="text-2xl font-bold text-white mt-1">{prediction.loser}</p>
        </div>
      </div>

      {/* Confidence */}
       <div className={`p-4 rounded-lg border ${confidenceStyle.bg} ${confidenceStyle.border}`}>
        <h3 className="text-lg font-semibold text-slate-200 mb-2">Confidence Level</h3>
        <div className="flex items-center justify-between">
          <span className={`text-xl font-bold ${confidenceStyle.text}`}>{prediction.confidence}</span>
          <div className="w-2/3 bg-gray-700 rounded-full h-2.5">
            <div 
              className="bg-purple-500 h-2.5 rounded-full" 
              style={{ width: `${confidencePercentage}%` }}
            ></div>
          </div>
          <span className="text-sm font-mono text-slate-400">{confidencePercentage}%</span>
        </div>
      </div>

      {/* Analysis */}
      <div>
        <h3 className="text-lg font-semibold text-slate-200 mb-2">AI Analysis</h3>
        <p className="text-slate-300 bg-black/20 p-4 rounded-md border border-gray-700 text-justify">
          {prediction.analysis}
        </p>
      </div>

      {/* Odds */}
      <div>
        <h3 className="text-lg font-semibold text-slate-200 mb-2">Predicted Odds</h3>
        <div className="flex justify-around bg-black/20 p-4 rounded-md border border-gray-700">
          <div className="text-center">
            <p className="text-slate-400">{prediction.winner}</p>
            <p className="text-xl font-bold text-purple-400">{prediction.odds.winner}</p>
          </div>
          <div className="text-center">
            <p className="text-slate-400">{prediction.loser}</p>
            <p className="text-xl font-bold text-slate-200">{prediction.odds.loser}</p>
          </div>
        </div>
      </div>

    </div>
  );
};
