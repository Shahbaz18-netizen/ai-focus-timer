
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
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const updateConstraints = () => {
            if (!widgetRef.current) return;
            const widgetWidth = widgetRef.current.offsetWidth;
            const widgetHeight = widgetRef.current.offsetHeight;

            const mobile = window.innerWidth < 640;
            setIsMobile(mobile);

            if (mobile) return; // No constraints needed if not dragging

            const originX = window.innerWidth - widgetWidth - 16;
            const originY = 96;

            setConstraints({
                left: -originX + 16,
                right: window.innerWidth - originX - widgetWidth - 16,
                top: -originY + 16,
                bottom: window.innerHeight - originY - widgetHeight
            });
        };

        setTimeout(updateConstraints, 100);
        window.addEventListener('resize', updateConstraints);
        return () => window.removeEventListener('resize', updateConstraints);
    }, []);

    return (
        <motion.div
            ref={widgetRef}
            drag={!isMobile}
            dragMomentum={true}
            dragConstraints={constraints}
            dragTransition={{
                power: 0.1, // Low power to stop quickly
                timeConstant: 200,
                modifyTarget: (target) => Math.round(target / 100) * 100
            }}
            onDragEnd={() => !isMobile && lightTap()}
            initial={isMobile ? { opacity: 0, y: 20 } : { opacity: 0, scale: 0.9, x: defaultPosition.x, y: defaultPosition.y }}
            animate={isMobile ? { opacity: 1, y: 0 } : { opacity: 1, scale: 1 }}
            exit={isMobile ? { opacity: 0, y: 20 } : { opacity: 0, scale: 0.9 }}
            className={`sm:fixed relative ${isMini ? 'w-full sm:w-64' : 'w-full ' + width} sm:max-w-none max-h-[50vh] sm:max-h-[85vh] bg-[#121212]/95 backdrop-blur-3xl border border-border-subtle sm:rounded-2xl rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] sm:shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-hidden sm:z-40 flex flex-col ${className} ring-1 ring-white/10 transition-[background-color] duration-300 sm:left-auto sm:right-4 sm:top-24 origin-top mb-4 sm:mb-0`}
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
