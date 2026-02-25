
"use client";

import { useWidgetStore } from "@/features/widgets/stores/useWidgetStore";
import { DraggableWidgetWrapper } from "./DraggableWidgetWrapper";
import { SoundMixer } from "@/features/immersion/components/SoundMixer";
import { Volume2 } from "lucide-react";

export const SoundWidget = () => {
    const { activeWidgets, toggleWidget } = useWidgetStore();
    const isOpen = activeWidgets.includes("sounds");

    if (!isOpen) return null;

    return (
        <DraggableWidgetWrapper
            id="sounds"
            title="Soundscapes"
            icon={<Volume2 className="w-3 h-3" />}
            onClose={() => toggleWidget("sounds")}
            defaultPosition={{ x: 740, y: 100 }}
            width="w-72"
        >
            <div className="p-4">
                <SoundMixer />
            </div>
        </DraggableWidgetWrapper>
    );
};
