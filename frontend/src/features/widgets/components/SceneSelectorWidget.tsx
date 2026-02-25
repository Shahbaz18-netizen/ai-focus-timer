
"use client";

import { useWidgetStore } from "@/features/widgets/stores/useWidgetStore";
import { useBackgroundStore } from "@/features/immersion/stores/useBackgroundStore";
import { SCENES } from "@/features/immersion/data/scenes";
import { Image as ImageIcon, Check, Link as LinkIcon } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

// Helper to extract YouTube Video ID
const extractVideoID = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/gi;
    const match = regex.exec(url);
    return match ? match[1] : null;
};

export const SceneSelectorWidget = () => {
    const { activeWidgets, toggleWidget } = useWidgetStore();
    const { currentScene, setScene, setCustomScene, blurLevel, setBlurLevel, brightness, setBrightness } = useBackgroundStore();
    const isOpen = activeWidgets.includes("scenes");
    const [isAddingCustom, setIsAddingCustom] = useState(false);
    const [customUrl, setCustomUrl] = useState("");

    // Default to open if not specified? No, typical toggle.
    if (!isOpen) return null;

    const handleAddCustom = (e: React.FormEvent) => {
        e.preventDefault();
        const videoId = extractVideoID(customUrl);
        if (videoId) {
            setCustomScene(videoId);
            setCustomUrl("");
            setIsAddingCustom(false);
        } else {
            alert("Invalid YouTube URL");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 sm:bottom-24 right-4 sm:right-8 w-[calc(100vw-2rem)] sm:w-80 bg-[#121212]/95 backdrop-blur-3xl border border-white/20 xl:w-96 rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-hidden z-50 flex flex-col ring-1 ring-white/10 max-h-[80vh]"
        >
            <div className="flex items-center justify-between p-3 border-b border-white/5 bg-white/5 select-none text-white/50">
                <div className="flex items-center gap-2">
                    <span className="text-accent"><ImageIcon className="w-4 h-4" /></span>
                    <span className="text-xs font-bold uppercase tracking-widest text-white/50">
                        Environments
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsAddingCustom(!isAddingCustom)}
                        className={`p-1.5 rounded-full transition-colors ${isAddingCustom ? 'bg-accent text-black' : 'hover:bg-white/10 text-white/40 hover:text-white'}`}
                        title="Add Custom YouTube Video"
                    >
                        <LinkIcon className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => toggleWidget("scenes")}
                        className="p-1.5 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
            </div>

            <div className="p-4 flex flex-col gap-5 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                {/* Custom URL Input */}
                {isAddingCustom && (
                    <form onSubmit={handleAddCustom} className="flex gap-2 animate-in slide-in-from-top-2">
                        <input
                            type="text"
                            placeholder="Paste YouTube Link..."
                            value={customUrl}
                            onChange={(e) => setCustomUrl(e.target.value)}
                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-accent"
                        />
                        <button type="submit" className="bg-accent text-black px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-accent/90 shrink-0">
                            Apply
                        </button>
                    </form>
                )}

                {/* Scene List */}
                <div className="grid grid-cols-2 gap-3">
                    {SCENES.map((scene) => (
                        <button
                            key={scene.id}
                            onClick={() => setScene(scene.id)}
                            className={`relative aspect-video rounded-xl overflow-hidden border transition-all group ${currentScene.id === scene.id
                                ? "border-accent ring-2 ring-accent/50 scale-[1.02] shadow-xl"
                                : "border-white/10 hover:border-white/30 hover:scale-[1.02]"
                                }`}
                        >
                            {/* Simple Preview - Use Video thumbnail or color if image */}
                            <div className="absolute inset-0 bg-neutral-800">
                                {scene.type === 'video' ? (
                                    <video
                                        src={scene.url}
                                        className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                                        muted
                                        loop
                                        onMouseOver={(e) => e.currentTarget.play()}
                                        onMouseOut={(e) => e.currentTarget.pause()}
                                    />
                                ) : scene.type === 'youtube' ? (
                                    <img
                                        // Fallback to hqdefault if maxresdefault isn't available
                                        src={`https://img.youtube.com/vi/${scene.url}/maxresdefault.jpg`}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${scene.url}/hqdefault.jpg`;
                                        }}
                                        alt={scene.name}
                                        className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                                    />
                                ) : (
                                    <img
                                        src={scene.url}
                                        alt={scene.name}
                                        className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                                    />
                                )}
                            </div>

                            {/* Label */}
                            <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black via-black/80 to-transparent">
                                <span className={`text-[11px] font-bold uppercase tracking-wider shadow-black drop-shadow-md transition-colors ${currentScene.id === scene.id ? 'text-accent' : 'text-white'}`}>
                                    {scene.name}
                                </span>
                            </div>

                            {/* Active Indicator */}
                            {currentScene.id === scene.id && (
                                <div className="absolute top-2 right-2 bg-accent text-black rounded-full p-1 shadow-lg backdrop-blur-md">
                                    <Check className="w-3 h-3" strokeWidth={3} />
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Controls */}
                <div className="space-y-4 pt-4 border-t border-white/10 mt-2">
                    <div className="space-y-2">
                        <div className="flex justify-between text-[10px] uppercase font-bold text-white/50 tracking-widest">
                            <span>Background Blur</span>
                            <span className="text-white">{blurLevel}px</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="20"
                            step="1"
                            value={blurLevel}
                            onChange={(e) => setBlurLevel(Number(e.target.value))}
                            className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(var(--accent-rgb),0.5)]"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-[10px] uppercase font-bold text-white/50 tracking-widest">
                            <span>Background Dim</span>
                            <span className="text-white">{Math.round(brightness * 100)}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="0.9"
                            step="0.05"
                            value={brightness}
                            onChange={(e) => setBrightness(Number(e.target.value))}
                            className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(var(--accent-rgb),0.5)]"
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
