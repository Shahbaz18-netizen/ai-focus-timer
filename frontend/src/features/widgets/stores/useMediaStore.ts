import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface MediaStation {
    id: string;
    name: string;
    url: string;
    isBreakStation?: boolean;
}

export const PLAYLISTS: MediaStation[] = [
    { id: 'river', name: 'Forest River', url: 'https://www.youtube.com/watch?v=S0wXgt_3W04' },
    { id: 'ocean', name: 'Ocean Waves', url: 'https://www.youtube.com/watch?v=52aSNmVsvFk' },
    { id: 'rain', name: 'Rainy Cafe', url: 'https://www.youtube.com/watch?v=mPZkdNFkNps' },
    { id: 'fireplace', name: 'Cozy Fireplace', url: 'https://www.youtube.com/watch?v=L_LUpnjgPso' },
    { id: 'lofi-girl-static', name: 'Lofi Girl (Break)', url: 'https://www.youtube.com/watch?v=1fueZCTYkpA', isBreakStation: true },
    { id: 'cozy-jazz', name: 'Cozy Fall Jazz (Break)', url: 'https://www.youtube.com/watch?v=tNkZsRW7h2c', isBreakStation: true },
    { id: 'chillwave', name: 'Chillwave Mix (Break)', url: 'https://www.youtube.com/watch?v=MVPTGNGiI-4', isBreakStation: true },
    { id: 'zen-music', name: 'Japanese Zen (Break)', url: 'https://www.youtube.com/watch?v=3jWRrafhO7M', isBreakStation: true },
];

interface MediaState {
    currentStation: MediaStation;
    lastFocusStation: MediaStation | null;
    setCurrentStation: (station: MediaStation) => void;
    switchToBreakStation: () => void;
    switchToFocusStation: () => void;
}

export const useMediaStore = create<MediaState>()(
    persist(
        (set, get) => ({
            currentStation: PLAYLISTS[0],
            lastFocusStation: null,
            setCurrentStation: (station) => set({ currentStation: station }),
            switchToBreakStation: () => {
                const { currentStation } = get();
                // Store current as last focus station if it's not already a break station
                const lastFocus = currentStation.isBreakStation ? null : currentStation;
                const breakStations = PLAYLISTS.filter(s => s.isBreakStation);
                const breakStation = breakStations.length > 0
                    ? breakStations[Math.floor(Math.random() * breakStations.length)]
                    : PLAYLISTS[0];

                set({
                    lastFocusStation: lastFocus || get().lastFocusStation,
                    currentStation: breakStation
                });
            },
            switchToFocusStation: () => {
                const { lastFocusStation } = get();
                if (lastFocusStation) {
                    set({ currentStation: lastFocusStation });
                } else {
                    // Fallback to first focus station
                    set({ currentStation: PLAYLISTS[0] });
                }
            },
        }),
        {
            name: 'aura-media-storage',
        }
    )
);
