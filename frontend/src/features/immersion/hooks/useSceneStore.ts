import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Scene {
    id: string;
    name: string;
    type: 'image' | 'video';
    url: string; // URL for image or video
    brightness?: number; // 0-1, 1 is original
    blur?: number; // px
}

// Define available sound stems globally for consistency
export const SOUND_STEMS = [
    { id: 'rain', name: 'Rain', url: 'https://bigsoundbank.com/UPLOAD/mp3/2388.mp3' },
    { id: 'fire', name: 'Campfire', url: 'https://bigsoundbank.com/UPLOAD/mp3/0899.mp3' },
    { id: 'wind', name: 'Wind', url: 'https://bigsoundbank.com/UPLOAD/mp3/0100.mp3' },
    { id: 'cafe', name: 'Cafe (Music)', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
];

interface SceneState {
    currentScene: Scene;
    setScene: (scene: Scene) => void;
    // Audio State
    audioEnabled: boolean;
    toggleAudio: () => void;
    volumes: Record<string, number>; // stemId -> volume (0-100)
    setVolume: (id: string, volume: number) => void;
    // Ducking State (temporarily lower volume for alerts)
    isDucking: boolean;
    setDucking: (isDucking: boolean) => void;
}

export const PRESET_SCENES: Scene[] = [
    {
        id: 'lofi-study',
        name: 'Lofi Study',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1593642532400-2682810df593?q=80&w=3869&auto=format&fit=crop', // Desk setup
        brightness: 0.6,
    },
    {
        id: 'rainy-window',
        name: 'Rainy Window',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=3000&auto=format&fit=crop', // Rain on glass
        brightness: 0.5,
    },
    {
        id: 'deep-forest',
        name: 'Deep Forest',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1448375240586-dfd8d395ea6c?q=80&w=2670&auto=format&fit=crop', // Forest
        brightness: 0.7,
    },
    {
        id: 'cyberpunk',
        name: 'Cyberpunk City',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1574360789073-7c3857502cd8?q=80&w=2938&auto=format&fit=crop', // Neon city
        brightness: 0.6,
    },
    {
        id: 'minimalist',
        name: 'Minimalist',
        type: 'image',
        url: '', // Empty URL will be handled as gradient/solid color backup
        brightness: 1,
    }
];

export const useSceneStore = create<SceneState>()(
    persist(
        (set) => ({
            currentScene: PRESET_SCENES[0],
            setScene: (scene) => set({ currentScene: scene }),
            audioEnabled: false,
            toggleAudio: () => set((state) => ({ audioEnabled: !state.audioEnabled })),
            volumes: {
                rain: 0,
                fire: 0,
                wind: 0,
                cafe: 0
            },
            setVolume: (id, volume) => set((state) => ({
                volumes: { ...state.volumes, [id]: volume }
            })),
            isDucking: false,
            setDucking: (isDucking) => set({ isDucking }),
        }),
        {
            name: 'aura-scene-storage',
        }
    )
);
