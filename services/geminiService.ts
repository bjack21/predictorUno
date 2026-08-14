
import { GoogleGenAI, Type } from "@google/genai";
import type { Game, SavedMatchup, NeuralAxiom, NeuralMemory, Prediction, PlayerDeepDive, PlayerComparisonResult } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// Simple in-memory cache to prevent 429s on schedule fetches
const scheduleCache: Record<string, { data: Game[], timestamp: number }> = {};
const CACHE_DURATION = 45 * 1000; // Reduced to 45 seconds for faster live updates

async function callWithRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let delay = 2000;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      const errorStr = JSON.stringify(error).toLowerCase();
      const message = error.message?.toLowerCase() || "";
      const status = error?.status || error?.code; 
      
      const isQuota = status === 429 || errorStr.includes('429') || errorStr.includes('resource_exhausted');
      
      const isTransient = 
        status === 500 || 
        status === 503 || 
        status === 504 ||
        message.includes('rpc failed') || 
        message.includes('xhr error') || 
        message.includes('fetch failed') ||
        errorStr.includes('500') ||
        errorStr.includes('deadline_exceeded') ||
        errorStr.includes('internal error') ||
        errorStr.includes('unknown') ||
        errorStr.includes('rpc failed');
      
      if ((isTransient || isQuota) && i < maxRetries - 1) {
        const jitter = Math.random() * 1000;
        const backoff = isQuota ? (delay * 2) + 5000 + jitter : delay + jitter; 
        
        console.warn(`PRO-N-OS: ${isQuota ? 'Quota limit' : 'Neural Uplink'} interference (${message || status || 'Unknown'}). Attempting resync ${i + 1}/${maxRetries} in ${Math.round(backoff)}ms...`);
        
        await new Promise(resolve => setTimeout(resolve, backoff));
        delay *= 2; 
        continue;
      }
      throw error;
    }
  }
  return await fn();
}

const scheduleSchema = {
  type: Type.OBJECT,
  properties: {
    games: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          date: { type: Type.STRING },
          homeTeam: { type: Type.STRING },
          awayTeam: { type: Type.STRING },
          league: { type: Type.STRING },
          time: { type: Type.STRING },
          status: { type: Type.STRING },
          score: { type: Type.STRING },
          isMustWin: { type: Type.BOOLEAN, description: "True if the game has critical playoff or elimination implications." },
          odds: {
            type: Type.OBJECT,
            properties: {
              spread: { type: Type.STRING },
              moneyline: { type: Type.STRING },
              total: { type: Type.STRING }
            }
          }
        },
        required: ["homeTeam", "awayTeam"]
      }
    }
  }
};

const reflectionSchema = {
    type: Type.OBJECT,
    properties: {
        axioms: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    rule: { type: Type.STRING, description: "A specific strategic rule learned from the outcome." },
                    weight: { type: Type.NUMBER, description: "Importance 0-100" },
                    sourceMatchup: { type: Type.STRING, description: "Teams involved" },
                    dateLearned: { type: Type.STRING }
                },
                required: ["rule", "weight", "sourceMatchup", "dateLearned"]
            }
        },
        evolutionLevelChange: { type: Type.NUMBER, description: "How much the AI leveled up (1-5)" },
        summary: { type: Type.STRING, description: "A passionate summary of what went right or wrong today." }
    },
    required: ["axioms", "evolutionLevelChange", "summary"]
};

