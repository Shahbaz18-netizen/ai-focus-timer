
"use client";

import { ReactNode, useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { X, GripHorizontal } from "lucide-react";
import { useHaptics } from "@/hooks/useHaptics";

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
    const { lightTap } = useHaptics();
    const widgetRef = useRef<HTMLDivElement>(null);

    // Start with loose bounds to avoid hydration mismatch, then snap to window bounds
    const [constraints, setConstraints] = useState({ left: -2000, right: 2000, top: -2000, bottom: 2000 });

    useEffect(() => {
        const updateConstraints = () => {
            if (!widgetRef.current) return;
            const widgetWidth = widgetRef.current.offsetWidth;
            const widgetHeight = widgetRef.current.offsetHeight;

            // On mobile, the wrapper uses fixed CSS offsets (left-4, top-32)
            // We need to calculate how far it can move from that origin before hitting screen edges
            const isMobile = window.innerWidth < 640;
            const originX = isMobile ? 16 : window.innerWidth - widgetWidth - 16; // left-4 is 16px, or right-aligned on desktop
            const originY = isMobile ? 128 : 96; // top-32 is 128px, top-24 is 96px

            // Bottom nav bar height to avoid on mobile (~80px)
            const mobileBottomNavBuffer = isMobile ? 100 : 0;

            setConstraints({
                left: -originX + 16, // Don't go past left edge (+16px padding)
                right: window.innerWidth - originX - widgetWidth - 16, // Don't go past right edge
                top: -originY + 16, // Don't go past top edge
                bottom: window.innerHeight - originY - widgetHeight - mobileBottomNavBuffer // Don't go past bottom
            });
        };

        // Delay slightly to ensure layout is complete
        setTimeout(updateConstraints, 100);

        window.addEventListener('resize', updateConstraints);
        return () => window.removeEventListener('resize', updateConstraints);
    }, []);

    return (
        <motion.div
            ref={widgetRef}
            drag
            dragMomentum={true}
            dragConstraints={constraints}
            dragTransition={{
                power: 0.1, // Low power to stop quickly
                timeConstant: 200,
                modifyTarget: (target) => Math.round(target / 100) * 100
            }}
            onDragEnd={() => lightTap()}
            initial={{ opacity: 0, scale: 0.9, x: defaultPosition.x, y: defaultPosition.y }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`fixed ${isMini ? 'w-56 sm:w-64' : width} max-w-[calc(100vw-1rem)] sm:max-w-none max-h-[45vh] sm:max-h-[85vh] bg-[#121212]/95 backdrop-blur-3xl border border-white/20 rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-hidden z-40 flex flex-col ${className} ring-1 ring-white/10 transition-[background-color] duration-300 left-2 sm:left-auto sm:right-4 top-24 origin-top`}
        >
            {/* Header */}
            {!isMini && (
                <div className="flex items-center justify-between p-3 border-b border-white/5 bg-white/5 cursor-move active:cursor-grabbing select-none group touch-none">
                    <div className="flex items-center gap-2">
                        <GripHorizontal className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors" />
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
            <div className="flex-1 min-h-0 relative overflow-y-auto overflow-x-hidden">
                {children}
            </div>
        </motion.div>
    );
};
