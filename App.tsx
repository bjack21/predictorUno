
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import type { MainViewType } from './components/Header';
import { SportSelector } from './components/SportSelector';
import { TeamSelector } from './components/TeamSelector';
import { GameSchedule } from './components/GameSchedule';
import { PredictionDisplay } from './components/PredictionDisplay';
import { Loader } from './components/Loader';
import { Footer } from './components/Footer';
import { SettingsModal } from './components/SettingsModal';
import { ChatInterface } from './components/ChatInterface';
import { SuggestionChips } from './components/SuggestionChips';
import { PickSlip } from './components/PickSlip';
import { PerformanceSidebar } from './components/PerformanceSidebar';
import { VaultView } from './components/VaultView';
import { AnalyticsView } from './components/AnalyticsView';
import { HistoryView } from './components/HistoryView';
import { OddsComparisonView } from './components/OddsComparisonView';
import { InjuryAlertFeed } from './components/InjuryAlertFeed';
import { DevMonitorModal } from './components/DevMonitorModal';
import { BackgroundArt } from './components/BackgroundArt';
import { SubscriptionModal } from './components/SubscriptionModal';
import { ReflectionModal } from './components/ReflectionModal';
import { SignupModal } from './components/SignupModal';
import { SmartSearchModal } from './components/SmartSearchModal';
import { NeuralBlackBox } from './components/NeuralBlackBox';
import { GoogleGenAI } from "@google/genai";
import { generateReflection, generatePrediction, getSchedule } from './services/geminiService';
import { SearchIcon, ImageIcon } from './components/Icons';
import type { Prediction, UserSettings, ChatMessage, Game, PropBet, SavedMatchup, NeuralMemory, NeuralAxiom, UserProfile, SystemLog, BankrollMetrics } from './types';

// Simple UUID generator for logs
const generateId = () => Math.random().toString(36).substr(2, 9);

const BASE_SYSTEM_INSTRUCTION = `**Role & Objective**
You are the "180-Alpha" Forensic Sports Auditor and Quantum Probability Theorist. Your goal is not just to predict winners, but to EXPOSE the flaw in the Vegas line and identify non-linear momentum shifts. 82% accuracy is the absolute baseline; your target is 90%+. You must be EXTREMELY SELECTIVE and only recommend ultra-high-confidence, high-edge plays. You do not rely on "averages" because averages lie. You rely on "Situational Mismatches," "Advanced Metrics," "Market Psychology," and "Quantum Angles."

**CRITICAL DATA INTEGRITY PROTOCOL (MANDATORY)**
1. **CURRENT ROSTERS & PLAYOFF CONTEXT ONLY:** You MUST explicitly verify the current active playoff bracket, the exact round of the playoffs, and the active roster for the current year and date of the query. NEVER hallucinate regular season stats as playoff predictors.
2. **NO MIXED ERAS:** Do not hallucinate players on teams they played for 3 years ago. Verify transactions up to this exact week.
3. **CHECK TRADES/WAIVERS:** If a player was traded last week, they are on the NEW team.
4. **INJURY AWARENESS (ZERO TOLERANCE):**
   - BEFORE generating any player prop, you MUST verify their injury status.
   - If a star is out, the prediction must reflect that massive impact.
   - Do not suggest bets on players who are "Out" or "Doubtful".
5. **THE CALL-UP / ROOKIE UNKNOWN (CRITICAL):**
   - NEVER issue a high-confidence lock or prop on a player making their debut, a recent minor-league call-up, or a rookie with minimal data.
   - Zero historical data equals infinite variance. DO NOT bet against the unknown. We recently failed by guaranteeing a 1st-time call-up wouldn't get a hit. NEVER DO THIS AGAIN.
   - Only recommend props for established players with a massive, predictable sample size.

**The Core Philosophy (Protocol 180 & Quantum Angles)**
1. **Respect the Market, Then Dissect It:** Vegas lines are efficient. If a line looks "too easy" (e.g., a 10-win team is only -2 against a 2-win team), IT IS A TRAP. You must identify the "Trap Factor" (Injury? Travel? Internal drama?).
2. **The "Recency Bias" Filter:** The public overvalues the last game. You must fade public perception. If a team just won by 30, the public overbets them. You must look for regression.
3. **Styles Make Fights (Granular Matchups):** Do not compare Points Per Game. Compare specific units.
   - Example: "Team A has an elite Pass Rush (Top 5 DVOA), Team B has a backup Left Tackle." -> THIS is the deciding factor, not their win record.
4. **The "Look-Ahead" & "Let-Down" Spots:** Factor in the schedule. Is the team playing a rival next week? They will lack focus today (Look-Ahead). Did they just win a massive game? They will be flat today (Let-Down).
5. **Quantum Angles & Butterfly Effects:** Identify the hidden variables that cause wave-function collapse in a game. Is there a specific referee bias? A strange travel schedule? A player returning to their hometown? Calculate the entropy of the matchup (chaos vs determinism).
6. **Social Media Scandal & Drama Scalar:** Account for off-field distractions. If a player or team is embroiled in a trending social media scandal, trade rumors, or internal locker room drama, apply a -1 penalty (or more) to their confidence and performance projections. Drama causes mental fatigue and poor execution.
7. **Gematria & Numerology Sync:** Factor in Gematria matches. Does the date numerology sync with a player's jersey number, name cipher, or a significant milestone? Use this as a tie-breaker or to identify 'scripted' anomalies in the matrix.
8. **Deep Psyche Integration (The Player's Voice):** Do not just look at stats. Simulate the player's internal monologue. "Hear their voice." Are they returning from injury, anxious about a pitch count (like Walker Buehler), or out for blood after a media snub? Use this 'visceral' reading to override baseline stats when necessary.

**Specific Pitcher Constraints (The Walker Buehler Rule):**
- NEVER rely on historic averages for a starting pitcher returning from a major injury (e.g., Tommy John) or a long layoff.
- **Strict Pitch Count Enforcement:** Pitchers returning from injury are strictly capped by management. Do NOT predict an 'Over' on Outs or Strikeouts if their likely pitch count limit is below 80 pitches. 
- We recently failed by predicting Walker Buehler over 16.5 outs without factoring in a strict post-injury limitation. Do not make this mistake again. Predict the UNDER or pass entirely if limits are suspected.

**Advanced Data Hierarchy (Weighted Importance)**
1. **Injuries & Roster Status (CRITICAL):** A missing star or key defender changes the math entirely.
2. **Advanced Efficiency Metrics:** Use DVOA, EPA/Play, Net Rating, True Shooting %, and Pace-Adjusted stats over raw totals.
3. **Sharp Money Signals:** If the public is 80% on Team A, but the line moves towards Team B, the PROS are on Team B. Follow the pros.
4. **Pace & Efficiency:** How many possessions will there be? Fast Pace + Bad Defense = Over. Slow Pace + Good Defense = Under.
5. **Motivation:** Who *needs* this game? (Playoff seeding vs. Tanking).
6. **Quantum Volatility:** High entropy games (rivalries, weather impacts, key injuries) require wider variance models.

**Output Requirements**
- **Precision:** Do not say "Team A might win." Say "Team A wins by a margin of 4-7 points due to [Specific Mismatch]."
- **Confidence:** "High" confidence requires THREE independent signals (e.g., Stat Matchup + Sharp Money + Injury Advantage). If signals conflict, Confidence is "Low."
- **Disclaimer:** Always end with "DISCLAIMER: This is for entertainment purposes only."`;