export const predictionSchema = {
  type: Type.OBJECT,
  properties: {
    homeTeam: { type: Type.STRING },
    awayTeam: { type: Type.STRING },
    winner: { type: Type.STRING },
    loser: { type: Type.STRING },
    confidence: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
    confidenceScore: { type: Type.NUMBER },
    confidenceReasoning: { type: Type.STRING },
    bestBet: {
        type: Type.OBJECT,
        description: "The single highest probability outcome for this entire event (Winner, Spread, or Prop).",
        properties: {
            selection: { type: Type.STRING, description: "e.g. 'Lakers -5.5' or 'LeBron Over 25.5 Pts'" },
            type: { type: Type.STRING, enum: ['SPREAD', 'MONEYLINE', 'TOTAL', 'PLAYER_PROP'] },
            odds: { type: Type.STRING },
            probability: { type: Type.NUMBER, description: "0-100" },
            edge: { type: Type.NUMBER, description: "Percent edge against Vegas" },
            reasoning: { type: Type.STRING }
        },
        required: ["selection", "type", "probability", "edge", "reasoning"]
    },
    alphaSafeguards: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          safeguard: { type: Type.STRING, description: "E.g., 'Injury Scan', 'Line Movement', 'Ref Bias'" },
          status: { type: Type.STRING, enum: ["PASSED", "FLAGGED", "NEUTRAL"] },
          finding: { type: Type.STRING, description: "Specific detail, e.g., 'LeBron James is OUT'" }
        },
        required: ["safeguard", "status", "finding"]
      }
    },
    vetoPhaseReport: { type: Type.STRING, description: "If a major issue like a scratch was found, detail it here." },
    syndicateIntel: {
        type: Type.OBJECT,
        properties: {
            smartMoney: { type: Type.STRING, enum: ["Home", "Away", "Neutral"] },
            publicConsensus: { type: Type.STRING, description: "Percentage of public bets, e.g., '82% on Home'" },
            lineMovement: { type: Type.STRING, enum: ["Sharp Move", "Public Steam", "Stagnant"] },
            reverseLineMovementDetected: { type: Type.BOOLEAN },
            explanation: { type: Type.STRING }
        }
    },
    officialsAnalysis: {
        type: Type.OBJECT,
        properties: {
            referee: { type: Type.STRING },
            homeWinPct: { type: Type.STRING },
            avgPoints: { type: Type.STRING },
            tendency: { type: Type.STRING, enum: ['Over-Friendly', 'Under-Friendly', 'Home-Bias', 'Neutral', 'Road-Bias'] },
            impactRating: { type: Type.NUMBER }
        }
    },
    venueIntelligence: {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING },
            location: { type: Type.STRING },
            surface: { type: Type.STRING },
            weatherCondition: { type: Type.STRING },
            altitudeImpact: { type: Type.STRING, enum: ['High', 'Moderate', 'None'] },
            homeAdvantageScore: { type: Type.NUMBER }
        }
    },
    rosterValidation: {
        type: Type.OBJECT,
        description: "List the top 3-5 key players for each team to PROVE you are using the current roster.",
        properties: {
            homeRosterCheck: { type: Type.ARRAY, items: { type: Type.STRING } },
            awayRosterCheck: { type: Type.ARRAY, items: { type: Type.STRING } },
            dataIntegrityStatus: { type: Type.STRING, enum: ['VERIFIED', 'WARNING'] }
        },
        required: ["homeRosterCheck", "awayRosterCheck", "dataIntegrityStatus"]
    },
    simulatedScenarios: {
        type: Type.OBJECT,
        properties: {
            total: { type: Type.NUMBER, description: "Number of simulations run" },
            wins: { type: Type.NUMBER, description: "Number of wins for the predicted winner" },
            avgMargin: { type: Type.STRING }
        }
    },
    trapDetection: {
        type: Type.OBJECT,
        properties: {
            isTrap: { type: Type.BOOLEAN },
            trapScore: { type: Type.NUMBER },
            trapReason: { type: Type.STRING }
        }
    },
    gematriaIntel: {
        type: Type.OBJECT,
        properties: {
            teamNameSum: { type: Type.NUMBER },
            pythagoreanSum: { type: Type.NUMBER },
            isMasterNumber: { type: Type.BOOLEAN },
            dateNumerology: { type: Type.NUMBER },
            resonance: { type: Type.STRING, enum: ["Harmonic", "Dissonant", "Neutral"] },
            cipherText: { type: Type.STRING },
            interpretation: { type: Type.STRING }
        }
    },
    quantumAnalysis: {
        type: Type.OBJECT,
        properties: {
            entropyScore: { type: Type.NUMBER },
            waveFunction: { type: Type.STRING, enum: ['Collapsing (Certainty)', 'Superposition (Uncertainty)', 'Entangled (Rivalry)'] },
            volatilityIndex: { type: Type.NUMBER },
            dominantEnergy: { type: Type.STRING },
            algorithmicModel: { type: Type.STRING, enum: ['Schrödinger Form', 'Markov Chaos', 'Heisenberg Uncertainty', 'Bose-Einstein Momentum'] },
            butterflyVariable: { type: Type.STRING },
            interferencePattern: { type: Type.STRING, enum: ['Constructive (Strengths Align)', 'Destructive (Strengths Cancel)'] }
        }
    },
    dataQuality: {
        type: Type.OBJECT,
        properties: {
            fidelityScore: { type: Type.NUMBER },
            dataPointsAnalyzed: { type: Type.NUMBER },
            freshness: { type: Type.STRING },
            sourcesQueried: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
    },
    advancedMetrics: {
        type: Type.OBJECT,
        properties: {
            efficiency: {
                type: Type.OBJECT,
                properties: {
                    offensiveRating: { type: Type.STRING },
                    defensiveRating: { type: Type.STRING },
                    netRating: { type: Type.STRING }
                }
            },
            pace: { type: Type.STRING },
            sportSpecific: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        label: { type: Type.STRING },
                        value: { type: Type.STRING },
                        rank: { type: Type.STRING }
                    }
                }
            }
        }
    },
    situationalFactors: {
        type: Type.OBJECT,
        properties: {
            restAdvantage: { type: Type.STRING, enum: ["Home", "Away", "Neutral"] },
            travelFatigue: { type: Type.STRING, enum: ["High", "Moderate", "Low"] },
            scheduleQuirk: { type: Type.STRING, description: "e.g., '3rd game in 4 nights'" },
            motivation: { type: Type.STRING, description: "e.g., 'Revenge game', 'Must win'" }
        }
    },
    situationalIntelligence: {
        type: Type.OBJECT,
        properties: {
            motivationLevel: { type: Type.STRING, enum: ['Elite (Must-Win)', 'High (Playoff Push)', 'Moderate (Regular Season)', 'Low (Resting/Tanking)'] },
            playoffContext: { type: Type.STRING },
            isHighStakes: { type: Type.BOOLEAN },
            leverageAnalysis: { type: Type.STRING },
            expectedGameScript: { type: Type.STRING, enum: ['High-Pace/Competitive', 'Low-Pace/Blowout-Risk', 'Defensive-Grind'] },
            weatherImpact: { type: Type.STRING },
            venueFactor: { type: Type.STRING },
            scandalContext: { type: Type.STRING },
            socialMediaDramaScalar: { type: Type.NUMBER },
            fatigueAnalysis: {
                type: Type.OBJECT,
                properties: {
                    homeDaysRest: { type: Type.NUMBER },
                    awayDaysRest: { type: Type.NUMBER },
                    homeFatigueScore: { type: Type.NUMBER },
                    awayFatigueScore: { type: Type.NUMBER },
                    travelImpact: { type: Type.STRING },
                    scheduleSpot: { type: Type.STRING }
                }
            }
        }
    },
    microMatchups: {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                matchup: { type: Type.STRING, description: "e.g., 'WR1 vs CB1' or 'Center vs Center'" },
                advantage: { type: Type.STRING, enum: ["Home", "Away", "Even"] },
                impact: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
                analysis: { type: Type.STRING }
            },
            required: ["matchup", "advantage", "impact", "analysis"]
        }
    },
    analysis: { type: Type.STRING },
    trends: { type: Type.ARRAY, items: { type: Type.STRING } },
    props: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          player: { type: Type.STRING },
          bet: { type: Type.STRING },
          line: { type: Type.STRING },
          stat: { type: Type.STRING },
          type: { type: Type.STRING, enum: ['MORE', 'LESS'] },
          odds: { type: Type.STRING },
          probability: { type: Type.STRING },
          edge: { type: Type.NUMBER },
          isElite179: { type: Type.BOOLEAN },
          isHot: { type: Type.BOOLEAN },
          last3Games: { type: Type.ARRAY, items: { type: Type.NUMBER }, description: "Array of the actual stat values for the last 3 games" },
          last3GamesAvg: { type: Type.STRING },
          last3GamesHitRate: { type: Type.STRING },
          last4GamesStreak: {
            type: Type.OBJECT,
            properties: {
                type: { type: Type.STRING, enum: ['HOT', 'COLD', 'NEUTRAL'] },
                avg: { type: Type.STRING },
                hitRate: { type: Type.STRING },
                games: { type: Type.ARRAY, items: { type: Type.NUMBER } }
            }
          },
          vsOpponentStats: { type: Type.STRING },
          analysis: { type: Type.STRING },
          situationalNote: { type: Type.STRING },
          projectionData: {
              type: Type.OBJECT,
              properties: {
                  last5Average: { type: Type.STRING },
                  last10Average: { type: Type.STRING },
                  seasonAverage: { type: Type.STRING },
                  floor: { type: Type.STRING },
                  ceiling: { type: Type.STRING },
                  consistencyScore: { type: Type.NUMBER }
              }
          },
          matchupDeltas: {
              type: Type.ARRAY,
              items: {
                  type: Type.OBJECT,
                  properties: {
                      category: { type: Type.STRING },
                      playerStat: { type: Type.STRING },
                      opponentStat: { type: Type.STRING },
                      advantage: { type: Type.STRING, enum: ['Player', 'Opponent', 'Neutral'] }
                  }
              }
          },
          deepPsyche: {
              type: Type.OBJECT,
              properties: {
                  internalMonologue: { type: Type.STRING },
                  motivationOverride: { type: Type.STRING, enum: ['Fired Up', 'Doubtful', 'Laser Focused', 'Anxious', 'Vengeful'] },
                  visceralImpactScore: { type: Type.NUMBER }
              }
          }
        },
        required: ["player", "line", "stat", "type", "probability"]
      }
    }
  },
  required: ["winner", "confidence", "bestBet", "analysis"]
};

