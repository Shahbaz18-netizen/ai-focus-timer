
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface FlipDigitProps {
    digit: number | string;
    label?: string;
    size?: 'normal' | 'large' | 'zen';
}

export const FlipDigit = ({ digit, label, size = 'normal' }: FlipDigitProps) => {
    const sizeClasses = {
        normal: "w-16 h-24 sm:w-20 sm:h-32 md:w-24 md:h-36",
        large: "w-24 h-36 sm:w-32 sm:h-48 md:w-36 md:h-56",
        zen: "w-28 h-40 sm:w-36 sm:h-56 md:w-44 md:h-64"
    };

    const textClasses = {
        normal: "text-5xl sm:text-6xl md:text-7xl",
        large: "text-7xl sm:text-8xl md:text-9xl",
        zen: "text-8xl sm:text-9xl md:text-[12rem]"
    };
    const [currentDigit, setCurrentDigit] = useState(digit);
    const [previousDigit, setPreviousDigit] = useState(digit);
    const [isFlipping, setIsFlipping] = useState(false);

    useEffect(() => {
        if (digit !== currentDigit) {
            setPreviousDigit(currentDigit);
            setCurrentDigit(digit);
            setIsFlipping(true);

            const timeout = setTimeout(() => setIsFlipping(false), 600);
            return () => clearTimeout(timeout);
        }
    }, [digit, currentDigit]);

    return (
        <div className="flex flex-col items-center gap-4">
            <div className={`relative ${sizeClasses[size]} bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] rounded-2xl perspective-1000 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10`}>
                {/* Static Background (Next Number) */}
                <div className="absolute inset-0 flex flex-col rounded-2xl overflow-hidden">
                    <div className="h-1/2 bg-[#1d1d1d] border-b border-black/40 flex items-end justify-center overflow-hidden">
                        <span className={`${textClasses[size]} font-black font-mono text-[#f0f0f0] translate-y-[50%] tracking-tighter`}>
                            {currentDigit}
                        </span>
                    </div>
                    <div className="h-1/2 bg-[#1d1d1d] flex items-start justify-center overflow-hidden">
                        <span className={`${textClasses[size]} font-black font-mono text-[#f0f0f0] -translate-y-[50%] tracking-tighter`}>
                            {currentDigit}
                        </span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                </div>

                {/* Flipping Element (Top Half of Previous -> Bottom Half of Current) */}
                <AnimatePresence mode="popLayout">
                    {isFlipping && (
                        <motion.div
                            key={previousDigit}
                            initial={{ rotateX: 0 }}
                            animate={{ rotateX: -180 }}
                            transition={{ duration: 0.6, ease: "easeInOut" }}
                            className="absolute inset-0 preserve-3d z-10"
                            style={{ transformOrigin: "center" }}
                        >
                            {/* Front Face (Top of Previous) */}
                            <div
                                className="absolute inset-x-0 top-0 h-1/2 bg-[#1d1d1d] flex items-end justify-center overflow-hidden backface-hidden border-b border-black/40 rounded-t-2xl origin-bottom"
                            >
                                <span className={`${textClasses[size]} font-black font-mono text-[#f0f0f0] translate-y-[50%] tracking-tighter`}>
                                    {previousDigit}
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                            </div>

                            {/* Back Face (Bottom of Current) - Initially hidden by backface-visibility */}
                            <div
                                className="absolute inset-x-0 top-1/2 h-1/2 bg-[#1d1d1d] flex items-start justify-center overflow-hidden backface-hidden rounded-b-2xl origin-top"
                                style={{ transform: "rotateX(180deg)" }}
                            >
                                <span className={`${textClasses[size]} font-black font-mono text-[#f0f0f0] -translate-y-[50%] tracking-tighter`}>
                                    {currentDigit}
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Static Bottom (Previous Digit) - Visible until covered by flip */}
                {!isFlipping && (
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[#1d1d1d] flex items-start justify-center overflow-hidden rounded-b-2xl z-0">
                        <span className={`${textClasses[size]} font-black font-mono text-[#f0f0f0] -translate-y-[50%] tracking-tighter`}>
                            {currentDigit}
                        </span>
                    </div>
                )}
                {isFlipping && (
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[#1d1d1d] flex items-start justify-center overflow-hidden rounded-b-2xl z-0">
                        <span className={`${textClasses[size]} font-black font-mono text-[#f0f0f0] -translate-y-[50%] tracking-tighter`}>
                            {previousDigit}
                        </span>
                    </div>
                )}


                {/* Hinge Line - More refined */}
                <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-[#000] z-20 shadow-[0_1px_1px_rgba(255,255,255,0.05)]" />

                {/* Side Accents (Hinge mechanism) - More detailed */}
                <div className="absolute top-1/2 -left-1.5 w-3 h-6 bg-[#2a2a2a] rounded-r-sm -translate-y-1/2 z-30 border border-white/10 shadow-lg" />
                <div className="absolute top-1/2 -right-1.5 w-3 h-6 bg-[#2a2a2a] rounded-l-sm -translate-y-1/2 z-30 border border-white/10 shadow-lg" />

                {/* Subtle Inner Shadow overlay */}
                <div className="absolute inset-0 rounded-2xl shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] pointer-events-none z-40" />
            </div>
        </div>
    );
};
