
import React, { useState, useRef } from 'react';
import { LogoIcon, CheckIcon, UserIcon, ImageIcon } from './Icons';
import type { UserProfile } from '../types';

interface SignupModalProps {
    isOpen: boolean;
    onComplete: (profile: UserProfile) => void;
}

export const SignupModal: React.FC<SignupModalProps> = ({ isOpen, onComplete }) => {
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [isVeteran, setIsVeteran] = useState<boolean | null>(null);
    const [idImage, setIdImage] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setIdImage(event.target?.result as string);
                setIsScanning(true);
                // Simulate Neural Scan
                setTimeout(() => setIsScanning(false), 2500);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFinish = () => {
        onComplete({
            name: name || 'Agent',
            isVeteran: isVeteran === true,
            isVerified: isVeteran === true && !!idImage, // Simple verification logic for demo
            idImage: idImage || undefined,
            joinedDate: Date.now()
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/98 backdrop-blur-3xl p-4">
            <div className="w-full max-w-md bg-[#0a0a0a] border border-amber-500/30 rounded-[3rem] overflow-hidden relative shadow-[0_0_100px_rgba(245,158,11,0.1)]">
                {/* Background Grid */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(245,158,11,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.03)_1px,transparent_1px)] bg-[length:30px_30px]"></div>

                {/* Progress Bar */}
                <div className="absolute top-0 left-0 w-full h-1 bg-zinc-900">
                    <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }}></div>
                </div>

                <div className="p-10 relative z-10 flex flex-col h-[500px]">
                    
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/30">
                            <LogoIcon className="w-6 h-6 text-amber-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">Alpha Agent Reg.</h2>
                            <p className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.2em]">Secure Onboarding</p>
                        </div>
                    </div>

                    {/* Step 1: Identity */}
                    {step === 1 && (
                        <div className="flex-1 flex flex-col justify-center space-y-6 animate-fade-in">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest pl-2">Codename / Alias</label>
                                <div className="relative">
                                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                                    <input 
                                        type="text" 
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="ENTER AGENT NAME"
                                        className="w-full bg-black border-2 border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white font-bold tracking-widest uppercase focus:outline-none focus:border-amber-500/50 transition-all placeholder:text-zinc-800"
                                    />
                                </div>
                            </div>
                            
                            <div className="bg-zinc-900/40 p-6 rounded-2xl border border-white/5">
                                <p className="text-zinc-500 text-xs italic leading-relaxed text-center">
                                    "Accessing the Neural-Kinetic Engine requires security clearance. Data is encrypted locally."
                                </p>
                            </div>

                            <button 
                                onClick={() => name && setStep(2)}
                                disabled={!name}
                                className="w-full py-5 bg-zinc-100 hover:bg-white text-black rounded-2xl font-black uppercase tracking-[0.3em] disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-auto"
                            >
                                Proceed
                            </button>
                        </div>
                    )}

                    {/* Step 2: Service Status */}
                    {step === 2 && (
                        <div className="flex-1 flex flex-col justify-center space-y-6 animate-slide-in-right">
                             <div className="text-center space-y-2 mb-4">
                                <h3 className="text-2xl font-black text-white uppercase italic">Service Record</h3>
                                <p className="text-xs text-zinc-500 font-medium">Are you a Military Veteran?</p>
                             </div>

                             <div className="grid grid-cols-2 gap-4">
                                <button 
                                    onClick={() => setIsVeteran(false)}
                                    className={`p-6 rounded-3xl border-2 flex flex-col items-center justify-center gap-3 transition-all ${isVeteran === false ? 'bg-zinc-800 border-zinc-600' : 'bg-black border-zinc-800 hover:border-zinc-700'}`}
                                >
                                    <span className="text-3xl grayscale"> civilian </span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Civilian</span>
                                </button>
                                <button 
                                    onClick={() => setIsVeteran(true)}
                                    className={`p-6 rounded-3xl border-2 flex flex-col items-center justify-center gap-3 transition-all ${isVeteran === true ? 'bg-amber-500/20 border-amber-500' : 'bg-black border-zinc-800 hover:border-amber-500/50'}`}
                                >
                                    <span className="text-3xl"> 🎖️ </span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white">Veteran</span>
                                </button>
                             </div>

                             {isVeteran === true && (
                                 <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl flex items-center gap-3">
                                     <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                                     <p className="text-[10px] text-amber-500 font-bold uppercase tracking-wide">
                                         Honor Code Detected: Lifetime Elite Access
                                     </p>
                                 </div>
                             )}

                             <button 
                                onClick={() => isVeteran !== null ? setStep(isVeteran ? 3 : 4) : null}
                                disabled={isVeteran === null}
                                className="w-full py-5 bg-zinc-100 hover:bg-white text-black rounded-2xl font-black uppercase tracking-[0.3em] disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-auto"
                            >
                                Confirm Status
                            </button>
                        </div>
                    )}

                    {/* Step 3: ID Upload (Veterans Only) */}
                    {step === 3 && (
                        <div className="flex-1 flex flex-col justify-center space-y-6 animate-slide-in-right">
                            <div className="text-center space-y-2">
                                <h3 className="text-xl font-black text-white uppercase italic">Clearance Verification</h3>
                                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Upload Military ID or DD-214</p>
                            </div>

                            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                            
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-zinc-800 rounded-[2rem] h-48 flex flex-col items-center justify-center gap-4 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all group relative overflow-hidden"
                            >
                                {idImage ? (
                                    <>
                                        <img src={idImage} className="absolute inset-0 w-full h-full object-cover opacity-50 blur-sm" />
                                        <div className="absolute inset-0 bg-black/40 z-10"></div>
                                        <div className="relative z-20 flex flex-col items-center">
                                            {isScanning ? (
                                                <>
                                                    <div className="w-12 h-12 rounded-full border-4 border-t-amber-500 animate-spin mb-2"></div>
                                                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest animate-pulse">Neural Scanning...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-2 shadow-[0_0_20px_green]">
                                                        <CheckIcon className="w-6 h-6 text-black" />
                                                    </div>
                                                    <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">ID Verified</span>
                                                </>
                                            )}
                                        </div>
                                        {isScanning && <div className="absolute top-0 left-0 w-full h-1 bg-amber-500 animate-scan-y shadow-[0_0_15px_orange]"></div>}
                                    </>
                                ) : (
                                    <>
                                        <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <ImageIcon className="w-8 h-8 text-zinc-600 group-hover:text-amber-500" />
                                        </div>
                                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Tap to Upload</span>
                                    </>
                                )}
                            </button>

                            <p className="text-[8px] text-zinc-700 text-center uppercase font-bold px-8">
                                * DEMO MODE: Do not upload real government IDs. Use a sample image for simulation.
                            </p>

                            <button 
                                onClick={() => setStep(4)}
                                disabled={!idImage || isScanning}
                                className="w-full py-5 bg-amber-500 hover:bg-amber-400 text-black rounded-2xl font-black uppercase tracking-[0.3em] disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed transition-all mt-auto shadow-[0_0_30px_rgba(245,158,11,0.2)]"
                            >
                                Verify & Grant Access
                            </button>
                        </div>
                    )}

                    {/* Step 4: Complete */}
                    {step === 4 && (
                        <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6 animate-fade-in">
                            <div className="w-24 h-24 rounded-full bg-zinc-900 border-2 border-zinc-800 flex items-center justify-center relative">
                                <LogoIcon className="w-12 h-12 text-white" />
                                {isVeteran && (
                                    <div className="absolute -bottom-2 -right-2 bg-amber-500 text-black p-2 rounded-full border-4 border-[#0a0a0a]">
                                        <CheckIcon className="w-4 h-4" />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-white uppercase italic">Welcome, {name}</h3>
                                <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest">
                                    {isVeteran ? 'Alpha Elite Status: ACTIVE' : 'Alpha Agent Status: ACTIVE'}
                                </p>
                            </div>

                            {isVeteran && (
                                <div className="bg-amber-500/10 p-6 rounded-2xl border border-amber-500/30 w-full">
                                    <p className="text-xs font-bold text-amber-500 uppercase leading-relaxed">
                                        "Thank you for your service. Usage limits have been removed. Full neural access granted."
                                    </p>
                                </div>
                            )}

                            <button 
                                onClick={handleFinish}
                                className="w-full py-5 bg-white hover:bg-zinc-200 text-black rounded-2xl font-black uppercase tracking-[0.3em] transition-all mt-auto shadow-2xl"
                            >
                                Enter Command Hub
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};