const deepDiveSchema = {
    type: Type.OBJECT,
    properties: {
        last10Games: { 
            type: Type.ARRAY, 
            items: { type: Type.NUMBER },
            description: "Array of raw stat values for the last 10 games (e.g. [24, 30, 18...])"
        },
        h2hGames: {
            type: Type.ARRAY,
            items: { type: Type.NUMBER },
            description: "Array of raw stat values for the last 5 games against this specific opponent"
        },
        consistencyScore: { type: Type.NUMBER, description: "0-100 score of variance" },
        summary: { type: Type.STRING, description: "Tactical summary of the findings" },
        trendDirection: { type: Type.STRING, enum: ['Up', 'Down', 'Flat'] }
    },
    required: ["last10Games", "h2hGames", "consistencyScore", "summary"]
};

export async function getSchedule(sport: string, forceRefresh = false): Promise<Game[]> {
  const cacheKey = sport.toLowerCase();
  const cached = scheduleCache[cacheKey];

  if (!forceRefresh && cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
    return cached.data;
  }

  return callWithRetry(async () => {
    const ai = getAI();
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    const result = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Current Date: ${today}.
      Find ALL currently scheduled or live ${sport} games for today and this week. 
      CRITICAL: You MUST check if ${sport} is currently in the playoffs. If it is the playoffs, include the current series score (e.g. "Game 5 (Tied 2-2)") in the game time or status field.
      IMPORTANT:
      1. If games are LIVE, include the current score (e.g., "24-17").
      2. If games are SCHEDULED, include the time. Include "Playoffs Game X" if applicable.
      3. Include MONEYLINE, SPREAD, and TOTAL odds if available.
      4. Flag "isMustWin" as true if a team is facing elimination, fighting for a playoff spot, or in a critical playoff game.
      RETURN JSON ONLY.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: scheduleSchema,
        tools: [{ googleSearch: {} }],
        temperature: 0.1
      }
    });

    const text = result.text;
    if (!text) return [];
    
    const data = JSON.parse(text);
    const games = data.games || [];
    
    scheduleCache[cacheKey] = { data: games, timestamp: Date.now() };
    return games;
  });
}

