
import React, { useEffect, useRef, memo } from 'react';
import type { SystemLog } from '../types';

interface NeuralBlackBoxProps {
    isOpen: boolean;
    logs: SystemLog[];
    onClose: () => void;
}

export const NeuralBlackBox: React.FC<NeuralBlackBoxProps> = memo(({ isOpen, logs, onClose }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 h-72 bg-[#0a0a0a] border-t border-amber-500/30 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] z-[60] flex flex-col font-mono text-xs animate-slide-in-up">
            <div className="flex items-center justify-between px-4 py-2 bg-zinc-950 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse shadow-[0_0_8px_orange]"></div>
                    <span className="text-amber-500 font-black uppercase tracking-widest">Neural Black Box // System Monitor</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-zinc-600">Latency: <span className="text-green-500">{logs[logs.length - 1]?.latency || 0}ms</span></span>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            </div>

            <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-1.5 custom-scrollbar bg-black/90"
            >
                {logs.length === 0 && (
                    <div className="text-zinc-700 italic text-center mt-10">System Idle. Awaiting Neural Events...</div>
                )}
                {logs.map((log) => (
                    <div key={log.id} className="flex gap-3 hover:bg-white/5 p-0.5 rounded px-2 transition-colors">
                        <span className="text-zinc-600 shrink-0">[{new Date(log.timestamp).toLocaleTimeString().split(' ')[0]}.{new Date(log.timestamp).getMilliseconds()}]</span>
                        <span className={`font-bold shrink-0 w-24 ${
                            log.type === 'NEURAL' ? 'text-fuchsia-500' :
                            log.type === 'NETWORK' ? 'text-blue-500' :
                            log.type === 'ERROR' ? 'text-red-500' :
                            'text-amber-500'
                        }`}>
                            {log.type}
                        </span>
                        <span className="text-zinc-300 break-all">{log.message}</span>
                        {log.latency && <span className="text-zinc-600 ml-auto shrink-0">{log.latency}ms</span>}
                    </div>
                ))}
            </div>
            
            <div className="px-4 py-1 bg-zinc-950 border-t border-zinc-900 text-[9px] text-zinc-600 flex justify-between">
                <span>MEM: {Math.round(performance.now())}kb</span>
                <span>THREADS: ACTIVE</span>
            </div>
        </div>
    );
});
