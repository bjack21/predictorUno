
import React, { useState, useEffect } from 'react';
import { LogoIcon, CheckIcon } from './Icons';
import type { NeuralAxiom } from '../types';

interface ReflectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    axioms: NeuralAxiom[];
    summary: string;
    levelUp: number;
    currentLevel: number;
}

export const ReflectionModal: React.FC<ReflectionModalProps> = ({ isOpen, onClose, axioms, summary, levelUp, currentLevel }) => {
    const [progress, setProgress] = useState(0);
    const [phase, setPhase] = useState<'Scanning' | 'Auditing' | 'Rewriting' | 'Complete'>('Scanning');

    useEffect(() => {
        if (isOpen) {
            setPhase('Scanning');
            setProgress(0);
            
            // Simulation of a heavy compute process
            let p = 0;
            const interval = setInterval(() => {
                p += 2;
                setProgress(p);
                
                if (p > 30 && p < 60) setPhase('Auditing');
                if (p > 60 && p < 90) setPhase('Rewriting');
                if (p >= 100) {
                    setPhase('Complete');
                    clearInterval(interval);
                }
            }, 50);
            
            return () => clearInterval(interval);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/95 backdrop-blur-2xl">
            <div className="w-full max-w-3xl bg-zinc-950 border-2 border-amber-500/30 rounded-[3rem] overflow-hidden shadow-[0_0_150px_rgba(245,158,11,0.15)] relative m-4">
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(245,158,11,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.05)_1px,transparent_1px)] bg-[length:30px_30px] pointer-events-none"></div>

                <div className="p-10 relative z-10">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className={`p-4 rounded-2xl border ${phase === 'Complete' ? 'bg-green-500/10 border-green-500 text-green-500' : 'bg-amber-500/10 border-amber-500 text-amber-500'}`}>
                                <LogoIcon className={`w-8 h-8 ${phase !== 'Complete' ? 'animate-pulse' : ''}`} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Neural Optimization Protocol</h2>
                                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em]">End of Day Reflection</p>
                            </div>
                        </div>
                        <div className="text-right">
                             <div className="text-[9px] text-zinc-600 font-black uppercase tracking-widest mb-1">Neural Evolution Level</div>
                             <div className="text-3xl font-black text-white tabular-nums italic">
                                v{currentLevel}.0 
                                {phase === 'Complete' && <span className="text-green-500 ml-2 text-lg">+ {levelUp}</span>}
                             </div>
                        </div>
                    </div>

                    {phase !== 'Complete' ? (
                        <div className="space-y-6 py-12">
                            <div className="flex justify-between text-xs font-black uppercase tracking-widest text-zinc-500">
                                <span>{phase} Neural Weights...</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="h-4 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                                <div className="h-full bg-amber-500 shadow-[0_0_20px_orange] transition-all duration-75" style={{ width: `${progress}%` }}></div>
                            </div>
                            <div className="text-center text-zinc-600 font-mono text-[10px] animate-pulse">
                                Analyzing Vault Outcomes vs Actual Reality...
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-slide-in-up">
                            <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl">
                                <h3 className="text-sm font-black text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <CheckIcon className="w-4 h-4" /> Optimization Summary
                                </h3>
                                <p className="text-sm text-zinc-300 italic leading-relaxed border-l-2 border-amber-500/30 pl-4">
                                    "{summary}"
                                </p>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">New Strategic Axioms Learned</h4>
                                <div className="grid gap-3">
                                    {axioms.map((axiom, idx) => (
                                        <div key={idx} className="bg-black border border-zinc-800 p-4 rounded-xl flex items-center justify-between group hover:border-amber-500/50 transition-colors">
                                            <div className="flex-1 mr-4">
                                                <div className="text-xs font-bold text-white mb-1">"{axiom.rule}"</div>
                                                <div className="text-[9px] text-zinc-600 font-mono uppercase">{axiom.sourceMatchup} • {axiom.dateLearned}</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-[8px] text-zinc-600 uppercase tracking-widest">Weight</div>
                                                <div className="text-lg font-black text-amber-500 tabular-nums">{axiom.weight}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button onClick={onClose} className="w-full py-5 bg-amber-500 hover:bg-amber-400 text-black rounded-2xl font-black uppercase tracking-[0.3em] shadow-[0_0_40px_rgba(245,158,11,0.3)] transition-all transform active:scale-95">
                                Integrate New Logic
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
