import type React from 'react';

// FIX: Define ConfidenceLevel type for predictions.
export type ConfidenceLevel = 'High' | 'Medium' | 'Low';

// FIX: Define the main Prediction data structure.
export interface Prediction {
  winner: string;
  loser: string;
  confidence: ConfidenceLevel;
  confidenceScore: number;
  analysis: string;
  odds: {
    winner: string;
    loser: string;
  };
}

// FIX: Define ConfidenceFilterLevel type for user settings.
export type ConfidenceFilterLevel = 'All' | ConfidenceLevel;

// FIX: Define OddsFormat type for user settings.
export type OddsFormat = 'American' | 'Decimal';

// FIX: Define UserSettings structure for localStorage and settings modal.
export interface UserSettings {
  preferredSport: string;
  defaultConfidenceFilter: ConfidenceFilterLevel;
  oddsFormat: OddsFormat;
}

// FIX: Define Sport type used in constants and selectors.
export interface Sport {
    name: string;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
}
