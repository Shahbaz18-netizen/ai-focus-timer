import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WidgetState {
    activeWidgets: string[];
    toggleWidget: (id: string) => void;
    isZenMode: boolean;
    toggleZenMode: () => void;

    // Journal Data
    journalContent: string;
    setJournalContent: (content: string) => void;
}

export const useWidgetStore = create<WidgetState>()(
    persist(
        (set) => ({
            activeWidgets: [],
            toggleWidget: (id) => set((state) => {
                const isWidget = ["journal", "media", "scenes", "tasks", "sounds"].includes(id);
                if (state.activeWidgets.includes(id)) {
                    return { activeWidgets: state.activeWidgets.filter(w => w !== id) };
                } else {
                    return { activeWidgets: [...state.activeWidgets, id] };
                }
            }),
            isZenMode: false,
            toggleZenMode: () => set((state) => ({ isZenMode: !state.isZenMode })),

            journalContent: "",
            setJournalContent: (content) => set({ journalContent: content }),
        }),
        {
            name: 'aura-widget-storage',
        }
    )
);
