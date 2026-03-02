
"use client";

import { ReactNode, useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { X, GripHorizontal } from "lucide-react";
import { useHaptics } from "@/hooks/useHaptics";

import { useWidgetStore } from "@/features/widgets/stores/useWidgetStore";

interface DraggableWidgetWrapperProps {
    id: string;
    title: string;
    onClose: () => void;
    children: ReactNode;
    headerActions?: ReactNode;
    icon?: ReactNode;
    defaultPosition?: { x: number; y: number };
    side?: 'left' | 'right' | 'center';
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
    defaultPosition = { x: 0, y: 96 },
    side = 'right',
    width = "w-80",
    className = "",
    isMini = false,
}: DraggableWidgetWrapperProps) => {
    const { activeWidgets } = useWidgetStore();
    const { lightTap } = useHaptics();
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 640);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    if (!activeWidgets.includes(id)) return null;

    // Desktop positioning logic based on side
    const desktopStyle: React.CSSProperties = !isMobile ? {
        top: defaultPosition.y,
        left: side === 'left' ? 16 : side === 'center' ? '50%' : 'auto',
        right: side === 'right' ? 16 : 'auto',
        transform: side === 'center' ? 'translateX(-50%)' : 'none',
    } : {};

    return (
        <motion.div
            drag={!isMobile}
            dragMomentum={true}
            dragElastic={0.1}
            onDragEnd={() => !isMobile && lightTap()}
            style={desktopStyle}
            className={`sm:fixed relative ${isMini ? 'w-full sm:w-64' : 'w-full ' + width} sm:max-w-none max-h-[50vh] sm:max-h-[85vh] bg-[#121212]/95 backdrop-blur-3xl border border-border-subtle sm:rounded-2xl rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] sm:shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-hidden sm:z-40 flex flex-col ${className} ring-1 ring-white/10 transition-[background-color] duration-300 origin-top mb-4 sm:mb-0`}
        >
            {/* Header */}
            {!isMini && (
                <div className={`flex items-center justify-between p-3 border-b border-white/5 bg-panel ${isMobile ? '' : 'cursor-move active:cursor-grabbing'} select-none group touch-none`}>
                    <div className="flex items-center gap-2">
                        {!isMobile && <GripHorizontal className="w-4 h-4 text-foreground/20 group-hover:text-foreground/40 transition-colors" />}
                        {icon && <span className="text-accent">{icon}</span>}
                        <span className="text-xs font-bold uppercase tracking-widest text-foreground/50 group-hover:text-foreground/80 transition-colors">
                            {title}
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        {headerActions}
                        {!isMobile && (
                            <button
                                onClick={onClose}
                                className="p-1.5 hover:bg-panel-hover rounded-full text-foreground/40 hover:text-foreground transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="flex-1 min-h-0 relative overflow-y-auto overflow-x-hidden">
                {children}
            </div>
        </motion.div>
    );
};
