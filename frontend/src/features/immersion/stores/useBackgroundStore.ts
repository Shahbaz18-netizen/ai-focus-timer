
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Scene, SCENES } from '../data/scenes';

interface BackgroundState {
    currentScene: Scene;
    setScene: (sceneId: string) => void;
    setCustomScene: (youtubeId: string) => void;
    blurLevel: number;
    setBlurLevel: (level: number) => void;
    brightness: number;
    setBrightness: (level: number) => void;
}

export const useBackgroundStore = create<BackgroundState>()(
    persist(
        (set) => ({
            currentScene: SCENES[0],
            setScene: (sceneId) => {
                const scene = SCENES.find(s => s.id === sceneId);
                if (scene) set({ currentScene: scene });
            },
            setCustomScene: (youtubeId) => {
                set({
                    currentScene: {
                        id: `custom-${youtubeId}`,
                        name: 'Custom YouTube',
                        type: 'youtube',
                        url: youtubeId,
                        tags: ['custom']
                    }
                });
            },
            blurLevel: 0,
            setBlurLevel: (level) => set({ blurLevel: level }),
            brightness: 0.6, // Default overlay opacity (0 to 1, where 1 is dark)
            setBrightness: (level) => set({ brightness: level }),
        }),
        {
            name: 'aura-background-storage',
            onRehydrateStorage: () => (state) => {
                // Force update content from code-base matching ID
                // This fixes stale URLs in localStorage
                if (state && state.currentScene) {
                    const freshScene = SCENES.find(s => s.id === state.currentScene.id);
                    if (freshScene && freshScene.url !== state.currentScene.url) {
                        state.setScene(freshScene.id);
                    }
                }
            }
        }
    )
);