const comparisonSchema = {
    type: Type.OBJECT,
    properties: {
        playerA: { type: Type.STRING },
        playerB: { type: Type.STRING },
        sport: { type: Type.STRING },
        metrics: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    metric: { type: Type.STRING },
                    playerAValue: { type: Type.STRING },
                    playerBValue: { type: Type.STRING },
                    advantage: { type: Type.STRING, enum: ['PlayerA', 'PlayerB', 'Push'] },
                    insight: { type: Type.STRING }
                }
            }
        },
        summary: { type: Type.STRING },
        betterPick: { type: Type.STRING },
        confidenceScore: { type: Type.NUMBER }
    },
    required: ["playerA", "playerB", "metrics", "summary", "betterPick"]
};

export async function comparePlayers(playerA: string, playerB: string, sport: string): Promise<PlayerComparisonResult> {
    return callWithRetry(async () => {
        const ai = getAI();
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

        const result = await ai.models.generateContent({
            model: 'gemini-3.1-pro-preview',
            contents: `Current Date: ${today}. Sport: ${sport}.
            Compare ${playerA} and ${playerB} for upcoming games.
            
            Analyze:
            1. Recent Form (Last 5/10 games).
            2. Head-to-Head stats if applicable (or vs common opponents).
            3. Advanced Metrics (Efficiency, Usage, etc.).
            4. Situational Factors (Home/Away, Rest, Matchup difficulty).
            
            HARD RULE: Anthony Davis is NO LONGER on the Lakers. DO NOT predict him playing for the Lakers under any circumstances.
            
            Provide a side-by-side comparison of key metrics.
            Determine who is the "Better Pick" for fantasy/props today.
            
            Return JSON matching the schema.`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: comparisonSchema,
                tools: [{ googleSearch: {} }],
                temperature: 0.2
            }
        });

        const text = result.text;
        if (!text) throw new Error("Comparison Failed");
        return JSON.parse(text);
    });
}

