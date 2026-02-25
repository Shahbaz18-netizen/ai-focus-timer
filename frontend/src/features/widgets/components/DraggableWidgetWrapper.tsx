
"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

interface DraggableWidgetWrapperProps {
    id: string;
    title: string;
    onClose: () => void;
    children: ReactNode;
    headerActions?: ReactNode;
    icon?: ReactNode;
    defaultPosition?: { x: number; y: number };
    width?: string;
    className?: string;
    isMini?: boolean;
}

export const DraggableWidgetWrapper = ({
    id,
    title,
    onClose,
    children,
    headerActions,
    icon,
    defaultPosition = { x: 0, y: 0 },
    width = "w-80",
    className = "",
    isMini = false,
}: DraggableWidgetWrapperProps) => {
    return (
        <motion.div
            drag
            dragMomentum={true}
            dragTransition={{
                power: 0.1, // Low power to stop quickly
                timeConstant: 200,
                modifyTarget: (target) => Math.round(target / 40) * 40
            }}
            initial={{ opacity: 0, scale: 0.9, x: defaultPosition.x, y: defaultPosition.y }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`fixed ${isMini ? 'w-64' : width} max-w-[calc(100vw-2rem)] sm:max-w-none max-h-[85vh] sm:max-h-none bg-[#121212]/95 backdrop-blur-3xl border border-white/20 rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-hidden z-40 flex flex-col ${className} ring-1 ring-white/10 transition-[width,height,background-color] duration-300`}
            style={{ top: "6rem", left: "1rem" }} // Base position, accessible
        >
            {/* Header */}
            {!isMini && (
                <div className="flex items-center justify-between p-3 border-b border-white/5 bg-white/5 cursor-move active:cursor-grabbing select-none group">
                    <div className="flex items-center gap-2">
                        {icon && <span className="text-accent">{icon}</span>}
                        <span className="text-xs font-bold uppercase tracking-widest text-white/50 group-hover:text-white/80 transition-colors">
                            {title}
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        {headerActions}
                        <button
                            onClick={onClose}
                            className="p-1.5 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="flex-1 min-h-0 relative">
                {children}
            </div>
        </motion.div>
    );
};
