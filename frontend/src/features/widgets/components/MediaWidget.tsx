"use client";

import { useWidgetStore } from "@/features/widgets/stores/useWidgetStore";
import { Music, ListMusic, Minimize2, Maximize2, Link as LinkIcon, Plus, Youtube } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { DraggableWidgetWrapper } from "./DraggableWidgetWrapper";
import { useSceneStore } from "@/features/immersion/hooks/useSceneStore";

import { useMediaStore, PLAYLISTS } from "../stores/useMediaStore";

// Helper to extract YouTube Video ID from various link formats
const extractVideoID = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/gi;
    const match = regex.exec(url);
    return match ? match[1] : null;
};

export const MediaWidget = () => {
    const { activeWidgets, toggleWidget } = useWidgetStore();
    const { isDucking } = useSceneStore();
    const isOpen = activeWidgets.includes("media");
    const { currentStation, setCurrentStation } = useMediaStore();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMini, setIsMini] = useState(false);
    const [customUrl, setCustomUrl] = useState("");
    const [isAddingCustom, setIsAddingCustom] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const playerRef = useRef<any>(null);

    useEffect(() => {
        setIsMounted(true);

        // Load YouTube Iframe API
        if (!(window as any).YT) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
        }

        return () => {
            if (playerRef.current) {
                playerRef.current.destroy();
            }
        };
    }, []);

    // Effect to handle volume ducking
    useEffect(() => {
        if (playerRef.current && playerRef.current.setVolume) {
            const targetVolume = isDucking ? 20 : 100;
            playerRef.current.setVolume(targetVolume);
        }
    }, [isDucking]);

    useEffect(() => {
        if (!isOpen || !isMounted) {
            if (playerRef.current) {
                try {
                    playerRef.current.destroy();
                } catch (e) { }
                playerRef.current = null;
            }
            return;
        }

        const videoId = extractVideoID(currentStation.url);
        if (!videoId) return;

        let pollInterval: NodeJS.Timeout;

        const onPlayerReady = (event: any) => {
            playerRef.current = event.target;
            event.target.playVideo();
            event.target.setVolume(isDucking ? 20 : 100);
        };

        const initPlayer = () => {
            if ((window as any).YT && (window as any).YT.Player) {
                clearInterval(pollInterval);
                if (!document.getElementById('youtube-player')) return;

                if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
                    try {
                        playerRef.current.loadVideoById(videoId);
                    } catch (e) {
                        console.error("[MediaWidget] Error loading video in existing player:", e);
                    }
                } else {
                    try {
                        playerRef.current = new (window as any).YT.Player('youtube-player', {
                            height: '100%',
                            width: '100%',
                            videoId: videoId,
                            playerVars: {
                                autoplay: 1,
                                mute: 0,
                                controls: 1,
                                showinfo: 0,
                                rel: 0,
                                loop: 1,
                                playlist: videoId,
                                origin: window.location.origin
                            },
                            events: {
                                onReady: onPlayerReady,
                                onError: (e: any) => console.error("[MediaWidget] YT Player Error:", e)
                            }
                        });
                    } catch (e) {
                        console.error("[MediaWidget] Exception creating YT.Player:", e);
                    }
                }
            }
        };

        pollInterval = setInterval(initPlayer, 500);
        initPlayer();

        return () => {
            clearInterval(pollInterval);
        };
    }, [currentStation.url, isOpen, isMounted]);

    if (!isOpen || !isMounted) return null;

    const handleAddCustom = (e: React.FormEvent) => {
        e.preventDefault();
        const videoId = extractVideoID(customUrl);
        if (videoId) {
            setCurrentStation({
                id: `custom-${videoId}`,
                name: 'Custom Video',
                url: `https://www.youtube.com/watch?v=${videoId}`
            });
            setCustomUrl("");
            setIsAddingCustom(false);
            setIsMenuOpen(false);
        } else {
            alert("Invalid YouTube URL");
        }
    };

    return (
        <DraggableWidgetWrapper
            id="media"
            title="Media Player"
            icon={<Music className="w-4 h-4 text-accent" />}
            onClose={() => toggleWidget("media")}
            defaultPosition={{ x: 0, y: 0 }}
            isMini={isMini}
            headerActions={
                <>
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className={`p-1.5 rounded-full transition-colors ${isMenuOpen ? 'bg-accent text-black' : 'hover:bg-white/10 text-white/40'}`}
                        title="Library"
                    >
                        <ListMusic className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setIsMini(true)}
                        className="p-1.5 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-colors ml-1"
                        title="Mini Player"
                    >
                        <Minimize2 className="w-4 h-4" />
                    </button>
                </>
            }
        >
            <div className={`relative ${isMini ? 'aspect-video cursor-move' : 'aspect-video'} bg-black group/player`}>
                <div id="youtube-player" className="absolute inset-0 w-full h-full pointer-events-auto" />

                {/* Ducking Overlay (Visual Feedback) */}
                {isDucking && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-none flex items-center justify-center animate-pulse">
                        <div className="bg-white/10 px-3 py-1 rounded-full border border-white/20">
                            <span className="text-[10px] font-bold text-white tracking-widest uppercase">Audio Ducking</span>
                        </div>
                    </div>
                )}

                {/* Mini Player Overlay Controls */}
                {isMini && (
                    <div className="absolute inset-0 opacity-0 group-hover/player:opacity-100 transition-opacity bg-black/40 flex items-start justify-end p-2 pointer-events-none">
                        <button
                            onClick={() => setIsMini(false)}
                            className="p-1.5 bg-black/80 hover:bg-accent text-white hover:text-black rounded-full backdrop-blur transition-colors pointer-events-auto"
                            title="Expand"
                        >
                            <Maximize2 className="w-3 h-3" />
                        </button>
                    </div>
                )}

                {/* Playlist Selection Overlay */}
                <AnimatePresence>
                    {isMenuOpen && !isMini && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute inset-0 bg-black/95 backdrop-blur-xl z-20 p-4 flex flex-col gap-2 overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold uppercase tracking-widest text-white/50">Stations</span>
                                <button onClick={() => setIsAddingCustom(!isAddingCustom)} className={`p-1.5 rounded-full ${isAddingCustom ? 'bg-accent text-black' : 'hover:bg-white/10 text-white/50 hover:text-white'}`}>
                                    <LinkIcon className="w-3 h-3" />
                                </button>
                            </div>

                            {isAddingCustom && (
                                <form onSubmit={handleAddCustom} className="flex gap-2 mb-2 animate-in slide-in-from-top-2">
                                    <input
                                        type="text"
                                        placeholder="Paste YouTube Link..."
                                        value={customUrl}
                                        onChange={(e) => setCustomUrl(e.target.value)}
                                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-accent"
                                    />
                                    <button type="submit" className="bg-accent text-black px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-accent/90 shrink-0">
                                        Play
                                    </button>
                                </form>
                            )}

                            {PLAYLISTS.map(station => (
                                <button
                                    key={station.id}
                                    onClick={() => {
                                        setCurrentStation(station);
                                        setIsMenuOpen(false);
                                    }}
                                    className={`w-full text-left p-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-between group ${currentStation.id === station.id
                                        ? 'bg-accent/20 text-accent border border-accent/20'
                                        : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-transparent hover:border-white/10'
                                        }`}
                                >
                                    {station.name}
                                    {currentStation.id === station.id && <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shadow-[0_0_10px_rgba(var(--accent-rgb),0.5)]" />}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </DraggableWidgetWrapper>
    );
};
