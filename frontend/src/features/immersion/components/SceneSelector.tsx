"use client";

import { useSceneStore, PRESET_SCENES } from '../hooks/useSceneStore';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Check } from 'lucide-react';

export const SceneSelector = () => {
    const { currentScene, setScene } = useSceneStore();

    return (
        <div className="flex gap-2 overflow-x-auto pb-4 max-w-full no-scrollbar">
            {PRESET_SCENES.map((scene) => (
                <button
                    key={scene.id}
                    onClick={() => setScene(scene)}
                    className={`relative group flex-shrink-0 w-24 h-16 rounded-xl overflow-hidden border transition-all ${currentScene.id === scene.id
                            ? 'border-accent ring-2 ring-accent/30'
                            : 'border-white/10 hover:border-white/30'
                        }`}
                >
                    {scene.url ? (
                        <img
                            src={scene.url}
                            alt={scene.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-white/20" />
                        </div>
                    )}

                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />

                    {/* Name Label */}
                    <div className="absolute bottom-1 left-2 text-[9px] font-bold text-white/90 uppercase tracking-wider shadow-sm">
                        {scene.name}
                    </div>

                    {currentScene.id === scene.id && (
                        <div className="absolute top-1 right-1 bg-accent text-black rounded-full p-0.5">
                            <Check className="w-3 h-3" />
                        </div>
                    )}
                </button>
            ))}
        </div>
    );
};
