"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Plus, X, Settings, Maximize2, Minimize2, Wind, PictureInPicture } from "lucide-react";
import { createPortal } from "react-dom";
import { FlipDigit } from "./FlipDigit";
import { useAppStore } from "@/hooks/useStore";
import { useFullscreen } from "@/hooks/useFullscreen";
import { useWidgetStore } from "@/features/widgets/stores/useWidgetStore";
import { useSceneStore } from "@/features/immersion/hooks/useSceneStore";
import { useHaptics } from "@/hooks/useHaptics";
import { useWakeLock } from "@/hooks/useWakeLock";
import { useDocumentPiP } from "@/hooks/useDocumentPiP";

interface InteractiveTimerProps {
    onComplete: (actualMins: number) => void;
    onCancel: (actualMins: number) => void;
    onStatusChange?: (status: 'focusing' | 'paused' | 'idle') => void;
}

export const InteractiveTimer = ({
    onComplete,
    onCancel,
    onStatusChange,
}: InteractiveTimerProps) => {
    const {
        pomodoroSettings,
        setPomodoroSettings,
        currentPomodoroSession,
        timerState,
        setTimerState
    } = useAppStore();

    const {
        duration,
        secondsRemaining,
        isActive,
        isStarted,
        endTime,
        mode
    } = timerState;

    const { isFullscreen, enterFullscreen, exitFullscreen } = useFullscreen();
    const { isZenMode, toggleZenMode } = useWidgetStore();
    const { isDucking, setDucking } = useSceneStore();
    const { lightTap, solidTap, successDoubleTap } = useHaptics();
    const { requestLock, releaseLock } = useWakeLock();
    const { isSupported: isPipSupported, pipWindow, requestPiP, closePiP } = useDocumentPiP();

    const [showSettings, setShowSettings] = useState(false);
    const [customSettings, setCustomSettings] = useState(pomodoroSettings);

    // Controls visibility state for "Zen" feel
    const [showControls, setShowControls] = useState(true);

    // endTimeRef is no longer needed as endTime is now part of timerState
    // const endTimeRef = useRef<number | null>(null);

    useEffect(() => {
        if ("Notification" in window && Notification.permission !== "granted") {
            Notification.requestPermission();
        }
    }, []);

    // Fix: Sync timer on mount
    useEffect(() => {
        if (isStarted && isActive && endTime) {
            const now = Date.now();
            const remaining = Math.ceil((endTime - now) / 1000);

            // Only trigger completion if we were actually far into the timer
            // or if the remaining time is clearly zero. Use a small buffer to avoid race conditions.
            if (remaining <= -1) {
                handleComplete();
            } else {
                setTimerState({ secondsRemaining: Math.max(0, remaining) });
            }
        }
    }, []); // Run once on mount

    const duckingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const playSound = useCallback((type: 'startFocus' | 'startBreak' | 'end') => {
        const sounds = {
            startFocus: "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3",
            startBreak: "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3",
            end: "https://assets.mixkit.co/active_storage/sfx/995/995-preview.mp3" // Clear digital alarm
        };
        const audio = new Audio(sounds[type]);
        audio.volume = 0.5;

        // Clear any existing timeout
        if (duckingTimeoutRef.current) clearTimeout(duckingTimeoutRef.current);

        setDucking(true);
        audio.play().catch(e => console.log("Audio play failed:", e));

        // Browsers frequently drop `audio.onended` if the tab is backgrounded.
        // A hard timeout is vastly more reliable for visual state cleanup.
        // Mixkit chimes used here are all ~2.5 - 3.5 seconds long.
        duckingTimeoutRef.current = setTimeout(() => {
            setDucking(false);
        }, 4000);

        audio.onended = () => {
            if (duckingTimeoutRef.current) clearTimeout(duckingTimeoutRef.current);
            setDucking(false);
        };
    }, [setDucking]);

    // Automatically play start sounds when isStarted flips to true
    const prevIsStarted = useRef(isStarted);
    useEffect(() => {
        if (isStarted && !prevIsStarted.current) {
            playSound(mode === 'pomodoro' ? 'startFocus' : 'startBreak');
        }
        prevIsStarted.current = isStarted;
    }, [isStarted, mode, playSound]);

    const handleComplete = useCallback(() => {
        successDoubleTap();
        releaseLock();
        if (isZenMode) {
            toggleZenMode();
            exitFullscreen();
        }
        setTimerState({
            isActive: false,
            isStarted: false,
            secondsRemaining: 0,
            endTime: null
        });
        onStatusChange?.('idle');
        // Fix #8: session count is managed globally in page.tsx/store, not locally here

        playSound('end');
        if (Notification.permission === "granted") {
            new Notification("Aura Focus", {
                body: "Session Complete! Time to reflect.",
                icon: "/favicon.ico"
            });
        }

        onComplete(duration);
    }, [duration, onComplete, onStatusChange, isZenMode, toggleZenMode, exitFullscreen]);

    const handleCancel = () => {
        releaseLock();
        if (isZenMode) {
            toggleZenMode();
            exitFullscreen();
        }
        setTimerState({ isStarted: false });
        onStatusChange?.('idle');
        // Bug fix #4: use `duration` (user-selected) not `initialMinutes` (prop default)
        const elapsedMinutes = (duration * 60 - secondsRemaining) / 60;
        onCancel(Math.max(0, elapsedMinutes));
    };

    // Fix #19: Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            if (e.code === 'Space' && isStarted) {
                e.preventDefault();
                lightTap();
                const newActive = !isActive;
                setTimerState({
                    isActive: newActive,
                    endTime: newActive ? Date.now() + secondsRemaining * 1000 : null
                });
                if (newActive) requestLock();
                else releaseLock();
                onStatusChange?.(newActive ? 'focusing' : 'paused');
            }
            if (e.code === 'Escape' && isStarted) {
                e.preventDefault();
                handleCancel();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isStarted, isActive, secondsRemaining, handleCancel, setTimerState, onStatusChange]);

    // Timer Logic - Refactored for Stability
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isActive && isStarted && endTime) {
            interval = setInterval(() => {
                const now = Date.now();
                const diff = endTime - now;
                const remaining = Math.max(0, Math.ceil(diff / 1000));

                if (remaining <= 0) {
                    handleComplete();
                    clearInterval(interval);
                } else if (remaining !== secondsRemaining) {
                    // Only update if the second has actually changed to save renders
                    setTimerState({ secondsRemaining: remaining });
                }
            }, 100); // Check frequently for accuracy
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive, isStarted, endTime, handleComplete, setTimerState]);

    // Format Logic
    const mins = Math.floor(secondsRemaining / 60);
    const secs = secondsRemaining % 60;

    // Digits for Flip Clock
    const m1 = Math.floor(mins / 10);
    const m2 = mins % 10;
    const s1 = Math.floor(secs / 10);
    const s2 = secs % 10;

    const progress = Math.max(0, Math.min(1, 1 - secondsRemaining / (duration * 60)));

    return (
        <div className="flex flex-col items-center justify-center w-full min-h-[40vh] sm:min-h-[60vh] relative">
            {/* Audio Ducking Visual Feedback */}
            <AnimatePresence>
                {isDucking && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/20 backdrop-blur-[1px] z-40 pointer-events-none flex flex-col items-center justify-center"
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: [0.9, 1, 0.9] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="bg-white/10 px-6 py-2 rounded-full border border-white/20 shadow-2xl"
                        >
                            <span className="text-xs font-bold text-white tracking-[0.3em] uppercase">Transitioning...</span>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* TABS ALWAYS VISIBLE */}
            {!isZenMode && (
                <div className="flex bg-white/10 rounded-full p-1 w-fit mx-auto relative mb-8 z-50">
                    {[
                        { id: 'pomodoro', label: 'Pomodoro', mins: pomodoroSettings.focusLength },
                        { id: 'shortBreak', label: 'Short Break', mins: pomodoroSettings.shortBreakLength },
                        { id: 'longBreak', label: 'Long Break', mins: pomodoroSettings.longBreakLength }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                lightTap();
                                setTimerState({
                                    mode: tab.id as any,
                                    duration: tab.mins,
                                    secondsRemaining: tab.mins * 60,
                                    isStarted: false,
                                    isActive: false,
                                    endTime: null
                                });
                                onStatusChange?.('idle');
                            }}
                            className={`relative px-6 py-2 rounded-full text-sm font-bold transition-colors z-10 ${mode === tab.id ? 'text-black' : 'text-white/60 hover:text-white'
                                }`}
                        >
                            {mode === tab.id && (
                                <motion.div
                                    layoutId="activeTimerTab"
                                    className="absolute inset-0 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className="relative z-20">{tab.label}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* CUSTOM SETTINGS TOGGLE (ALWAYS VISIBLE UNLESS ZEN MODE) - Moved to flow to prevent clipping */}
            {!isZenMode && (
                <div className="flex justify-end w-full mb-4 px-4 relative z-50">
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="text-white/40 hover:text-white transition-colors cursor-pointer p-3 bg-black/40 hover:bg-black/60 rounded-full backdrop-blur-md border border-white/10 shadow-lg"
                        title="Pomodoro Settings"
                    >
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* CUSTOM POMODORO SETTINGS PANEL (GLOBALLY RENDERED) */}
            <AnimatePresence>
                {showSettings && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, y: -20 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -20 }}
                        className="overflow-hidden w-full max-w-sm absolute top-40 z-[60] shadow-2xl"
                    >
                        <div className="bg-black/90 backdrop-blur-3xl border border-white/10 rounded-2xl p-4 sm:p-6 text-left space-y-4 shadow-[0_0_50px_rgba(0,0,0,0.8)] max-h-[80vh] overflow-y-auto w-[calc(100vw-2rem)] sm:w-full">
                            <div className="flex justify-between items-center pb-2 border-b border-white/5">
                                <h3 className="text-white font-bold tracking-wide">Custom Pomodoro</h3>
                                <X className="w-4 h-4 text-white/40 cursor-pointer hover:text-white" onClick={() => setShowSettings(false)} />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] uppercase tracking-wider text-white/50 block mb-1">Focus (min)</label>
                                    <input type="number" value={customSettings.focusLength} onChange={(e) => setCustomSettings({ ...customSettings, focusLength: parseInt(e.target.value) || 25 })} className="w-full bg-white/5 border border-white/10 rounded-md p-2 text-white focus:outline-none focus:border-accent" />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-wider text-white/50 block mb-1">Short Break (min)</label>
                                    <input type="number" value={customSettings.shortBreakLength} onChange={(e) => setCustomSettings({ ...customSettings, shortBreakLength: parseInt(e.target.value) || 5 })} className="w-full bg-white/5 border border-white/10 rounded-md p-2 text-white focus:outline-none focus:border-accent" />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-wider text-white/50 block mb-1">Long Break (min)</label>
                                    <input type="number" value={customSettings.longBreakLength} onChange={(e) => setCustomSettings({ ...customSettings, longBreakLength: parseInt(e.target.value) || 15 })} className="w-full bg-white/5 border border-white/10 rounded-md p-2 text-white focus:outline-none focus:border-accent" />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-wider text-white/50 block mb-1">Rounds before Long</label>
                                    <input type="number" value={customSettings.sessionsBeforeLongBreak} onChange={(e) => setCustomSettings({ ...customSettings, sessionsBeforeLongBreak: parseInt(e.target.value) || 4 })} className="w-full bg-white/5 border border-white/10 rounded-md p-2 text-white focus:outline-none focus:border-accent" />
                                </div>
                            </div>
                            <div className="space-y-3 pt-2">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`w-10 h-6 rounded-full p-1 transition-colors ${customSettings.autoStartBreak ? 'bg-accent' : 'bg-white/10'}`} onClick={() => setCustomSettings({ ...customSettings, autoStartBreak: !customSettings.autoStartBreak })}>
                                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${customSettings.autoStartBreak ? 'translate-x-4' : 'translate-x-0'}`} />
                                    </div>
                                    <span className="text-xs text-white/60 group-hover:text-white transition-colors">Auto-start Break</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`w-10 h-6 rounded-full p-1 transition-colors ${customSettings.autoStartFocus ? 'bg-accent' : 'bg-white/10'}`} onClick={() => setCustomSettings({ ...customSettings, autoStartFocus: !customSettings.autoStartFocus })}>
                                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${customSettings.autoStartFocus ? 'translate-x-4' : 'translate-x-0'}`} />
                                    </div>
                                    <span className="text-xs text-white/60 group-hover:text-white transition-colors">Auto-start Focus</span>
                                </label>
                            </div>
                            <button
                                onClick={() => {
                                    setPomodoroSettings(customSettings);
                                    setShowSettings(false);
                                    // Auto-select the newly configured length
                                    const newDuration = mode === 'pomodoro' ? customSettings.focusLength : mode === 'shortBreak' ? customSettings.shortBreakLength : customSettings.longBreakLength;
                                    setTimerState({
                                        duration: newDuration,
                                        secondsRemaining: newDuration * 60
                                    });
                                }}
                                className="w-full py-2 bg-accent/20 text-accent font-bold rounded-md hover:bg-accent hover:text-black transition-colors"
                            >
                                Save Custom Rules
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {!isStarted ? (
                // PRE-START SELECTION VIEW
                <div className="w-full max-w-2xl space-y-12 text-center animate-in fade-in slide-in-from-bottom-8 duration-700 relative">

                    <div className="space-y-4">
                        <h2 className="text-6xl md:text-8xl font-bold tracking-tighter text-white font-mono">{String(duration).padStart(2, '0')}:00</h2>
                        <p className="text-white/40 font-mono text-xs uppercase tracking-[0.3em]">{mode === 'pomodoro' ? 'Focus Session' : mode === 'shortBreak' ? 'Short Break' : 'Long Break'}</p>
                    </div>

                    <div className="flex flex-col items-center gap-6 mt-8 mb-8">
                        <button
                            onClick={() => {
                                solidTap();
                                requestLock();
                                const initialSeconds = duration * 60;
                                setTimerState({
                                    isStarted: true,
                                    isActive: true,
                                    secondsRemaining: initialSeconds,
                                    endTime: Date.now() + initialSeconds * 1000
                                });
                                onStatusChange?.('focusing');
                            }}
                            className="group relative px-12 py-4 bg-accent text-black rounded-full font-bold text-lg tracking-wider hover:bg-accent/90 transition-all shadow-[0_0_20px_rgba(var(--accent-rgb),0.5)] z-10"
                        >
                            <span className="flex items-center gap-2">
                                <Play className="w-5 h-5 fill-current" /> {mode === 'pomodoro' ? 'START FOCUS' : 'START BREAK'}
                            </span>
                        </button>
                    </div>

                    <div className="flex flex-wrap justify-center gap-3 sm:gap-4 px-2">
                        {mode === 'pomodoro' && [15, 25, 45, 60].map((preset) => (
                            <button
                                key={preset}
                                onClick={() => {
                                    lightTap();
                                    setTimerState({
                                        duration: preset,
                                        secondsRemaining: preset * 60
                                    });
                                }}
                                className={`px-4 sm:px-8 py-3 sm:py-4 rounded-2xl border transition-all duration-300 w-[calc(50%-0.5rem)] sm:w-auto ${duration === preset
                                    ? 'bg-white text-black border-white shadow-[0_0_30px_rgba(255,255,255,0.3)]'
                                    : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                <span className="text-xl sm:text-2xl font-bold font-mono block">{preset}</span>
                                <span className="text-[10px] uppercase tracking-wider font-bold opacity-60">MIN</span>
                            </button>
                        ))}
                    </div>

                </div>
            ) : (
                // ACTIVE TIMER VIEW (FLIP CLOCK STYLE)
                <div
                    className="relative flex flex-col items-center gap-16"
                    onMouseEnter={() => setShowControls(true)}
                    onMouseLeave={() => isActive && setShowControls(false)}
                >
                    {/* MINDFUL PROMPT (Break Mode Only) */}
                    <AnimatePresence>
                        {mode !== 'pomodoro' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute -top-16 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-accent/20 border border-accent/20 px-6 py-3 rounded-2xl backdrop-blur-xl z-[60] min-w-max"
                            >
                                <Wind className="w-5 h-5 text-accent animate-pulse" />
                                <span className="text-sm font-bold text-accent tracking-[.2em] uppercase">Take a Breath</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {/* TIMER DISPLAY */}
                    <div className={`transition-all duration-1000 opacity-100 ${isZenMode ? 'mt-8' : 'mt-0 sm:mt-2 md:mt-8'} mb-4`}>
                        <div className={`flex flex-row items-center justify-center gap-2 sm:gap-4 md:gap-8 mb-4 md:mb-8`}>
                            {/* MINUTES GROUP */}
                            <div className="flex flex-col items-center gap-2 md:gap-4">
                                <div className="flex gap-1 sm:gap-2 scale-90 sm:scale-100">
                                    <FlipDigit digit={m1} />
                                    <FlipDigit digit={m2} />
                                </div>
                                <span className="text-[10px] md:text-sm font-bold text-white/60 tracking-[0.5em] md:tracking-[0.5em] uppercase font-mono hidden md:block">
                                    Minutes
                                </span>
                            </div>

                            {/* SEPARATOR - Dots always for sideways view */}
                            <div className={`flex-col gap-2 md:gap-3 pb-2 md:pb-8 opacity-70 flex`}>
                                <div className="w-1.5 h-1.5 md:w-3 md:h-3 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                                <div className="w-1.5 h-1.5 md:w-3 md:h-3 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                            </div>

                            {/* SECONDS GROUP */}
                            <div className="flex flex-col items-center gap-2 md:gap-4">
                                <div className="flex gap-2">
                                    <FlipDigit digit={s1} />
                                    <FlipDigit digit={s2} />
                                </div>
                                <span className="text-[10px] md:text-sm font-bold text-white/60 tracking-[0.5em] md:tracking-[0.5em] uppercase font-mono hidden md:block">
                                    Seconds
                                </span>
                            </div>
                        </div>

                        {/* SESSION INDICATOR */}
                        {/* Fix #7: count uses store setting; #8: uses global session counter */}
                        <div className="flex items-center justify-center gap-3 opacity-60 hover:opacity-100 transition-opacity">
                            <span className="text-[10px] font-bold tracking-widest text-white/70 uppercase mr-2">Session</span>
                            {[...Array(pomodoroSettings.sessionsBeforeLongBreak)].map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-2 h-2 rounded-full transition-all ${i < ((currentPomodoroSession - 1) % pomodoroSettings.sessionsBeforeLongBreak)
                                        ? 'bg-accent shadow-[0_0_8px_rgba(var(--accent-rgb),0.5)]'
                                        : 'bg-white/30'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* FLOATING CONTROLS (Pill) */}
                    <AnimatePresence>
                        {/* Always show controls on sm screens (mobile) or if hovered on desktop */}
                        {(showControls || (typeof window !== 'undefined' && window.innerWidth < 640)) && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="flex items-center gap-2 sm:gap-4 bg-[#1a1a1a]/90 backdrop-blur-xl border border-white/10 p-2 sm:p-2 rounded-full shadow-2xl z-50 mb-12 sm:mb-0 scale-90 sm:scale-100"
                            >
                                <button
                                    onClick={() => {
                                        lightTap();
                                        // Bug fix #3: update all three — state, countdown, and wall-clock ref
                                        const addSecs = 5 * 60;
                                        setTimerState({
                                            duration: duration + 5,
                                            secondsRemaining: secondsRemaining + addSecs,
                                            endTime: isActive && endTime ? endTime + addSecs * 1000 : endTime
                                        });
                                    }}
                                    className="p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                                    title="+5 Minutes"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>

                                <div className="w-[1px] h-6 bg-white/10" />

                                <button
                                    onClick={() => {
                                        lightTap();
                                        const newActive = !isActive;
                                        setTimerState({
                                            isActive: newActive,
                                            endTime: newActive ? Date.now() + secondsRemaining * 1000 : null
                                        });
                                        if (newActive) requestLock();
                                        else releaseLock();
                                        onStatusChange?.(newActive ? 'focusing' : 'paused');
                                    }}
                                    className={`p-4 rounded-full transition-all ${isActive
                                        ? 'bg-white/10 text-white hover:bg-white/20'
                                        : 'bg-accent text-black hover:bg-accent/90'}`}
                                >
                                    {isActive ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                                </button>

                                <button
                                    onClick={() => {
                                        toggleZenMode();
                                        if (isZenMode) exitFullscreen();
                                        else enterFullscreen();
                                    }}
                                    className={`p-3 rounded-full transition-colors ${isZenMode ? 'text-accent bg-accent/10' : 'text-white/30 hover:text-white hover:bg-white/10'}`}
                                    title={isZenMode ? "Exit Fullscreen" : "Enter Fullscreen"}
                                >
                                    {isZenMode ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                                </button>

                                {isPipSupported && (
                                    <button
                                        onClick={() => {
                                            if (pipWindow) closePiP();
                                            else requestPiP({ width: 340, height: 180 });
                                        }}
                                        className={`p-3 rounded-full transition-colors ${pipWindow ? 'text-accent bg-accent/10' : 'text-white/30 hover:text-white hover:bg-white/10'}`}
                                        title={pipWindow ? "Close PiP" : "Pop Out Timer"}
                                    >
                                        <PictureInPicture className="w-5 h-5" />
                                    </button>
                                )}

                                <div className="w-[1px] h-6 bg-white/10" />

                                <button
                                    onClick={handleCancel}
                                    className="p-3 text-white/50 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
                                    title="End Session"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                                {mode !== 'pomodoro' && (
                                    <>
                                        <div className="w-[1px] h-6 bg-white/10" />
                                        <button
                                            onClick={() => onComplete(duration)}
                                            className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-black bg-white rounded-full hover:bg-white/80 transition-colors"
                                            title="Skip Break"
                                        >
                                            Skip Break
                                        </button>
                                    </>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* MINIMALIST PROGRESS BAR (Bottom) */}
                    <div className="fixed bottom-0 left-0 right-0 h-1 bg-white/5 z-50">
                        <motion.div
                            className="h-full bg-accent shadow-[0_0_20px_rgba(var(--accent-rgb),0.6)]"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress * 100}%` }}
                            transition={{ duration: 1, ease: "linear" }}
                        />
                    </div>
                </div>
            )}

            {/* PICTURE-IN-PICTURE RENDERER */}
            {pipWindow && createPortal(
                <div className="flex flex-col items-center justify-center h-full w-full bg-[#0a0a0a] text-white select-none">
                    <div className="flex items-center gap-2 mb-4 scale-75 origin-bottom">
                        <FlipDigit digit={m1} />
                        <FlipDigit digit={m2} />
                        <span className="text-4xl opacity-50 font-mono">:</span>
                        <FlipDigit digit={s1} />
                        <FlipDigit digit={s2} />
                    </div>
                    <button
                        onClick={() => {
                            const newActive = !isActive;
                            setTimerState({
                                isActive: newActive,
                                endTime: newActive ? Date.now() + secondsRemaining * 1000 : null
                            });
                            if (newActive) requestLock();
                            else releaseLock();
                        }}
                        className={`p-3 rounded-full transition-all ${isActive ? 'bg-white/10 text-white' : 'bg-[#e5ff45] text-black'} outline-none`}
                    >
                        {isActive ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                    </button>
                </div>,
                pipWindow.document.body
            )}
        </div>
    );
};
