
import React from 'react';
import { LogoIcon, CheckIcon, HammerIcon } from './Icons';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  isVeteran?: boolean;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, onUpgrade, isVeteran }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 animate-fade-in">
      <div className="bg-[#050505] border border-amber-500/30 w-full max-w-4xl rounded-[3rem] overflow-hidden relative shadow-[0_0_100px_rgba(245,158,11,0.15)] flex flex-col md:flex-row">
        
        {/* Decorative Grid */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(245,158,11,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.03)_1px,transparent_1px)] bg-[length:40px_40px]"></div>

        {isVeteran ? (
            <div className="w-full p-16 flex flex-col items-center justify-center text-center space-y-8 bg-zinc-950/80 relative z-10">
                <div className="w-24 h-24 rounded-full bg-amber-500/10 border-2 border-amber-500 flex items-center justify-center">
                    <span className="text-4xl">🎖️</span>
                </div>
                <div>
                    <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Honor Code Active</h3>
                    <p className="text-sm text-amber-500 font-bold uppercase tracking-widest mt-2">Veteran Elite Status Confirmed</p>
                </div>
                <div className="max-w-md mx-auto bg-black/50 p-6 rounded-2xl border border-zinc-800">
                    <p className="text-zinc-400 text-sm leading-relaxed italic">
                        "Your service has been verified. You have lifetime access to the 180-Alpha Neural Engine with zero restrictions. Thank you."
                    </p>
                </div>
                <button onClick={onClose} className="bg-amber-500 text-black px-10 py-4 rounded-xl font-black uppercase tracking-[0.3em] hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/20">
                    Return to Command
                </button>
            </div>
        ) : (
            <>
                {/* Left: Free Tier */}
                <div className="flex-1 p-10 md:p-14 flex flex-col items-start justify-center border-b md:border-b-0 md:border-r border-zinc-900 bg-zinc-950/50 relative">
                    <h3 className="text-xl font-black text-zinc-500 uppercase tracking-[0.3em] mb-2">Prognos Basic</h3>
                    <div className="text-4xl font-black text-white mb-8 tracking-tighter">Free</div>
                    
                    <ul className="space-y-4 mb-10">
                        <li className="flex items-center gap-3 text-zinc-400 text-sm font-bold">
                            <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center"><CheckIcon className="w-3 h-3" /></div>
                            2 Neural Scans / Day
                        </li>
                        <li className="flex items-center gap-3 text-zinc-400 text-sm font-bold">
                            <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center"><CheckIcon className="w-3 h-3" /></div>
                            Basic Winner Prediction
                        </li>
                        <li className="flex items-center gap-3 text-zinc-600 text-sm font-bold line-through decoration-zinc-700">
                            <div className="w-5 h-5 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800"></div>
                            Advanced Radar Metrics
                        </li>
                        <li className="flex items-center gap-3 text-zinc-600 text-sm font-bold line-through decoration-zinc-700">
                            <div className="w-5 h-5 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800"></div>
                            Prop Projection Values
                        </li>
                    </ul>

                    <button onClick={onClose} className="text-zinc-500 font-bold text-xs uppercase tracking-widest hover:text-white transition-colors">
                        Continue with Restrictions
                    </button>
                </div>

                {/* Right: Pro Tier */}
                <div className="flex-1 p-10 md:p-14 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-bl-2xl">
                        Most Popular
                    </div>
                    
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-amber-500/5 blur-3xl group-hover:bg-amber-500/10 transition-colors duration-700"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <LogoIcon className="w-6 h-6 text-amber-500" />
                            <h3 className="text-xl font-black text-amber-500 uppercase tracking-[0.3em]">Alpha Elite</h3>
                        </div>
                        <div className="flex items-baseline gap-2 mb-8">
                            <span className="text-5xl font-black text-white tracking-tighter">$29</span>
                            <span className="text-zinc-500 font-bold uppercase text-xs">/ Month</span>
                        </div>

                        <ul className="space-y-4 mb-10">
                            <li className="flex items-center gap-3 text-white text-sm font-bold">
                                <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-black"><CheckIcon className="w-3 h-3" /></div>
                                Unlimited Neural Scans
                            </li>
                            <li className="flex items-center gap-3 text-white text-sm font-bold">
                                <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-black"><CheckIcon className="w-3 h-3" /></div>
                                Full Radar & Variance Data
                            </li>
                            <li className="flex items-center gap-3 text-white text-sm font-bold">
                                <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-black"><CheckIcon className="w-3 h-3" /></div>
                                Elite Prop Values & Edges
                            </li>
                            <li className="flex items-center gap-3 text-white text-sm font-bold">
                                <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-black"><CheckIcon className="w-3 h-3" /></div>
                                Vault History Access
                            </li>
                        </ul>

                        <button 
                            onClick={onUpgrade}
                            className="w-full py-5 bg-amber-500 hover:bg-amber-400 text-black rounded-2xl font-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all transform active:scale-95 flex items-center justify-center gap-3"
                        >
                            <HammerIcon className="w-5 h-5" />
                            Unlock Full Power
                        </button>
                        
                        <p className="text-center mt-4 text-[9px] text-zinc-600 font-bold uppercase tracking-widest">
                            Secure Processing • Cancel Anytime
                        </p>
                    </div>
                </div>
            </>
        )}
      </div>
    </div>
  );
};
