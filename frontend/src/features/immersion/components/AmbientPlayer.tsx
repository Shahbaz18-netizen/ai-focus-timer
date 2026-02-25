"use client";

import { useEffect, useRef } from "react";
import { useSceneStore, SOUND_STEMS } from "../hooks/useSceneStore";

export const AmbientPlayer = () => {
    const { audioEnabled, volumes, isDucking } = useSceneStore();
    const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

    useEffect(() => {
        Object.values(SOUND_STEMS).forEach((stem) => {
            const audio = audioRefs.current[stem.id];
            const volume = volumes[stem.id] || 0;

            if (audio) {
                // Audio Ducking: lower volume to 20% of its normal level if a notification is playing
                const duckMult = isDucking ? 0.2 : 1;
                audio.volume = (volume / 100) * duckMult;

                // Handle Play/Pause logic
                if (audioEnabled && volume > 0) {
                    if (audio.paused) {
                        audio.play().catch(e => console.warn(`Failed to play ${stem.name}`, e));
                    }
                } else {
                    if (!audio.paused) {
                        audio.pause();
                    }
                }
            }
        });
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
