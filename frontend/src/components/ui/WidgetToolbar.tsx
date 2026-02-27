"use client";

import { useWidgetStore } from "@/features/widgets/stores/useWidgetStore";
import { CheckSquare, BookOpen, Music, Image as ImageIcon, Volume2 } from "lucide-react";

export function WidgetToolbar() {
    const { activeWidgets, toggleWidget, isZenMode } = useWidgetStore();

    if (isZenMode) return null;

    const widgets = [
        { id: 'tasks', icon: CheckSquare, label: 'Tasks' },
        { id: 'journal', icon: BookOpen, label: 'Journal' },
        { id: 'media', icon: Music, label: 'Music' },
        { id: 'scenes', icon: ImageIcon, label: 'Scenes' },
        { id: 'sounds', icon: Volume2, label: 'Sounds' },
    ];

    return (
        <div className="fixed left-4 right-4 bottom-24 sm:right-auto sm:left-6 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 z-40 flex flex-row sm:flex-col justify-around sm:justify-start gap-2 sm:gap-3 bg-background/60 sm:bg-background/20 backdrop-blur-3xl border border-border-subtle rounded-2xl sm:rounded-3xl p-2 sm:p-3 shadow-xl animate-in fade-in overflow-x-auto sm:overflow-visible overflow-y-hidden scrollbar-hide">
            {widgets.map((widget) => {
                const isActive = activeWidgets.includes(widget.id);
                const Icon = widget.icon;
                return (
                    <button
                        key={widget.id}
                        onClick={() => toggleWidget(widget.id)}
                        className={`p-2.5 sm:p-3 shrink-0 rounded-xl sm:rounded-2xl transition-all duration-300 relative group flex items-center justify-center
                            ${isActive
                                ? 'bg-accent/20 text-accent shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)]'
                                : 'bg-panel text-foreground/50 hover:bg-panel-hover hover:text-foreground'
                            }`}
                        title={widget.label}
                    >
                        <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100'}`} />

                        {/* Tooltip on Hover (Desktop Only) */}
                        <div className="hidden sm:block absolute left-full ml-4 px-3 py-1.5 bg-background border border-border-subtle rounded-lg text-xs font-bold tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
                            {widget.label}
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
