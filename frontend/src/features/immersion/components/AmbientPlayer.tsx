"use client";

import { useEffect, useRef } from "react";
import { useSceneStore, SOUND_STEMS } from "../hooks/useSceneStore";

export const AmbientPlayer = () => {
    const { audioEnabled, volumes, isDucking } = useSceneStore();
    const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
    const animationRefs = useRef<{ [key: string]: number }>({});

    useEffect(() => {
        Object.values(SOUND_STEMS).forEach((stem) => {
            const audio = audioRefs.current[stem.id];
            const targetBaseVolume = volumes[stem.id] || 0;

            if (audio) {
                // Determine the mathematically sound target volume (0.0 to 1.0)
                const duckMult = isDucking ? 0.2 : 1;
                const targetVolume = (audioEnabled && targetBaseVolume > 0)
                    ? (targetBaseVolume / 100) * duckMult
                    : 0;

                // If it needs to start playing, play it immediately before fading up
                if (targetVolume > 0 && audio.paused) {
                    audio.play().catch(e => console.warn(`Failed to play ${stem.name}`, e));
                }

                // Cancel any existing animation for this stem
                if (animationRefs.current[stem.id]) {
                    cancelAnimationFrame(animationRefs.current[stem.id]);
                }

                const animateVolume = () => {
                    const currentVol = audio.volume;
                    const diff = targetVolume - currentVol;

                    // Stop animating if we're close enough (within 1%)
                    if (Math.abs(diff) < 0.01) {
                        audio.volume = targetVolume;
                        // Pause if we hit 0 (master paused)
                        if (targetVolume === 0 && !audio.paused) {
                            audio.pause();
                        }
                        return;
                    }

                    // Move 5% towards target per frame for a smooth exponential fade (~2 second total fade)
                    audio.volume = currentVol + (diff * 0.05);
                    animationRefs.current[stem.id] = requestAnimationFrame(animateVolume);
                };

                // Start the smooth crossfade transition
                animationRefs.current[stem.id] = requestAnimationFrame(animateVolume);
            }
        });

        return () => {
            // Cleanup on unmount
            Object.values(animationRefs.current).forEach(id => cancelAnimationFrame(id));
        };
    }, [audioEnabled, volumes, isDucking]);

    return (
        <div className="hidden">
            {SOUND_STEMS.map((stem) => (
                <audio
                    key={stem.id}
                    ref={(el) => { if (el) audioRefs.current[stem.id] = el; }}
                    src={stem.url}
                    loop
                />
            ))}
        </div>
    );
};