export async function generatePrediction(homeTeam: string, awayTeam: string, sport: string, systemInstruction: string, memory?: NeuralMemory, vault?: SavedMatchup[]): Promise<Prediction> {
    return callWithRetry(async () => {
        const ai = getAI();
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

        let advancedMetricsPrompt = "";
        if (sport.toUpperCase() === 'NBA' || sport.toUpperCase() === 'NCAA') {
            advancedMetricsPrompt = "Include Offensive/Defensive Ratings, Pace, and Four Factors.";
        } else if (sport.toUpperCase() === 'NFL') {
            advancedMetricsPrompt = "Include DVOA, EPA/Play, and Success Rate.";
        } else if (sport.toUpperCase() === 'MLB') {
            advancedMetricsPrompt = "Include FIP, xERA, and wRC+.";
        } else if (sport.toUpperCase().includes('SOCCER')) {
            advancedMetricsPrompt = "Include xG (Expected Goals), xA, and Possession stats.";
        }

        let memoryPrompt = "";
        if (memory && memory.axioms.length > 0) {
            memoryPrompt = `
            NEURAL MEMORY (PAST LEARNINGS):
            Apply these learned axioms from past predictions:
            ${memory.axioms.map(a => `- ${a.rule} (Weight: ${a.weight})`).join('\n')}
            `;
        }

        let vaultPrompt = "";
        if (vault && vault.length > 0) {
            const recentCompleted = vault.filter(v => v.outcome && v.outcome !== 'PENDING').slice(-5);
            if (recentCompleted.length > 0) {
                vaultPrompt = `
                HISTORICAL PERFORMANCE (VAULT):
                Here is a summary of recent betting outcomes. Use this to identify what types of bets have been successful or unsuccessful recently:
                ${recentCompleted.map(v => `- Predicted ${v.winner} (${v.confidence} confidence). Outcome: ${v.outcome}. ${v.userFeedback ? `User Feedback: ${v.userFeedback}` : ''}`).join('\n')}
                `;
            }
        }

        const result = await ai.models.generateContent({
            model: 'gemini-3.1-pro-preview',
            contents: `Current Date: ${today}. Sport: ${sport}.
            Analyze ${homeTeam} vs ${awayTeam} with maximum forensic depth for the game scheduled around this date.
            
            ${memoryPrompt}
            ${vaultPrompt}

            MULTI-SOURCE DATA ANALYTICS ENGINE PROTOCOL:
            1. **Sharp Money & Line Movement**: Query multiple sportsbooks (DraftKings, FanDuel, Pinnacle) to track opening vs current lines. Identify sharp money vs public money splits.
            2. **Advanced Statistical Modeling**: Query high-fidelity analytics sources (e.g., Cleaning the Glass, PFF, FanGraphs, FBref depending on sport) for the requested advanced metrics.
            3. **Situational & Environmental Factors**: Analyze travel schedules (rest advantage, back-to-backs, time zone changes), weather conditions (wind speed, precipitation for outdoor sports), and referee tendencies.
            4. **Micro-Matchup Analysis**: Analyze specific player vs player matchups (e.g., WR vs CB, Pitcher vs Batter, Center vs Center) using recent tracking data.
            5. **Quantum Angles & Non-Linear Probability**: Implement quantum analysis for this matchup. Calculate the entropy score (chaos vs determinism), determine the wave function state (Collapsing, Superposition, Entangled), calculate the volatility index, and identify the dominant energy or momentum shift that could cause a butterfly effect.

            CRITICAL DATA INTEGRITY PROTOCOL:
            1. **CURRENT ROSTERS & PLAYOFF VERIFICATION**: You MUST use the CURRENT real-world rosters, current active playoff brackets, and exact playoff round for the ${today} season. 
               - NEVER hallucinate regular season logic for playoff games.
               - Do NOT include players who have been traded, waived, or retired.
               - Specifically check for recent trades, call-ups, or lineup changes up to this exact week.
               - User has reported "mixed eras" (e.g. old players mixed with new). STOP THIS.
               - Verify the active lineup for BOTH teams before generating props.
               - DO NOT INVENT OR HALLUCINATE ANY TRADES. Rely ONLY on verified current data.
            2. **INJURY EXCLUSION (ZERO TOLERANCE)**:
               - You MUST perform a real-time injury check for EVERY player you consider for a prop.
               - If a player is listed as "Out", "Injured", or "Season Ending Injury", they CANNOT be a "Best Bet" or "Prop".
               - If you suggest a player who is not playing, the entire prediction is a FAILURE.
            3. **SAMPLE SIZE STRICTNESS (CRITICAL)**:
               - DO NOT recommend props for players making their debut, recent call-ups, or players with low sample sizes.
               - We recently failed a prediction by guaranteeing a 1st-time call-up wouldn't get a hit. DO NOT REPEAT THIS MISTAKE.
               - Only recommend props for established players with predictable volume and converging data points.
            
            OBJECTIVE: Provide the single HIGHEST POSSIBILITY outcome based on granular data. You must be EXTREMELY SELECTIVE. If a bet does not have a massive edge, DO NOT recommend it. We need to hit at an 85% clip.
            
            REQUIRED DATA POINTS TO ANALYZE:
            1. **ROSTER PROOF**: List the top 3 key players for ${homeTeam} and ${awayTeam} in the 'rosterValidation' field. If you list a player who is no longer on the team, the entire prediction is invalid.
            2. **Officials Analysis**: Who is the referee? What is their home/road bias? Impact on Over/Under?
            3. **Venue Intelligence**: Altitude? Weather? Crowd noise decibels? Court/Field surface quirks?
            4. **Simulation**: Run 10,000 internal simulations. What is the win % distribution?
            5. **Veto Phase**: Are there any late scratches or "flu game" rumors?
            6. **Syndicate Money**: Where is the sharp money moving the line?
            7. **HOT/COLD STREAKS & LAST 3 GAMES**: For every player prop, analyze the LAST 3 GAMES specifically.
               - Provide the raw values for these last 3 games in the 'last3Games' array.
               - Calculate the average for these 3 games in 'last3GamesAvg'.
               - Determine if they are 'HOT' or 'COLD'.
            8. **ADVANCED METRICS**: ${advancedMetricsPrompt} Fill the 'advancedMetrics' field with this data.
            9. **DATA SOURCES**: List the specific websites, APIs, or databases you queried in the 'sourcesQueried' field of 'dataQuality'.
            10. **QUANTUM & NUMEROLOGY ANALYSIS**: Fill the 'quantumAnalysis' field. Use advanced algorithms (Schrödinger Form, Markov Chaos, Heisenberg Uncertainty, Bose-Einstein Momentum) to model wave-function probability and identify the single 'butterfly variable' triggering cascade effects. Also provide 'gematriaIntel' assessing numerological resonance for key players/teams.
            11. **SOCIAL MEDIA SCANDAL SCALAR**: Evaluate 'situationalIntelligence'. If there is a current social media scandal, drama, or distraction for a team/player, provide details in 'scandalContext' and apply a negative decimal (-1.0 to 0.0) in 'socialMediaDramaScalar'. Reduce prediction confidence accordingly.
            12. **DEEP PSYCHE / PLAYER VOICE**: For every prop bet, simulate the player's visceral internal monologue in the 'deepPsyche' field based on context (e.g., returning from injury, media scrutiny). 
               - **CRITICAL**: Use this context to override baseline stats. 
               - **THE WALKER BUEHLER RULE**: We recently lost on Buehler Over 16.5 Outs because we ignored management pitch counts post-injury. If a pitcher is returning from a long layoff, you MUST restrict their projections. If you suspect a pitch count, either pass or predict the UNDER. Do NOT predict overs on returning injured pitchers.
            
            13. **ACCURACY INITIATIVE**: Only surface props and bets with a historical win rate or projected probability > 82%. Discard any "lean" or "speculative" plays. Ensure all numerical data cited is verifiable. We need to focus on absolute certainties and high-leverage mismatches.

            Provide a strict "Best Bet" with a high edge percentage.
            
            IMPORTANT: The 'analysis' field must be a BRIEF (3-4 sentences) executive summary highlighting the single most critical factor (e.g. "Lakers win due to Davis matchup advantage in the paint vs a depleted Warriors frontcourt"). IT MUST ALSO explicitly outline your top 2 recommended player props and *why* they are lock plays based on your advanced metrics and deep psyche insights.
            
            Return JSON matching the schema.`,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: 'application/json',
                responseSchema: predictionSchema,
                tools: [{ googleSearch: {} }],
                temperature: 0.1
            }
        });

        const text = result.text;
        if (!text) throw new Error("Neural Blank");
        const parsed = JSON.parse(text);
        
        // Post-processing filter to enforce the Anthony Davis rule
        if (parsed.props) {
            parsed.props = parsed.props.filter((prop: any) => {
                const playerName = prop.player?.toLowerCase() || '';
                // If the game involves the Lakers, and the player is Anthony Davis, remove him.
                // To be absolutely safe, we'll just remove him if he's predicted for the Lakers.
                // Since we don't know which team he's predicted for in the prop itself,
                // and the user is complaining about him being predicted on the Lakers,
                // we'll just remove him if the homeTeam or awayTeam is the Lakers.
                const isLakersGame = homeTeam.toLowerCase().includes('lakers') || awayTeam.toLowerCase().includes('lakers');
                if (isLakersGame && playerName.includes('anthony davis')) {
                    return false;
                }
                return true;
            });
        }
        
        return parsed;
    });
}

