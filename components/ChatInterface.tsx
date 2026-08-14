
import React, { useState, useRef, useEffect, memo } from 'react';
import type { ChatMessage, OddsFormat, PropBet } from '../types';
import { PredictionDisplay } from './PredictionDisplay';
import { SendIcon, LogoIcon, ImageIcon } from './Icons';

interface ChatInterfaceProps {
    messages: ChatMessage[];
    isReplying: boolean;
    onSendMessage: (message: string, imageData?: { data: string, mimeType: string }) => void;
    oddsFormat: OddsFormat;
    pickSlip?: PropBet[];
    onTogglePick?: (prop: PropBet) => void;
    onSearchPlayer?: (player: string) => void;
}

const renderMarkdownTable = (lines: string[], keyPrefix: string) => {
    const tableRows = lines.filter(line => !line.match(/^[|\-\s:]+$/) && line.includes('|'));
    
    if (tableRows.length < 2) return null;

    const headers = tableRows[0].split('|').filter(cell => cell.trim() !== '').map(c => c.trim());
    const dataRows = tableRows.slice(1).map(row => 
        row.split('|').filter(cell => cell.trim() !== '').map(c => c.trim())
    );

    return (
        <div key={`${keyPrefix}-table`} className="my-6 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/50">
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-[10px] text-left">
                    <thead className="bg-zinc-900/80">
                        <tr>
                            {headers.map((header, idx) => (
                                <th key={idx} className="px-4 py-3 font-black text-zinc-500 uppercase tracking-widest whitespace-nowrap border-b border-zinc-800">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900">
                        {dataRows.map((row, rowIdx) => (
                            <tr key={rowIdx} className="hover:bg-amber-500/[0.02] transition-colors">
                                {row.map((cell, cellIdx) => (
                                    <td key={cellIdx} className="px-4 py-3 text-zinc-300 font-medium whitespace-nowrap tabular-nums">
                                        {cell}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const renderBold = (text: string, key: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return (
        <span key={key}>
            {parts.map((part, index) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={index} className="text-amber-500 font-black">{part.slice(2, -2)}</strong>;
                }
                return part;
            })}
        </span>
    );
};

const renderModelContent = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let tableBuffer: string[] = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line.startsWith('|') && (line.endsWith('|') || line.split('|').length > 1)) {
            tableBuffer.push(line);
        } else {
            if (tableBuffer.length > 0) {
                elements.push(renderMarkdownTable(tableBuffer, `table-${i}`));
                tableBuffer = [];
            }
            
            if (line !== '') {
                elements.push(
                    <div key={`p-${i}`} className="mb-3 last:mb-0 leading-relaxed text-zinc-300">
                        {renderBold(line, `bold-${i}`)}
                    </div>
                );
            }
        }
    }

    if (tableBuffer.length > 0) {
        elements.push(renderMarkdownTable(tableBuffer, `table-end`));
    }

    return elements;
};

export const ChatInterface: React.FC<ChatInterfaceProps> = memo(({ messages, isReplying, onSendMessage, oddsFormat, pickSlip, onTogglePick, onSearchPlayer }) => {
    const [text, setText] = useState('');
    const [selectedImage, setSelectedImage] = useState<{ data: string, mimeType: string } | null>(null);
    const endOfMessagesRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (text.trim() || selectedImage) {
            onSendMessage(text.trim(), selectedImage || undefined);
            setText('');
            setSelectedImage(null);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64 = (event.target?.result as string).split(',')[1];
                setSelectedImage({ data: base64, mimeType: file.type });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="bg-zinc-950/90 backdrop-blur-3xl rounded-[3rem] shadow-2xl border-2 border-zinc-800 flex flex-col h-[75vh] max-h-[800px] overflow-hidden tactical-outline">
           <div className="px-8 py-5 border-b border-zinc-900 bg-black/40 flex items-center justify-between relative overflow-hidden">
                <div className="absolute inset-0 bg-amber-500/5 scanline-sweep opacity-30"></div>
                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_green]"></div>
                    <span className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.5em]">NEURAL COMMAND STREAM</span>
                </div>
                <div className="flex items-center gap-3 relative z-10">
                    <span className="text-[9px] font-black text-amber-500/50 uppercase tracking-widest border border-amber-500/20 px-3 py-1 rounded-lg">80% LOCK STABLE</span>
                </div>
           </div>

           <div className="flex-grow p-8 overflow-y-auto space-y-10 custom-scrollbar relative" aria-live="polite">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                        <LogoIcon className="w-20 h-20 mb-6 text-zinc-800 animate-pulse" />
                        <p className="text-[11px] font-black uppercase tracking-[0.8em] text-zinc-700">Awaiting Signal Command</p>
                    </div>
                )}
                
                {messages.map((msg, index) => (
                    <div key={index} className={`flex gap-6 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && (
                            <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border-2 border-amber-500/30 shadow-xl">
                                <LogoIcon className="w-7 h-7 text-amber-500" />
                            </div>
                        )}

                        <div className={`w-full ${msg.role === 'user' ? 'max-w-md' : 'max-w-2xl'}`}>
                            {msg.imageData && (
                                <div className="mb-4 rounded-[2rem] overflow-hidden border-2 border-zinc-800 max-w-xs ml-auto shadow-2xl relative group">
                                    <div className="bg-zinc-900 px-4 py-2 flex items-center gap-3 border-b-2 border-zinc-800">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_orange]"></div>
                                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Neural Vision Scrutiny</span>
                                    </div>
                                    <div className="relative">
                                        <img src={`data:image/png;base64,${msg.imageData}`} alt="Analysis Slip" className="w-full h-auto opacity-70 group-hover:opacity-100 transition-opacity" />
                                        <div className="absolute inset-0 bg-amber-500/5 scanline-sweep pointer-events-none"></div>
                                    </div>
                                </div>
                            )}
                            {typeof msg.content === 'object' ? (
                                <PredictionDisplay 
                                    prediction={msg.content} 
                                    oddsFormat={oddsFormat} 
                                    pickSlip={pickSlip}
                                    onTogglePick={onTogglePick}
                                    onSearchPlayer={onSearchPlayer}
                                />
                            ) : (
                                <div className={`px-7 py-6 rounded-[2.5rem] tactical-outline ${
                                    msg.role === 'user' 
                                        ? 'bg-zinc-100 text-black font-bold ml-auto shadow-[0_10px_40px_rgba(0,0,0,0.5)]' 
                                        : 'bg-zinc-900/40 text-zinc-200 border-2 border-zinc-800 backdrop-blur-sm'
                                }`}>
                                    {msg.role === 'model' ? (
                                        <div className="text-[14px] leading-relaxed">{renderModelContent(msg.content)}</div>
                                    ) : (
                                        <p className="whitespace-pre-wrap text-[14px] leading-relaxed italic">{msg.content}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                 {isReplying && (
                    <div className="flex gap-6 justify-start animate-fade-in" role="status">
                        <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border-2 border-amber-500/30">
                             <LogoIcon className="w-7 h-7 text-amber-500 animate-pulse" />
                        </div>
                        <div className="px-7 py-5 rounded-[2rem] bg-zinc-900/40 border-2 border-zinc-800 backdrop-blur-sm">
                            <div className="flex items-center gap-3">
                                <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-bounce"></span>
                                <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em] ml-4 italic">Neural Mapping Active...</span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={endOfMessagesRef} />
           </div>

           <div className="p-8 border-t-2 border-zinc-900 bg-black/40 backdrop-blur-3xl">
                {selectedImage && (
                    <div className="mb-6 relative inline-block group animate-fade-in">
                        <div className="bg-zinc-950 p-3 rounded-[2rem] border-2 border-amber-500/40 shadow-[0_0_40px_rgba(245,158,11,0.2)] flex items-center gap-6 relative overflow-hidden">
                            <div className="absolute inset-0 bg-amber-500/5 scanline-sweep"></div>
                            <img 
                                src={`data:image/png;base64,${selectedImage.data}`} 
                                className="w-20 h-20 object-cover rounded-2xl border-2 border-white/10 opacity-80 z-10" 
                            />
                            <div className="flex flex-col pr-12 z-10">
                                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Neural Vision Staged</span>
                                <span className="text-[12px] text-zinc-400 font-bold uppercase tracking-tight">Ready for Scrutiny Pulse</span>
                            </div>
                            <button 
                                onClick={() => setSelectedImage(null)}
                                className="absolute top-2 right-2 bg-zinc-900 text-zinc-500 hover:text-white rounded-full p-2 border-2 border-zinc-800 transition-all z-20"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="flex items-center gap-4">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="image/*" 
                        className="hidden" 
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-zinc-900/60 text-zinc-500 rounded-3xl p-5 hover:text-amber-500 border-2 border-zinc-800 hover:border-amber-500/40 transition-all group active:scale-95"
                        title="Upload Pick Screenshot"
                    >
                        <ImageIcon className="w-7 h-7 group-hover:scale-110 transition-transform" />
                    </button>
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder={selectedImage ? "Neural instructions..." : "Ask the engine or upload a slip..."}
                        disabled={isReplying}
                        className="w-full bg-zinc-900/40 border-2 border-zinc-800 rounded-[2.5rem] px-8 py-5 text-[15px] text-white focus:outline-none focus:border-amber-500/50 transition-all disabled:opacity-50 placeholder:text-zinc-700"
                    />
                    <button
                        type="submit"
                        disabled={isReplying || (!text.trim() && !selectedImage)}
                        className="bg-amber-500 text-black rounded-3xl p-5 hover:bg-amber-400 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed transition-all shadow-xl shadow-amber-500/20 active:scale-95"
                        aria-label="Initiate Pulse"
                    >
                        <SendIcon className="w-7 h-7" />
                    </button>
                </form>
            </div>
        </div>
    );
});
