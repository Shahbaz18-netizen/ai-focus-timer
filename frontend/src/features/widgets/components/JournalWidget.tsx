"use client";

import { useWidgetStore } from "@/features/widgets/stores/useWidgetStore";
import { BookOpen, Calendar, Save } from "lucide-react";
import { DraggableWidgetWrapper } from "./DraggableWidgetWrapper";
import { useEffect, useState } from "react";

export const JournalWidget = () => {
    const { activeWidgets, toggleWidget, journalContent, setJournalContent } = useWidgetStore();
    const isOpen = activeWidgets.includes("journal");
    const [dateString, setDateString] = useState("");

    useEffect(() => {
        setDateString(new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }));
    }, []);

    if (!isOpen) return null;

    return (
        <DraggableWidgetWrapper
            id="journal"
            title="Journal"
            icon={<BookOpen className="w-4 h-4 text-accent" />}
            onClose={() => toggleWidget("journal")}
            defaultPosition={{ x: 800, y: 0 }}
        >
            <div className="p-5 flex flex-col gap-4 w-[340px] max-w-full">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2 text-white/50 text-xs font-mono tracking-wider uppercase">
                        <Calendar className="w-3.5 h-3.5 text-accent/70" />
                        {dateString || "Loading..."}
                    </div>
                </div>

                {/* Text Area */}
                <textarea
                    value={journalContent}
                    onChange={(e) => setJournalContent(e.target.value)}
                    placeholder="Capture your thoughts, ideas, or reflections..."
                    className="w-full h-64 bg-white/5 rounded-lg p-4 border border-white/5 focus:border-accent/40 hover:border-white/10 transition-colors resize-none focus:outline-none text-base font-sans font-medium leading-relaxed text-white placeholder:text-white/30 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent shadow-inner"
                />

                {/* Footer */}
                <div className="flex items-center justify-between pt-1">
                    <div className="text-[10px] text-white/30 font-mono">
                        {journalContent.length} characters
                    </div>
                    <span className="text-[10px] text-accent/80 font-mono flex items-center gap-1 bg-accent/10 px-2 py-1 rounded-md border border-accent/20">
                        <Save className="w-3 h-3" />
                        AUTO-SAVED
                    </span>
                </div>
            </div>
        </DraggableWidgetWrapper>
    );
};