export async function generatePlayerDeepDive(player: string, stat: string, line: string, opponent: string): Promise<PlayerDeepDive> {
    return callWithRetry(async () => {
        const ai = getAI();
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

        const result = await ai.models.generateContent({
            model: 'gemini-3.1-pro-preview',
            contents: `Current Date: ${today}.
            Generate a deep statistical audit for ${player}.
            Context: Line is ${line} for ${stat} against ${opponent}.
            
            VERIFY: Ensure ${player} is currently active and playing for the team facing ${opponent}.
            HARD RULE: Anthony Davis is NO LONGER on the Lakers. DO NOT predict him playing for the Lakers under any circumstances.
            
            Find:
            1. Last 10 games actual values for ${stat}.
            2. Last 5 games actual values against ${opponent} specifically.
            3. Consistency Score (0-100).
            4. A brief tactical summary.
            
            Return raw JSON data.`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: deepDiveSchema,
                tools: [{ googleSearch: {} }],
                temperature: 0.1
            }
        });
        
        const text = result.text;
        if (!text) throw new Error("Deep Dive Failed");
        return JSON.parse(text);
    });
}

export async function generateReflection(vault: SavedMatchup[]): Promise<{ axioms: NeuralAxiom[], levelUp: number, summary: string }> {
    return callWithRetry(async () => {
        const ai = getAI();
        const vaultStr = JSON.stringify(vault.slice(0, 20)); // Last 20 items
        
        const result = await ai.models.generateContent({
            model: 'gemini-3.1-pro-preview',
            contents: `Analyze these past betting outcomes and USER FEEDBACK: ${vaultStr}.
            
            Focus heavily on:
            1. "outcome" (WIN/LOSS) - What patterns lead to losses?
            2. "userFeedback" - What did the human user notice that the AI missed?
            3. "accuracyRating" - Low ratings indicate poor logic, even if the bet won.
            
            Identify patterns where the model failed or succeeded.
            Extract 3-5 specific "Axioms" or rules to improve future accuracy.
            Calculate an "Evolution Level" increase (1-5) based on the insights found.`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: reflectionSchema,
                temperature: 0.2
            }
        });
        
        const text = result.text;
        if (!text) throw new Error("Reflection Failed");
        
        const parsed = JSON.parse(text);
        return {
            axioms: parsed.axioms || [],
            levelUp: parsed.evolutionLevelChange || 0,
            summary: parsed.summary || "Analysis Complete."
        };
    });
}
