"use client";

import { useSceneStore, SOUND_STEMS } from '../hooks/useSceneStore';
import { Volume2, VolumeX, CloudRain, Flame, Coffee, Wind } from 'lucide-react';

const icons: Record<string, any> = {
    rain: CloudRain,
    fire: Flame,
    wind: Wind,
    cafe: Coffee,
};

export const SoundMixer = () => {
    const { audioEnabled, toggleAudio, volumes, setVolume } = useSceneStore();

    // Handle Volume Changes
    const updateVolume = (id: string, vol: number) => {
        // Auto-enable master audio if user interacts with limits
        if (vol > 0 && !audioEnabled) {
            toggleAudio();
        }
        setVolume(id, vol);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-widest text-white/50">Ambience</span>
                <button
                    onClick={toggleAudio}
                    className={`p-2 rounded-full transition-colors ${audioEnabled ? 'bg-accent/20 text-accent' : 'bg-white/5 text-white/40'}`}
                >
                    {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {SOUND_STEMS.map((stem) => {
                    const Icon = icons[stem.id] || Wind;
                    const vol = volumes[stem.id] || 0;

                    return (
                        <div key={stem.id} className="flex items-center gap-3 sm:gap-4 group">
                            <Icon className={`w-4 h-4 shrink-0 transition-colors ${vol > 0 && audioEnabled ? 'text-accent' : 'text-white/30'}`} />
                            <div className="flex-1 relative h-8 flex items-center min-w-0">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={vol}
                                    onChange={(e) => updateVolume(stem.id, Number(e.target.value))}
                                    className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:opacity-0 group-hover:[&::-webkit-slider-thumb]:opacity-100 hover:[&::-webkit-slider-thumb]:scale-125 transition-all relative z-10"
                                />
                                <div
                                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-accent rounded-full pointer-events-none transition-all z-0"
                                    style={{ width: `${vol}%`, opacity: audioEnabled ? 1 : 0.5 }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
