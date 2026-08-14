
import React, { useState, useEffect, useRef } from 'react';
import { HammerIcon, LogoIcon } from './Icons';
import type { MiningState } from '../types';

interface TokenomicsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TokenomicsModal: React.FC<TokenomicsModalProps> = ({ isOpen, onClose }) => {
  const [stage, setStage] = useState<'Setup' | 'Genesis' | 'Mining'>('Setup');
  const [mining, setMining] = useState<MiningState>({
    isMining: false,
    hps: 0,
    totalMined: 0,
    unpaidBalance: 0,
    algo: 'RandomX-Pro',
    efficiency: 0
  });
  const [logs, setLogs] = useState<string[]>(["[SYSTEM] Kernel Ready.", "[NETWORK] Awaiting Genesis Seed..."]);
  const [genesisProgress, setGenesisProgress] = useState(0);
  const hpsTimer = useRef<number | null>(null);

  const addLog = (msg: string) => {
    setLogs(prev => [msg, ...prev].slice(0, 6));
  };

  const startGenesis = () => {
    setStage('Genesis');
    addLog("[GENESIS] Calculating Argon2d Salt...");
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 15;
      if (p >= 100) {
        setGenesisProgress(100);
        clearInterval(interval);
        setTimeout(() => {
          setStage('Mining');
          addLog("[GENESIS] Block 0 Found. Hash: 00000000...prog_alpha");
          addLog("[NETWORK] Mainnet Live. Epoch 1 Initialized.");
        }, 1000);
      } else {
        setGenesisProgress(p);
        if (p > 30 && p < 40) addLog("[GENESIS] Scrambling VM Address Space...");
        if (p > 70 && p < 80) addLog("[GENESIS] Hardcoding Coin Issuance: 18,446,744 $PROG");
      }
    }, 400);
  };

  useEffect(() => {
    if (mining.isMining && stage === 'Mining') {
      hpsTimer.current = window.setInterval(() => {
        const baseHps = mining.algo === 'RandomX-Pro' ? 1850 : 550;
        const randomHps = baseHps + Math.random() * (baseHps * 0.12);
        
        setMining(prev => ({
          ...prev,
          hps: randomHps,
          efficiency: mining.algo === 'RandomX-Pro' ? 12.4 : 6.8,
          unpaidBalance: prev.unpaidBalance + (randomHps / 1500000)
        }));
        
        if (Math.random() > 0.8) {
          const logMsg = mining.algo === 'RandomX-Pro' 
            ? `[RX-VM] L3 Cache Hit (Latency: 0.2ms)`
            : `[G-RIDER] Block Accepted: ${Math.floor(Math.random() * 100000)}`;
          addLog(logMsg);
        }
      }, 1000);
    } else {
      if (hpsTimer.current) clearInterval(hpsTimer.current);
      setMining(prev => ({ ...prev, hps: 0, efficiency: 0 }));
    }
    return () => { if (hpsTimer.current) clearInterval(hpsTimer.current); };
  }, [mining.isMining, mining.algo, stage]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/98 backdrop-blur-3xl" onClick={onClose}>
      <div className="bg-[#050505] border border-amber-500/20 rounded-[3rem] shadow-[0_0_180px_rgba(245,158,11,0.15)] w-full max-w-2xl m-4 overflow-hidden relative font-mono" onClick={(e) => e.stopPropagation()}>
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.2)_50%)] z-50 bg-[length:100%_2px] opacity-40"></div>

        <div className="p-8 border-b border-zinc-900 flex justify-between items-center relative z-10 bg-zinc-950/95">
            <div className="flex items-center gap-4">
                <div className="bg-amber-500/10 p-3 rounded-2xl border border-amber-500/40">
                    <HammerIcon className="w-8 h-8 text-amber-500" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic italic">PROGNOS MAINNET</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] text-amber-500 font-black uppercase tracking-widest">{stage === 'Mining' ? 'NETWORK ACTIVE' : 'PENDING GENESIS'}</span>
                        <div className={`w-1.5 h-1.5 rounded-full ${stage === 'Mining' ? 'bg-green-500 shadow-[0_0_10px_green]' : 'bg-amber-500 animate-pulse'}`}></div>
                    </div>
                </div>
            </div>
            <button onClick={onClose} className="text-zinc-700 hover:text-white transition-colors bg-zinc-900/50 p-2 rounded-xl border border-white/5">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>

        <div className="p-8 space-y-8 relative z-10">
            {stage === 'Setup' && (
                <div className="text-center py-10 space-y-6 animate-fade-in">
                    <LogoIcon className="w-20 h-20 text-zinc-800 mx-auto opacity-50" />
                    <div className="space-y-2">
                        <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Ready to Deploy Prognos L1</h3>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest max-w-xs mx-auto">This will initialize Block 0 and activate the RandomX-Pro ASIC-Immune Protocol.</p>
                    </div>
                    <button onClick={startGenesis} className="bg-amber-500 text-black px-10 py-5 rounded-[2rem] font-black uppercase tracking-[0.4em] text-xs hover:bg-amber-400 shadow-2xl transition-all">
                        Initialize Genesis
                    </button>
                </div>
            )}

            {stage === 'Genesis' && (
                <div className="py-12 space-y-8 animate-fade-in">
                    <div className="flex flex-col items-center">
                        <span className="text-6xl font-black text-amber-500 tabular-nums italic">{Math.floor(genesisProgress)}%</span>
                        <span className="text-[10px] text-zinc-600 uppercase tracking-[0.5em] mt-2">Hacking Block 0 Solution...</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                        <div className="h-full bg-amber-500 shadow-[0_0_20px_orange] transition-all duration-300" style={{ width: `${genesisProgress}%` }}></div>
                    </div>
                    <div className="bg-black/50 p-4 rounded-2xl border border-zinc-900 text-[10px] text-zinc-500 font-mono italic text-center">
                        {logs[0]}
                    </div>
                </div>
            )}

            {stage === 'Mining' && (
                <div className="space-y-8 animate-fade-in">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-[2.2rem]">
                            <span className="text-[7px] font-black text-zinc-600 uppercase tracking-[0.3em] block mb-2">Hash Rate</span>
                            <span className="text-3xl font-black text-amber-500 tabular-nums italic">{mining.hps.toFixed(0)}</span>
                        </div>
                        <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-[2.2rem]">
                            <span className="text-[7px] font-black text-zinc-600 uppercase tracking-[0.3em] block mb-2">Efficiency</span>
                            <span className="text-3xl font-black text-white tabular-nums italic">{mining.efficiency.toFixed(1)}</span>
                        </div>
                        <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-[2.2rem]">
                            <span className="text-[7px] font-black text-zinc-600 uppercase tracking-[0.3em] block mb-2">Net Balance</span>
                            <span className="text-3xl font-black text-amber-500 tabular-nums italic">{mining.unpaidBalance.toFixed(4)}</span>
                        </div>
                    </div>

                    <div className="bg-black border border-zinc-900 rounded-[2.5rem] p-8 font-mono text-[10px] space-y-1.5 min-h-[160px] shadow-inner relative overflow-hidden">
                        {logs.map((log, i) => (
                            <div key={i} className={`${log.includes('GENESIS') || log.includes('RX-VM') ? 'text-amber-500' : 'text-zinc-700'} opacity-${100 - (i * 15)}`}>
                                <span className="text-zinc-800 mr-4">[{new Date().toLocaleTimeString()}]</span>
                                {log}
                            </div>
                        ))}
                    </div>

                    <button 
                        onClick={() => setMining(prev => ({ ...prev, isMining: !prev.isMining }))}
                        className={`w-full py-8 rounded-[2.2rem] font-black text-xs uppercase tracking-[0.6em] transition-all shadow-2xl border-b-[10px] ${
                            mining.isMining ? 'bg-zinc-900 border-zinc-950 text-red-500' : 'bg-amber-500 border-amber-700 text-black hover:bg-amber-400'
                        }`}
                    >
                        {mining.isMining ? 'HALT KERNEL' : 'START MINING $PROG'}
                    </button>
                </div>
            )}

            <p className="text-[8px] text-zinc-800 text-center font-black uppercase tracking-[0.8em] pt-6 leading-relaxed opacity-40">
                PRO-N-OS 180-ALPHA SECURE DEPLOYMENT. <br/>
                RANDOMX INTEGRITY: VERIFIED BY ARGON2D-PROG.
            </p>
        </div>
      </div>
    </div>
  );
};
