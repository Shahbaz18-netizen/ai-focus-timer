
"use client";

import { useWidgetStore } from "@/features/widgets/stores/useWidgetStore";
import { useBackgroundStore } from "@/features/immersion/stores/useBackgroundStore";
import { SCENES } from "@/features/immersion/data/scenes";
import { Image as ImageIcon, Check, Link as LinkIcon } from "lucide-react";
import { DraggableWidgetWrapper } from "./DraggableWidgetWrapper";
import { useState } from "react";
import { motion } from "framer-motion";

// Helper to extract YouTube Video ID
const extractVideoID = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/gi;
    const match = regex.exec(url);
    return match ? match[1] : null;
};

export const SceneSelectorWidget = ({ defaultPosition, side = 'left' }: { defaultPosition?: { x: number, y: number }, side?: 'left' | 'right' | 'center' }) => {
    const { activeWidgets, toggleWidget } = useWidgetStore();
    const { currentScene, setScene, setCustomScene, blurLevel, setBlurLevel, brightness, setBrightness } = useBackgroundStore();
    const isOpen = activeWidgets.includes("scenes");
    const [isAddingCustom, setIsAddingCustom] = useState(false);
    const [customUrl, setCustomUrl] = useState("");

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
        <DraggableWidgetWrapper
            id="scenes"
            title="Environments"
            icon={<ImageIcon className="w-4 h-4 text-accent" />}
            onClose={() => toggleWidget("scenes")}
            defaultPosition={defaultPosition || { x: 0, y: 450 }}
            side={side}
            width="w-full sm:w-64"
            headerActions={
                <button
                    onClick={() => setIsAddingCustom(!isAddingCustom)}
                    className={`p-1.5 rounded-full transition-colors ${isAddingCustom ? 'bg-accent text-black' : 'hover:bg-panel-hover text-foreground/40 hover:text-foreground'}`}
                    title="Add Custom YouTube Video"
                >
                    <LinkIcon className="w-4 h-4" />
                </button>
            }
        >

            <div className="p-4 flex flex-col gap-5 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                {/* Custom URL Input */}
                {isAddingCustom && (
                    <form onSubmit={handleAddCustom} className="flex gap-2 animate-in slide-in-from-top-2">
                        <input
                            type="text"
                            placeholder="Paste YouTube Link..."
                            value={customUrl}
                            onChange={(e) => setCustomUrl(e.target.value)}
                            className="flex-1 bg-panel border border-border-subtle rounded-lg px-3 py-1.5 text-xs text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-accent"
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
                                : "border-border-subtle hover:border-white/30 hover:scale-[1.02]"
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
                                <span className={`text-[11px] font-bold uppercase tracking-wider shadow-black drop-shadow-md transition-colors ${currentScene.id === scene.id ? 'text-accent' : 'text-foreground'}`}>
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
                <div className="space-y-4 pt-4 border-t border-border-subtle mt-2">
                    <div className="space-y-2">
                        <div className="flex justify-between text-[10px] uppercase font-bold text-foreground/50 tracking-widest">
                            <span>Background Blur</span>
                            <span className="text-foreground">{blurLevel}px</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="20"
                            step="1"
                            value={blurLevel}
                            onChange={(e) => setBlurLevel(Number(e.target.value))}
                            className="w-full h-1.5 bg-panel-hover rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(var(--accent-rgb),0.5)]"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-[10px] uppercase font-bold text-foreground/50 tracking-widest">
                            <span>Background Dim</span>
                            <span className="text-foreground">{Math.round(brightness * 100)}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="0.9"
                            step="0.05"
                            value={brightness}
                            onChange={(e) => setBrightness(Number(e.target.value))}
                            className="w-full h-1.5 bg-panel-hover rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(var(--accent-rgb),0.5)]"
                        />
                    </div>
                </div>
            </div>
        </DraggableWidgetWrapper>
    );
};