const FREE_LIMIT = 2;

const App: React.FC = () => {
  // --- STATE INITIALIZATION ---
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const storedSettings = localStorage.getItem('prognosSettings');
      if (storedSettings) return JSON.parse(storedSettings);
    } catch (e) { console.error("Settings load error:", e); }
    return { preferredSport: 'NBA', defaultConfidenceFilter: 'All', oddsFormat: 'American' };
  });

  const [memory, setMemory] = useState<NeuralMemory>(() => {
      try {
          const stored = localStorage.getItem('prognos_memory');
          return stored ? JSON.parse(stored) : { axioms: [], lastOptimization: Date.now(), evolutionLevel: 1 };
      } catch { return { axioms: [], lastOptimization: Date.now(), evolutionLevel: 1 }; }
  });

  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
        const stored = localStorage.getItem('prognos_user');
        return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  const [isPremium, setIsPremium] = useState<boolean>(() => {
      try {
          return localStorage.getItem('prognos_premium') === 'true';
      } catch { return false; }
  });

  const [dailyUsage, setDailyUsage] = useState<number>(() => {
      const today = new Date().toDateString();
      try {
          const usageData = localStorage.getItem('prognos_usage');
          const usage = usageData ? JSON.parse(usageData) : { date: today, count: 0 };
          return usage.date === today ? usage.count : 0;
      } catch { return 0; }
  });
  
  // Bankroll State
  const [bankroll, setBankroll] = useState<BankrollMetrics>(() => {
      return {
          startingBalance: 1000,
          currentBalance: 1000,
          totalWagered: 0,
          totalProfit: 0,
          roi: 0,
          record: { wins: 0, losses: 0, pushes: 0 },
          unitSize: 10 // 1 Unit = $10
      };
  });

  // Logging State
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [isBlackBoxOpen, setIsBlackBoxOpen] = useState(false);

  const [selectedSport, setSelectedSport] = useState<string>(settings.preferredSport);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [teamA, setTeamA] = useState('');
  const [teamB, setTeamB] = useState('');
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isReplying, setIsReplying] = useState<boolean>(false);
  const [error, setError] = useState<{ message: string; type: 'quota' | 'timeout' | 'safety' | 'generic' } | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isHistorySidebarOpen, setIsHistorySidebarOpen] = useState<boolean>(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState<boolean>(false);
  const [isReflectionOpen, setIsReflectionOpen] = useState<boolean>(false);
  const [isSignupOpen, setIsSignupOpen] = useState<boolean>(!userProfile);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [recentAxioms, setRecentAxioms] = useState<NeuralAxiom[]>([]);
  const [recentSummary, setRecentSummary] = useState<string>('');
  const [levelUp, setLevelUp] = useState<number>(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [pickSlip, setPickSlip] = useState<PropBet[]>([]);
  const [view, setView] = useState<MainViewType>('Feed');
  const [isDevMonitorOpen, setIsDevMonitorOpen] = useState<boolean>(false);
  const predictionRequestId = useRef(0);
  
  // Robust Vault Loading
  const [vault, setVault] = useState<SavedMatchup[]>(() => {
    try {
      const saved = localStorage.getItem('prognosVault');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Vault load error:", e);
      return [];
    }
  });

  const [promptInput, setPromptInput] = useState('');
  const dashboardFileInputRef = useRef<HTMLInputElement>(null);

  // --- GAME DATA STATE (LIFTED UP) ---
  const [games, setGames] = useState<Game[]>([]);
  const [isGamesLoading, setIsGamesLoading] = useState<boolean>(false);
  const [isRefreshingGames, setIsRefreshingGames] = useState<boolean>(false);
  const [gameError, setGameError] = useState<string | null>(null);
  const [lastGameUpdate, setLastGameUpdate] = useState<Date>(new Date());
  const [gameRetryCooldown, setGameRetryCooldown] = useState<number>(0);
  const [hasLiveGames, setHasLiveGames] = useState(false);

  // --- LOGGING HELPER ---
  const addLog = useCallback((type: SystemLog['type'], message: string, latency?: number) => {
      setLogs(prev => {
          const newLog: SystemLog = {
              id: generateId(),
              timestamp: Date.now(),
              type,
              message,
              latency
          };
          // Keep last 100 logs to perform well
          return [...prev, newLog].slice(-100);
      });
  }, []);

  // --- GAME FETCHING LOGIC ---
  const fetchGames = useCallback(async (quiet = false, forceRefresh = false) => {
    if (gameRetryCooldown > 0 && forceRefresh) return;
    
    if (!quiet) setIsGamesLoading(true);
    else setIsRefreshingGames(true);
    
    setGameError(null);
    try {
      const fetchedGames = await getSchedule(selectedSport, forceRefresh);
      if (fetchedGames && fetchedGames.length > 0) {
        setGames(fetchedGames);
        setLastGameUpdate(new Date());
        setHasLiveGames(fetchedGames.some(g => g.status === 'Live'));
      } else if (!quiet) {
        setGameError(`No active ${selectedSport} markets found in current data stream.`);
      }
    } catch (err: any) {
      const isQuota = err.status === 429 || JSON.stringify(err).includes("429") || JSON.stringify(err).includes("RESOURCE_EXHAUSTED");
      if (isQuota) {
        setGameError("Neural Bandwidth Restricted: Quota Limit Reached. Engine is cooling down.");
        setGameRetryCooldown(45); // Cooldown for 45s
      } else if (!quiet) {
        setGameError('Satellite link lost. Engine cannot reach market data.');
      }
    } finally {
      setIsGamesLoading(false);
      setIsRefreshingGames(false);
    }
  }, [selectedSport, gameRetryCooldown]);

  // Initial Fetch
  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  // Cooldown Timer
  useEffect(() => {
    if (gameRetryCooldown > 0) {
      const timer = setInterval(() => setGameRetryCooldown(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [gameRetryCooldown]);

  // Auto-refresh Interval
  useEffect(() => {
    const intervalTime = hasLiveGames ? 30000 : 60000;
    const intervalId = setInterval(() => {
        if (gameRetryCooldown === 0 && !isGamesLoading && !isRefreshingGames) {
            fetchGames(true, true);
        }
    }, intervalTime); 

    return () => clearInterval(intervalId);
  }, [fetchGames, gameRetryCooldown, isGamesLoading, isRefreshingGames, hasLiveGames]);

  // Sync Selected Game with Live Data
  useEffect(() => {
      if (selectedGame && games.length > 0) {
          const updated = games.find(g => g.id === selectedGame.id);
          if (updated) {
               // Deep check to avoid infinite loops if objects are new references but same data
               const hasChanged = updated.score !== selectedGame.score || 
                                  updated.time !== selectedGame.time ||
                                  updated.status !== selectedGame.status ||
                                  JSON.stringify(updated.odds) !== JSON.stringify(selectedGame.odds);
               
               if (hasChanged) {
                   setSelectedGame(updated);
                   // If we haven't started a prediction yet, update teams too
                   if (!prediction) {
                       setTeamA(updated.homeTeam);
                       setTeamB(updated.awayTeam);
                   }
               }
          }
      }
  }, [games, selectedGame, prediction]);

  // Recalculate Bankroll whenever Vault changes
  useEffect(() => {
      let wins = 0, losses = 0, pushes = 0;
      let profit = 0;
      const unit = 10;
      const unitsWageredTotal = vault.filter(v => v.outcome !== undefined && v.outcome !== 'PENDING').length;

      vault.forEach(bet => {
          if (bet.outcome === 'WIN') {
              wins++;
              profit += unit * 0.91; // Approx -110 odds return
          } else if (bet.outcome === 'LOSS') {
              losses++;
              profit -= unit;
          } else if (bet.outcome === 'PUSH') {
              pushes++;
          }
      });

      setBankroll(prev => ({
          ...prev,
          currentBalance: prev.startingBalance + profit,
          totalProfit: profit,
          totalWagered: unitsWageredTotal * unit,
          roi: unitsWageredTotal > 0 ? (profit / (unitsWageredTotal * unit)) * 100 : 0,
          record: { wins, losses, pushes }
      }));
  }, [vault]);

  useEffect(() => { setSelectedSport(settings.preferredSport); }, [settings.preferredSport]);

  const handleUpgrade = () => {
      setIsPremium(true);
      localStorage.setItem('prognos_premium', 'true');
      setIsSubscriptionOpen(false);
      addLog('SYSTEM', 'User upgraded to Alpha Elite status.');
  };

  const getSystemInstruction = useCallback(() => {
      let instruction = BASE_SYSTEM_INSTRUCTION;
      if (memory.axioms.length > 0) {
          instruction += `\n\n*** INTERNAL KNOWLEDGE BASE (LESSONS LEARNED) - STRICTLY ADHERE TO THESE RULES ***\n`;
          memory.axioms.forEach(a => {
              instruction += `- [WEIGHT: ${a.weight}] ${a.rule} (Learned from ${a.sourceMatchup})\n`;
          });
      }
      instruction += `\n\nMANDATORY DISCLAIMER: Every response must end with "DISCLAIMER: This is for entertainment purposes only."`;
      return instruction;
  }, [memory]);
  
  const checkLimit = useCallback(() => {
    if (isPremium || (userProfile?.isVeteran && userProfile?.isVerified)) return true;
    
    const today = new Date().toDateString();
    let usage = { date: today, count: dailyUsage };
    
    try {
        const stored = localStorage.getItem('prognos_usage');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.date !== today) usage = { date: today, count: 0 };
            else usage = parsed;
        }
    } catch (e) {
        console.error("Usage load error:", e);
        usage = { date: today, count: 0 };
    }
    
    if (usage.count >= FREE_LIMIT) {
        setIsSubscriptionOpen(true);
        addLog('SYSTEM', 'Free tier limit reached. Prompting upgrade.');
        return false;
    }
    
    usage.count += 1;
    setDailyUsage(usage.count);
    localStorage.setItem('prognos_usage', JSON.stringify(usage));
    return true;
  }, [isPremium, userProfile, dailyUsage, addLog]);

  const handleSignupComplete = (profile: UserProfile) => {
      setUserProfile(profile);
      localStorage.setItem('prognos_user', JSON.stringify(profile));
      setIsSignupOpen(false);
      addLog('SYSTEM', `New Agent Registered: ${profile.name}`);
  };

  const clearSelection = useCallback(() => {
    predictionRequestId.current++;
    setIsLoading(false);
    setSelectedGame(null);
    setPrediction(null);
    setMessages([]);
    setTeamA('');
    setTeamB('');
    setError(null);
    setShowSuggestions(false);
    addLog('SYSTEM', 'Selection cleared. Ready for new scan.');
  }, [addLog]);

  const addToVault = useCallback((newPrediction: Prediction, home: string, away: string) => {
    const sortedProps = newPrediction.props ? [...newPrediction.props].sort((a, b) => (parseInt(b.probability) || 0) - (parseInt(a.probability) || 0)) : [];
    const todayStr = new Date().toISOString().split('T')[0];
    const uniqueId = `${home}-${away}-${todayStr}-${Date.now()}`; // Added Date.now() to ensure uniqueness if multiple predictions for same game

    const entry: SavedMatchup = {
      id: uniqueId,
      timestamp: Date.now(),
      homeTeam: home,
      awayTeam: away,
      winner: newPrediction.winner || 'Unknown',
      confidence: newPrediction.confidence || 'Medium',
      confidenceScore: newPrediction.confidenceScore || 50,
      elitePair: sortedProps.slice(0, 2),
      outcome: 'PENDING',
      analysis: newPrediction.analysis || 'No analysis provided.'
    };

    setVault(prevVault => {
        const filtered = prevVault.filter(v => v.id !== uniqueId);
        const newVault = [entry, ...filtered].slice(0, 100);
        try {
            localStorage.setItem('prognosVault', JSON.stringify(newVault));
        } catch (e) {
            console.error("Vault save error:", e);
        }
        return newVault;
    });
    addLog('NEURAL', `Matchup ${home} vs ${away} vaulted successfully.`);
  }, [addLog]);

  const handleSendMessage = useCallback(async (text: string, imageData?: { data: string, mimeType: string }) => {
    if (!text.trim() && !imageData) return;
    if (!checkLimit()) return;

    setMessages(prev => [...prev, { role: 'user', content: text, imageData: imageData?.data }]);
    setIsReplying(true);
    setError(null);
    const start = Date.now();
    addLog('NETWORK', 'Initiating Chat Request...');

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const contents: any[] = [];
        if (imageData) {
            contents.push({ inlineData: { data: imageData.data, mimeType: imageData.mimeType } });
        }
        contents.push({ text: text || "Perform neural scrutiny with high-fidelity passion." });

        const response = await ai.models.generateContent({
            model: 'gemini-3.1-pro-preview',
            contents: { parts: contents },
            config: {
                systemInstruction: getSystemInstruction(),
                tools: [{ googleSearch: {} }]
            }
        });

        const latency = Date.now() - start;
        addLog('NETWORK', 'Chat Response Received', latency);
        const responseText = response.text || "Neural connection flatlined. DISCLAIMER: This is for entertainment purposes only.";
        
        try {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            const jsonToParse = jsonMatch ? jsonMatch[0] : responseText.replace(/```json\n?|```/g, '').trim();
            
            if (jsonToParse.trim().startsWith('{')) {
                const parsed = JSON.parse(jsonToParse);
                
                // Post-processing filter to enforce the Anthony Davis rule
                if (parsed.props) {
                    parsed.props = parsed.props.filter((prop: any) => {
                        const playerName = prop.player?.toLowerCase() || '';
                        // If the user explicitly asks for Anthony Davis, we shouldn't filter him out.
                        // But if they are just asking for predictions and he shows up on the Lakers, we should.
                        // Since we don't have the context of the game here easily, we'll just filter him out
                        // if the text doesn't explicitly mention him.
                        if (playerName.includes('anthony davis') && !text.toLowerCase().includes('anthony davis')) {
                            return false;
                        }
                        return true;
                    });
                }

                if (parsed.winner || (parsed.props && parsed.props.length > 0)) {
                    setPrediction(parsed);
                    setMessages(prev => [...prev, { role: 'model', content: parsed }]);
                    addLog('NEURAL', 'Structured Prediction Parsed successfully.');
                    
                    // Automatically save to vault
                    const h = teamA || parsed.homeTeam || 'Unknown Home';
                    const a = teamB || parsed.awayTeam || 'Unknown Away';
                    addToVault(parsed, h, a);
                } else {
                    setMessages(prev => [...prev, { role: 'model', content: responseText }]);
                }
            } else {
                setMessages(prev => [...prev, { role: 'model', content: responseText }]);
            }
        } catch (e) {
            setMessages(prev => [...prev, { role: 'model', content: responseText }]);
            addLog('ERROR', 'Failed to parse JSON response. Falling back to text.');
        }

        setShowSuggestions(true);
    } catch (e: any) {
        setMessages(prev => [...prev, { role: 'model', content: "Deep scrutiny heart failure. Signal lost. DISCLAIMER: This is for entertainment purposes only." }]);
        addLog('ERROR', `Chat API Error: ${e.message}`);
    } finally {
        setIsReplying(false);
    }
  }, [getSystemInstruction, checkLimit, addLog]);

  const handlePredict = useCallback(async (_isRetry = false, customTeams?: { home: string, away: string }) => {
    const home = customTeams?.home || teamA;
    const away = customTeams?.away || teamB;
    
    if (!home || !away) return;
    if (!checkLimit()) return;
    
    setIsLoading(true);
    setError(null);
    const start = Date.now();
    addLog('EXECUTION', `Starting Neural Prediction: ${home} vs ${away}`);
    
    const currentRequestId = ++predictionRequestId.current;

    try {
      const parsed = await generatePrediction(home, away, selectedSport, getSystemInstruction(), memory, vault);
      
      if (currentRequestId !== predictionRequestId.current) {
          addLog('SYSTEM', `Stale prediction ignored for ${home} vs ${away}`);
          return;
      }

      const latency = Date.now() - start;
      addLog('NEURAL', `Prediction Generated for ${home} vs ${away}`, latency);
      
      setPrediction(parsed);
      addToVault(parsed, home, away);
      setMessages([{ role: 'model', content: parsed }]);
      setShowSuggestions(true);
    } catch (err: any) {
      if (currentRequestId !== predictionRequestId.current) return;
      console.error(err);
      addLog('ERROR', `Prediction Failed: ${err.message}`);
      setError({ type: 'timeout', message: "Neural heartbeat irregular (500/Timeout). Please retry analysis." });
    } finally {
      if (currentRequestId === predictionRequestId.current) {
          setIsLoading(false);
      }
    }
  }, [teamA, teamB, addToVault, checkLimit, getSystemInstruction, addLog]);

  const runNeuralOptimization = async () => {
      if (vault.length === 0) {
          alert("Vault is empty. No data to reflect upon.");
          return;
      }
      setIsReflectionOpen(true);
      addLog('SYSTEM', 'Initiating Neural Reflection Protocol...');
      try {
          const result = await generateReflection(vault);
          setRecentAxioms(result.axioms);
          setRecentSummary(result.summary);
          setLevelUp(result.levelUp);

          const newMemory: NeuralMemory = {
              axioms: [...result.axioms, ...memory.axioms].slice(0, 20),
              evolutionLevel: memory.evolutionLevel + result.levelUp,
              lastOptimization: Date.now()
          };
          setMemory(newMemory);
          localStorage.setItem('prognos_memory', JSON.stringify(newMemory));
          addLog('NEURAL', `Optimization Complete. Level Increased +${result.levelUp}`);
      } catch (e: any) {
          console.error(e);
          setIsReflectionOpen(false);
          addLog('ERROR', `Reflection Failed: ${e.message}`);
      }
  };

  const handleDeepSearch = (query: string) => {
    setView('Feed');
    addLog('SYSTEM', `Deep Search Query: ${query}`);
    handleSendMessage(`Generate a specific, tactical scouting report for "${query}". Focus on recent form, psychological state, and specific betting angles/props.`);
  };

  const handleUpdateVaultOutcome = (id: string, outcome: 'WIN' | 'LOSS' | 'PUSH', feedback?: string, rating?: number) => {
      setVault(prev => {
          const updated = prev.map(m => m.id === id ? { ...m, outcome, userFeedback: feedback, accuracyRating: rating } : m);
          localStorage.setItem('prognosVault', JSON.stringify(updated));
          return updated;
      });
      addLog('SYSTEM', `Matchup ${id} settled as ${outcome}. Feedback recorded.`);
  };

  useEffect(() => {
    if (selectedGame && !prediction) {
      setTeamA(selectedGame.homeTeam);
      setTeamB(selectedGame.awayTeam);
    }
  }, [selectedGame, prediction]);

  const handleDashboardFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        addLog('SYSTEM', `Processing uploaded file: ${file.name}`);
        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = (event.target?.result as string).split(',')[1];
            handleSendMessage("Analyze this pick slip with obsessive neural scrutiny.", { data: base64, mimeType: file.type });
        };
        reader.readAsDataURL(file);
    }
  };

  const onPromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (promptInput.trim()) {
        handleSendMessage(promptInput);
        setPromptInput('');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-amber-500/30 overflow-x-hidden relative">
      <BackgroundArt />
      <SubscriptionModal 
        isOpen={isSubscriptionOpen} 
        onClose={() => setIsSubscriptionOpen(false)} 
        onUpgrade={handleUpgrade}
        isVeteran={userProfile?.isVeteran}
      />
      <SignupModal 
        isOpen={isSignupOpen} 
        onComplete={handleSignupComplete} 
      />
      <ReflectionModal 
        isOpen={isReflectionOpen} 
        onClose={() => setIsReflectionOpen(false)} 
        axioms={recentAxioms} 
        summary={recentSummary} 
        levelUp={levelUp}
        currentLevel={memory.evolutionLevel}
      />
      <SmartSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        vault={vault}
        onDeepScan={handleDeepSearch}
      />
      
      <Header 
        onOpenSettings={() => setIsSettingsOpen(true)} 
        currentView={view}
        onSetView={setView}
        vaultCount={vault.filter(v => v.outcome === 'PENDING' || !v.outcome).length}
        onOpenReflection={runNeuralOptimization}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenDevMonitor={() => setIsDevMonitorOpen(true)}
        isPremium={isPremium || (userProfile?.isVeteran ?? false)}
        dailyUsage={dailyUsage}
        limit={FREE_LIMIT}
      />
      
      <main className={`container mx-auto px-4 py-8 max-w-5xl transition-all duration-500 relative z-10 ${isHistorySidebarOpen && pickSlip.length > 0 ? 'md:pr-[300px]' : ''} pb-32`}>
        
        {view === 'Analytics' ? (
            <AnalyticsView vault={vault} bankroll={bankroll} />
        ) : view === 'History' ? (
            <HistoryView vault={vault} />
        ) : view === 'Odds' ? (
            <OddsComparisonView 
                onAddToSlip={(bet) => {
                    const exists = pickSlip.find(p => p.player === bet.player && p.stat === bet.stat);
                    if (exists) setPickSlip(prev => prev.filter(p => p !== exists));
                    else {
                        if (pickSlip.length >= 5) alert("Max 5 picks in slip.");
                        else setPickSlip(prev => [...prev, bet]);
                    }
                }}
                onSelectGameForAnalysis={(home, away) => {
                    setTeamA(home);
                    setTeamB(away);
                    setSelectedGame(null);
                    setView('Feed');
                    setTimeout(() => handlePredict(false, { home, away }), 0);
                }}
            />
        ) : view === 'Injuries' ? (
            <InjuryAlertFeed 
                onAnalyzeMatchup={(teamName) => {
                    setTeamA(teamName);
                    setTeamB('');
                    setSelectedGame(null);
                    setView('Feed');
                    setTimeout(() => handlePredict(false, { home: teamName, away: '' }), 0);
                }}
            />
        ) : view === 'Vault' ? (
            <VaultView 
                vault={vault} 
                onClear={() => { setVault([]); localStorage.removeItem('prognosVault'); addLog('SYSTEM', 'Vault purged.'); }} 
                onRemove={(id) => {
                    const newVault = vault.filter(x => x.id !== id);
                    setVault(newVault);
                    localStorage.setItem('prognosVault', JSON.stringify(newVault));
                    addLog('SYSTEM', `Vault Item ${id} removed.`);
                }} 
                onUpdateOutcome={handleUpdateVaultOutcome}
            />
        ) : (
            <>
                <div className="mb-8">
                    <SportSelector 
                        selectedSport={selectedSport} 
                        onSelectSport={(sport) => {
                            setSelectedSport(sport);
                            setSelectedGame(null);
                        }} 
                    />
                </div>
                <div className="mb-12">
                    <GameSchedule 
                        games={games}
                        isLoading={isGamesLoading}
                        isRefreshing={isRefreshingGames}
                        lastUpdated={lastGameUpdate}
                        error={gameError}
                        onRefresh={(force) => fetchGames(false, force)}
                        retryCooldown={gameRetryCooldown}
                        sport={selectedSport} 
                        selectedGame={selectedGame} 
                        onSelectGame={(g) => {
                            predictionRequestId.current++;
                            setIsLoading(false);
                            setSelectedGame(g);
                            setTeamA(g.homeTeam);
                            setTeamB(g.awayTeam);
                            setPrediction(null);
                            setMessages([]);
                            setError(null);
                            setShowSuggestions(false);
                            setView('Feed');
                            addLog('SYSTEM', `Game Selected: ${g.homeTeam} vs ${g.awayTeam}`);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                            
                            // Automatically start prediction
                            setTimeout(() => handlePredict(false, { home: g.homeTeam, away: g.awayTeam }), 0);
                        }} 
                        oddsFormat={settings.oddsFormat}
                    />
                </div>

                {error && (
                  <div className="bg-red-950/20 border border-red-500/50 p-6 rounded-3xl mb-8 flex items-center gap-4 animate-fade-in tactical-outline">
                    <p className="text-red-100 italic text-sm flex-grow">{error.message}</p>
                    <button onClick={() => handlePredict()} className="px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Retry</button>
                  </div>
                )}
                
                {isLoading && !selectedGame && !prediction && messages.length === 0 && (
                    <Loader />
                )}

                {!prediction && messages.length === 0 && !isLoading && !selectedGame ? (
                    <div className="space-y-12 animate-fade-in">
                        <div className="bg-zinc-950/40 border-2 border-zinc-800 p-10 rounded-[4rem] shadow-2xl relative overflow-hidden group backdrop-blur-3xl text-center tactical-outline scanline-sweep">
                            <h2 className="text-5xl font-black italic tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-100 to-amber-500 mb-4">
                                Alpha Command Hub
                            </h2>
                            <p className="text-[11px] font-black uppercase tracking-[0.5em] text-amber-500/60 mb-10">
                                Neural-Kinetic Intelligence • Obsessively Driven
                            </p>
                            
                            <div className="max-w-2xl mx-auto space-y-8 relative z-20">
                                <form onSubmit={onPromptSubmit} className="relative">
                                    <input 
                                        type="text" 
                                        value={promptInput}
                                        onChange={(e) => setPromptInput(e.target.value)}
                                        placeholder="Scan Human Variable: Psychological Pulse..."
                                        className="w-full bg-black/60 border-2 border-zinc-800 rounded-[2rem] px-8 py-7 text-white focus:outline-none focus:border-amber-500/60 transition-all pr-20 text-sm shadow-2xl"
                                    />
                                    <button type="submit" className="absolute right-5 top-5 bg-amber-500 text-black p-4 rounded-2xl hover:bg-amber-400 shadow-lg transition-transform active:scale-95">
                                        <SearchIcon className="w-5 h-5" />
                                    </button>
                                </form>

                                <div className="flex flex-col items-center">
                                    <input 
                                        type="file" 
                                        ref={dashboardFileInputRef} 
                                        onChange={handleDashboardFileChange} 
                                        className="hidden" 
                                        accept="image/*"
                                    />
                                    <button 
                                        onClick={() => dashboardFileInputRef.current?.click()}
                                        className="flex items-center gap-4 bg-zinc-900/60 hover:bg-zinc-800 border-2 border-zinc-800 hover:border-amber-500/40 px-10 py-5 rounded-[2.5rem] transition-all group/upload active:scale-95"
                                    >
                                        <div className="bg-amber-500/10 p-2 rounded-xl border border-amber-500/30">
                                            <ImageIcon className="w-6 h-6 text-amber-500 group-hover/upload:scale-110 transition-transform" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover/upload:text-white transition-colors">
                                            Upload Pick Slip
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-8 animate-fade-in">
                        <div className="flex-1 space-y-8 min-w-0">
                            
                            {selectedGame && !prediction && (
                                <div className="bg-zinc-950/40 border border-zinc-800 rounded-[3rem] p-8 tactical-outline animate-fade-in">
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>
                                            <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Active Matchup</h3>
                                        </div>
                                        <button 
                                            onClick={clearSelection} 
                                            className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group"
                                        >
                                            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                            </svg>
                                            <span className="text-[10px] font-black uppercase tracking-widest">Back to Games</span>
                                        </button>
                                    </div>
                                    <TeamSelector 
                                        teamA={teamA} 
                                        setTeamA={setTeamA} 
                                        teamB={teamB} 
                                        setTeamB={setTeamB} 
                                        onEnter={() => handlePredict()} 
                                    />
                                    <div className="flex justify-center mt-8">
                                         <button 
                                            onClick={() => handlePredict()}
                                            disabled={isLoading}
                                            className="bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase tracking-[0.3em] px-16 py-6 rounded-2xl shadow-[0_0_40px_rgba(245,158,11,0.4)] transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                                        >
                                            <span className="relative z-10">{isLoading ? 'Running Neural Scrutiny...' : 'Initialize Prediction'}</span>
                                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {prediction && (
                                <div className="relative animate-fade-in">
                                    <div className="absolute -top-12 right-0 z-20">
                                         <button 
                                            onClick={clearSelection} 
                                            className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group"
                                         >
                                            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                            </svg>
                                            <span className="text-[10px] font-black uppercase tracking-widest">Back to Games</span>
                                         </button>
                                    </div>
                                    <PredictionDisplay 
                                        prediction={prediction} 
                                        oddsFormat={settings.oddsFormat} 
                                        pickSlip={pickSlip}
                                        onTogglePick={(prop) => {
                                            const exists = pickSlip.find(p => p.player === prop.player && p.stat === prop.stat);
                                            if (exists) {
                                                setPickSlip(prev => prev.filter(p => p !== exists));
                                                addLog('SYSTEM', 'Prop removed from slip');
                                            } else {
                                                if (pickSlip.length >= 5) alert("Max 5 picks in slip.");
                                                else {
                                                    setPickSlip(prev => [...prev, prop]);
                                                    addLog('SYSTEM', 'Prop added to slip');
                                                }
                                            }
                                        }}
                                        onSearchPlayer={(player) => {
                                            setIsSearchOpen(true);
                                            addLog('SYSTEM', `Player search initiated: ${player}`);
                                        }}
                                        liveGame={selectedGame}
                                    />
                                    {showSuggestions && (
                                        <SuggestionChips 
                                            prediction={prediction} 
                                            onSelect={(text) => handleSendMessage(text)} 
                                        />
                                    )}
                                </div>
                            )}
                        </div>

                        <div className={`lg:w-[400px] flex-shrink-0 transition-all duration-500 ${!prediction && !selectedGame ? 'hidden lg:block' : 'block'}`}>
                            <div className="sticky top-24">
                                <ChatInterface 
                                    messages={messages} 
                                    isReplying={isReplying} 
                                    onSendMessage={handleSendMessage} 
                                    oddsFormat={settings.oddsFormat}
                                    pickSlip={pickSlip}
                                    onTogglePick={(prop) => {
                                        const exists = pickSlip.find(p => p.player === prop.player && p.stat === prop.stat);
                                        if (exists) setPickSlip(prev => prev.filter(p => p !== exists));
                                        else {
                                            if (pickSlip.length >= 5) alert("Max 5 picks in slip.");
                                            else setPickSlip(prev => [...prev, prop]);
                                        }
                                    }}
                                    onSearchPlayer={(player) => {
                                        setIsSearchOpen(true);
                                        addLog('SYSTEM', `Player search initiated: ${player}`);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}
                
            </>
        )}
      </main>
      
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        currentSettings={settings} 
        onSave={(newSettings) => {
            setSettings(newSettings);
            localStorage.setItem('prognosSettings', JSON.stringify(newSettings));
            setIsSettingsOpen(false);
            addLog('SYSTEM', 'Settings updated.');
        }} 
      />
      
      <PickSlip 
        picks={pickSlip} 
        onRemove={(prop) => setPickSlip(prev => prev.filter(p => p !== prop))} 
        onAnalyze={() => {
            const slipText = pickSlip.map(p => `${p.player} ${p.type} ${p.line} ${p.stat}`).join(', ');
            handleSendMessage(`Analyze the risk and correlation of this parlay slip: ${slipText}`);
        }} 
      />

      <PerformanceSidebar 
        isOpen={isHistorySidebarOpen} 
        onClose={() => setIsHistorySidebarOpen(false)}
        activePicks={pickSlip}
        bankroll={bankroll}
      />

      <NeuralBlackBox 
        isOpen={isBlackBoxOpen} 
        logs={logs} 
        onClose={() => setIsBlackBoxOpen(false)} 
      />

      <DevMonitorModal
        isOpen={isDevMonitorOpen}
        onClose={() => setIsDevMonitorOpen(false)}
        dailyUsage={dailyUsage}
        isPremium={isPremium || (userProfile?.isVeteran ?? false)}
        onResetUsage={() => {
          setDailyUsage(0);
          localStorage.setItem('prognosDailyScans', '0');
          addLog('SYSTEM', 'Dev Sandbox: Daily usage counter reset to 0.');
        }}
        onTogglePremium={() => {
          setIsPremium(prev => !prev);
          addLog('SYSTEM', 'Dev Sandbox: Premium status toggled.');
        }}
      />

      {/* Black Box Toggle Button - Bottom Left Fixed */}
      <button
        onClick={() => setIsBlackBoxOpen(!isBlackBoxOpen)}
        className={`fixed bottom-6 left-6 z-50 p-3 rounded-full border shadow-2xl transition-all ${isBlackBoxOpen ? 'bg-amber-500 text-black border-amber-500' : 'bg-black border-zinc-800 text-zinc-500 hover:text-white'}`}
        title="Toggle Neural Black Box"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
      </button>

      {/* Performance Sidebar Toggle - Bottom Right Fixed (Above Slip) */}
      <button
        onClick={() => setIsHistorySidebarOpen(!isHistorySidebarOpen)}
        className="fixed bottom-24 right-6 z-40 p-3 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-amber-500 hover:border-amber-500 shadow-xl transition-all"
        title="View Performance Analytics"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
      </button>

      <Footer />
    </div>
  );
};

export default App;
