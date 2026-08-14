
import type React from 'react';

// Common Types
export type ConfidenceLevel = 'High' | 'Medium' | 'Low';
export type MotivationLevel = 'Elite (Must-Win)' | 'High (Playoff Push)' | 'Moderate (Regular Season)' | 'Low (Resting/Tanking)';
export type OpponentType = 'Divisional' | 'Playoff Team' | 'Conference' | 'Regular';
export type OddsFormat = 'American' | 'Decimal' | 'Fractional';
export type ConfidenceFilterLevel = 'All' | 'High' | 'Medium' | 'Low';

// Sport
export interface Sport {
  name: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

// User Settings
export interface UserSettings {
  preferredSport: string;
  defaultConfidenceFilter: ConfidenceFilterLevel;
  oddsFormat: OddsFormat;
}

// Tokenomics
export type MiningAlgo = 'RandomX-Pro' | 'Ghostrider-Alpha';

export interface MiningState {
    isMining: boolean;
    hps: number;
    totalMined: number;
    unpaidBalance: number;
    algo: MiningAlgo;
    efficiency: number;
}

// User Profile
export interface UserProfile {
    name: string;
    isVeteran: boolean;
    isVerified: boolean;
    idImage?: string; // Base64 or URL
    joinedDate: number;
}

// Logging & Analytics
export interface SystemLog {
    id: string;
    timestamp: number;
    type: 'NEURAL' | 'NETWORK' | 'SYSTEM' | 'ERROR' | 'EXECUTION';
    message: string;
    latency?: number;
    details?: any;
}

export interface BankrollMetrics {
    startingBalance: number;
    currentBalance: number;
    totalWagered: number;
    totalProfit: number;
    roi: number;
    record: { wins: number; losses: number; pushes: number };
    unitSize: number;
}

// Performance & Stats
export interface PerformanceGame {
  date: string;
  opponent: string;
  opponentType?: OpponentType;
  actualValue: string;
  hit: boolean;
}

export interface BookLine {
  book: string;
  line: string;
  odds: string;
}

export interface MatchupDelta {
    category: string;
    playerStat: string;
    opponentStat: string;
    advantage: 'Player' | 'Opponent' | 'Neutral';
}

export interface PsychologicalAudit {
    loadLevel: 'Stable' | 'Elevated' | 'Critical';
    factor: string;
    impactOnDrive: 'High' | 'Moderate' | 'Low';
    wellnessContext?: string;
    offFieldDistraction?: string; // Scandal/Drama/Contract
    mediaPressure?: 'High' | 'Normal' | 'Low';
}

export interface PhysicalNuance {
    knockType: string;
    recency: string;
    kineticImpact: 'Minimal' | 'Moderate' | 'Severe';
    isMasked: boolean;
}

export interface MatchupMetric {
  rank: string;
  category: string;
  strength: 'Weak' | 'Strong' | 'Neutral';
}

export interface Injury {
  player: string;
  status: string;
  impactScore: number;
  role: string;
  analysis?: string;
}

export interface AdvancedMetric {
  label: string;
  value: string;
  percentile: number;
  description: string;
}

export interface CalibrationMetrics {
  rosterStability: number;
  marketAlignment: number;
  situationalCertainty: number;
  varianceRisk: 'Minimal' | 'Moderate' | 'High' | 'Critical';
  psychologicalLoadIndex?: number;
}

export interface AlphaSafeguard {
    safeguard: string;
    status: 'PASSED' | 'FLAGGED' | 'NEUTRAL';
    finding: string;
}

export interface QuantumAnalysis {
    entropyScore: number; // 0-100 (0=Deterministic, 100=Chaos/CoinFlip)
    waveFunction: 'Collapsing (Certainty)' | 'Superposition (Uncertainty)' | 'Entangled (Rivalry)';
    volatilityIndex: number;
    dominantEnergy: string;
    algorithmicModel?: 'Schrödinger Form' | 'Markov Chaos' | 'Heisenberg Uncertainty' | 'Bose-Einstein Momentum';
    butterflyVariable?: string; // The single micro-variable triggering a cascade
    interferencePattern?: 'Constructive (Strengths Align)' | 'Destructive (Strengths Cancel)';
}

export interface GematriaIntel {
    teamNameSum: number; // Simple Cipher
    pythagoreanSum: number; // Full Reduction (e.g. 56 -> 11)
    isMasterNumber: boolean; // 11, 22, 33
    dateNumerology: number;
    resonance: 'Harmonic' | 'Dissonant' | 'Neutral';
    cipherText: string; 
    letterBreakdown?: string; 
    interpretation: string;
}

export interface BiblicalMatch {
    number: number;
    context: string; // e.g. "7th game of series", "Jersey #7", "40pt Avg"
    hebrewMeaning: string; // e.g. "Zayin (Weapon/Crown)", "Mem (Water/Trial)"
    significance: string;
    isPositive: boolean;
}

export interface BiblicalAnalysis {
    matches: BiblicalMatch[];
    divineBoostScore: number; // The "+1" accumulation
    summary: string;
}

export interface FatigueAnalysis {
    homeDaysRest: number;
    awayDaysRest: number;
    homeFatigueScore: number; // 0-100 (100 is exhausted)
    awayFatigueScore: number; // 0-100 (100 is exhausted)
    travelImpact: string;
    scheduleSpot: string; // e.g., "3rd Game in 4 Nights"
}

export interface SituationalIntelligence {
  motivationLevel: MotivationLevel;
  playoffContext: string;
  isHighStakes: boolean;
  leverageAnalysis: string;
  expectedGameScript: 'High-Pace/Competitive' | 'Low-Pace/Blowout-Risk' | 'Defensive-Grind';
  weatherImpact?: string;
  venueFactor?: string;
  scandalContext?: string; // Drama info
  socialMediaDramaScalar?: number; // -1 to 0 factor based on drama
  fatigueAnalysis?: FatigueAnalysis;
}

export interface SyndicateIntel {
    smartMoney: 'Home' | 'Away' | 'Neutral';
    publicConsensus: string; // e.g. "78% on Home"
    lineMovement: 'Sharp Move' | 'Public Steam' | 'Stagnant';
    reverseLineMovementDetected: boolean;
    explanation: string;
}

export interface TrapDetection {
    isTrap: boolean;
    trapScore: number; // 0-100
    trapReason?: string; // "Line too good to be true for a public favorite"
}

export interface ProjectionData {
  last5Average: string;
  last10Average: string;
  seasonAverage: string;
  floor: string;
  ceiling: string;
  consistencyScore: number;
}

export interface PlayerDeepDive {
    last10Games: number[];
    h2hGames: number[]; // vs specific opponent
    consistencyScore: number;
    summary: string;
    trendDirection: 'Up' | 'Down' | 'Flat';
}

export interface DeepPsyche {
    internalMonologue: string; // The simulated "player voice" based on context
    motivationOverride: 'Fired Up' | 'Doubtful' | 'Laser Focused' | 'Anxious' | 'Vengeful';
    visceralImpactScore: number; // 0 to 10
}

export interface PropBet {
  player: string;
  bet: string;
  line: string;
  stat: string;
  type: 'MORE' | 'LESS';
  odds: string;
  probability: string;
  projectedValue?: string;
  ev?: number;
  edge?: number;
  isElite179?: boolean;
  isHot?: boolean; // New field: Is player currently on a hot streak?
  last3Games?: number[]; // The actual values for the last 3 games
  last3GamesAvg?: string; // Average over last 3 games
  last3GamesHitRate?: string; // e.g. "3/3" or "100%"
  last4GamesStreak?: {
    type: 'HOT' | 'COLD' | 'NEUTRAL';
    avg: string;
    hitRate: string; // e.g. "4/4"
    games: number[]; // The actual values
  };
  vsOpponentStats?: string; // New field: e.g., "Avg 28.5 in last 3 vs BOS"
  performanceHistory?: PerformanceGame[];
  analysis?: string;
  matchupDeltas?: MatchupDelta[];
  projectionData?: ProjectionData;
  psychologicalAudit?: PsychologicalAudit;
  deepPsyche?: DeepPsyche; // "Player Voice" psychological simulation
  physicalNuance?: PhysicalNuance;
  situationalNote?: string;
  deepDive?: PlayerDeepDive; // For on-demand analysis
}

export interface StatComparison {
    statName: string;
    homeValue: string;
    awayValue: string;
    advantage: 'Home' | 'Away' | 'Push';
}

export interface BestBet {
    selection: string; // e.g. "Lakers -5.5" or "LeBron James Over 25.5"
    type: 'SPREAD' | 'MONEYLINE' | 'TOTAL' | 'PLAYER_PROP';
    odds: string;
    probability: number; // 0-100
    edge: number; // Percentage edge over implied odds
    reasoning: string;
}

export interface DataQuality {
    fidelityScore: number; // 0-100 score of how reliable the data is
    dataPointsAnalyzed: number;
    freshness: 'Real-time' | 'Cached' | 'Static';
    sourcesQueried?: string[];
}

export interface OfficialsAnalysis {
    referee: string;
    homeWinPct: string;
    avgPoints: string;
    tendency: 'Over-Friendly' | 'Under-Friendly' | 'Home-Bias' | 'Neutral' | 'Road-Bias';
    impactRating: number; // 0-10
}

export interface VenueIntelligence {
    name: string;
    location: string;
    surface: string;
    weatherCondition: string; // "Dome", "Rain", "Windy"
    altitudeImpact: 'High' | 'Moderate' | 'None';
    homeAdvantageScore: number; // 0-100
}

export interface AdvancedMetrics {
    efficiency: {
        offensiveRating: string;
        defensiveRating: string;
        netRating: string;
    };
    pace: string;
    sportSpecific: {
        label: string; // e.g. "DVOA" or "KenPom" or "xG"
        value: string;
        rank?: string;
    }[];
}

export interface PlayerComparisonMetric {
    metric: string;
    playerAValue: string;
    playerBValue: string;
    advantage: 'PlayerA' | 'PlayerB' | 'Push';
    insight: string;
}

export interface PlayerComparisonResult {
    playerA: string;
    playerB: string;
    sport: string;
    metrics: PlayerComparisonMetric[];
    summary: string;
    betterPick: string;
    confidenceScore: number;
}

export interface Prediction {
  homeTeam?: string;
  awayTeam?: string;
  winner: string;
  loser?: string;
  confidence: ConfidenceLevel;
  confidenceScore: number;
  confidenceReasoning?: string;
  bestBet?: BestBet;
  alphaSafeguards?: AlphaSafeguard[];
  vetoPhaseReport?: string;
  calibrationMetrics: CalibrationMetrics;
  quantumAnalysis?: QuantumAnalysis;
  gematriaIntel?: GematriaIntel;
  biblicalAnalysis?: BiblicalAnalysis;
  syndicateIntel?: SyndicateIntel;
  trapDetection?: TrapDetection;
  dataQuality?: DataQuality;
  officialsAnalysis?: OfficialsAnalysis;
  venueIntelligence?: VenueIntelligence;
  advancedMetrics?: AdvancedMetrics; // New field
  situationalFactors?: {
    restAdvantage: 'Home' | 'Away' | 'Neutral';
    travelFatigue: 'High' | 'Moderate' | 'Low';
    scheduleQuirk: string;
    motivation: string;
  };
  microMatchups?: {
    matchup: string;
    advantage: 'Home' | 'Away' | 'Even';
    impact: 'High' | 'Medium' | 'Low';
    analysis: string;
  }[];
  rosterValidation?: {
    homeRosterCheck: string[];
    awayRosterCheck: string[];
    dataIntegrityStatus: 'VERIFIED' | 'WARNING';
  };
  simulatedScenarios?: {
    total: number;
    wins: number;
    avgMargin: string;
  };
  ensembleModel?: {
    statisticalScore: number;
    trendScore: number;
    contextScore: number;
    consensusConfidence: number;
    primaryFactor: string;
  };
  statComparison?: StatComparison[];
  keyMatchups?: {
    role: string;
    homePlayer: { name: string; stats: string };
    awayPlayer: { name: string; stats: string };
    edge: 'Home' | 'Away' | 'Even';
  }[];
  injuryReport?: Injury[];
  situationalIntelligence?: SituationalIntelligence;
  analysis?: string;
  trends?: string[];
  odds?: { winner: string; loser: string };
  props?: PropBet[];
}

export interface Game {
    id: string;
    date: string;
    time: string;
    homeTeam: string;
    awayTeam: string;
    league: string;
    status: string; // 'Scheduled' | 'Live' | 'Finished'
    score?: string;
    isMustWin?: boolean;
    odds?: {
        spread?: string;
        moneyline?: string;
        total?: string;
    };
}

export interface ChatMessage {
    role: 'user' | 'model';
    content: string | Prediction;
    imageData?: string;
}

export interface SavedMatchup {
    id: string;
    timestamp: number;
    homeTeam: string;
    awayTeam: string;
    winner: string;
    confidence: ConfidenceLevel;
    confidenceScore: number;
    elitePair: PropBet[];
    outcome?: 'WIN' | 'LOSS' | 'PUSH' | 'PENDING';
    unitsWagered?: number;
    pnl?: number;
    userFeedback?: string; // User's qualitative notes on the prediction
    accuracyRating?: number; // 1-5 Star rating of the AI's logic
    analysis?: string; // Brief explanation of the prediction
}

export interface NeuralAxiom {
    rule: string;
    weight: number;
    sourceMatchup: string;
    dateLearned: string;
}

export interface NeuralMemory {
    axioms: NeuralAxiom[];
    lastOptimization: number;
    evolutionLevel: number;
}

// Sportsbook & Sharp Money Types
export interface SportsbookOdds {
    bookName: 'DraftKings' | 'FanDuel' | 'BetMGM' | 'Caesars' | 'Pinnacle' | 'Circa';
    spread: string;
    spreadOdds: string;
    moneyline: string;
    total: string;
    totalOdds: string;
    isBestLine?: boolean;
}

export interface SharpMoneySignal {
    id: string;
    gameId: string;
    sport: string;
    matchup: string;
    homeTeam: string;
    awayTeam: string;
    time: string;
    publicTicketPct: number; // e.g. 74%
    handleMoneyPct: number;  // e.g. 88%
    sharpSide: string;      // e.g. "Away +4.5"
    isRLM: boolean;         // Reverse Line Movement detected
    lineShift: string;      // e.g. "Opened +6.5 -> Now +4.5"
    evEdge: number;         // e.g. 5.8%
    evPick: string;         // e.g. "Away Spread"
    kellyUnit: number;      // e.g. 1.8 Units
    books: SportsbookOdds[];
    rationale: string;
}

// Live Injury Alert & Momentum Types
export interface InjuryAlert {
    id: string;
    timestamp: number;
    sport: string;
    team: string;
    player: string;
    status: 'OUT' | 'DOUBTFUL' | 'QUESTIONABLE' | 'PROBABLE' | 'GAME_TIME_DECISION';
    injury: string;
    lineImpact: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
    spreadShift: string;
    quantumEffect: string;
    analysis: string;
}

export interface LiveMomentumState {
    id: string;
    gameId: string;
    sport: string;
    homeTeam: string;
    awayTeam: string;
    period: string; // e.g. "Q3 4:18" or "Top 7th"
    homeScore: number;
    awayScore: number;
    momentumSwing: 'Home Surge' | 'Away Surge' | 'High Entropy Neutral';
    quantumWaveState: string; // e.g. "Wave Function Collapsing to Home"
    liveWinProbHome: number;  // 0-100
    keyDriver: string;
}

// Developer Telemetry & System Monitoring
export interface DevLatencyRecord {
    id: string;
    timestamp: number;
    latencyMs: number;
    endpoint: string;
    status: 'SUCCESS' | 'ERROR' | 'CACHED';
    model: string;
}

export interface DevTelemetryData {
    apiStatus: 'HEALTHY' | 'DEGRADED' | 'RATE_LIMITED';
    avgLatencyMs: number;
    successRate: number;
    totalRequests: number;
    activeModel: string;
    nodeVersion: string;
    memoryUsageMb: number;
    uptimeSeconds: number;
    activeSafeguards: { name: string; status: 'ACTIVE' | 'ENFORCED'; description: string }[];
    latencyHistory: DevLatencyRecord[];
}

