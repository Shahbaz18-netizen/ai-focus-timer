
"use client";

import { useWidgetStore } from "@/features/widgets/stores/useWidgetStore";
import { DraggableWidgetWrapper } from "./DraggableWidgetWrapper";
import { SoundMixer } from "@/features/immersion/components/SoundMixer";
import { Volume2 } from "lucide-react";

export const SoundWidget = ({ defaultPosition, side = 'right' }: { defaultPosition?: { x: number, y: number }, side?: 'left' | 'right' | 'center' }) => {
    const { activeWidgets, toggleWidget } = useWidgetStore();
    const isOpen = activeWidgets.includes("sounds");

    if (!isOpen) return null;

    return (
        <DraggableWidgetWrapper
            id="sounds"
            title="Soundscapes"
            icon={<Volume2 className="w-3 h-3" />}
            onClose={() => toggleWidget("sounds")}
            defaultPosition={defaultPosition || { x: 0, y: 450 }}
            side={side}
            width="w-full sm:w-64"
        >
            <div className="p-3 sm:p-4">
                <SoundMixer />
            </div>
        </DraggableWidgetWrapper>
    );
};
