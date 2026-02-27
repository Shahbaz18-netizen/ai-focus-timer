
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface FlipDigitProps {
    digit: number | string;
    label?: string;
}

export const FlipDigit = ({ digit, label }: FlipDigitProps) => {
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
            <div className="relative w-16 h-28 sm:w-24 sm:h-36 md:w-40 md:h-56 bg-[#1a1a1a] rounded-xl perspective-1000 shadow-2xl border border-white/5">
                {/* Static Background (Next Number) */}
                <div className="absolute inset-0 flex flex-col rounded-xl overflow-hidden">
                    <div className="h-1/2 bg-[#222] border-b border-black/30 flex items-end justify-center overflow-hidden">
                        <span className="text-5xl sm:text-7xl md:text-[10rem] font-bold font-mono text-[#e0e0e0] translate-y-[50%]">
                            {currentDigit}
                        </span>
                    </div>
                    <div className="h-1/2 bg-[#222] flex items-start justify-center overflow-hidden">
                        <span className="text-5xl sm:text-7xl md:text-[10rem] font-bold font-mono text-[#e0e0e0] -translate-y-[50%]">
                            {currentDigit}
                        </span>
                    </div>
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
                                className="absolute inset-x-0 top-0 h-1/2 bg-[#222] flex items-end justify-center overflow-hidden backface-hidden border-b border-black/30 rounded-t-xl origin-bottom"
                            >
                                <span className="text-5xl sm:text-7xl md:text-[10rem] font-bold font-mono text-[#e0e0e0] translate-y-[50%]">
                                    {previousDigit}
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                            </div>

                            {/* Back Face (Bottom of Current) - Initially hidden by backface-visibility */}
                            <div
                                className="absolute inset-x-0 top-1/2 h-1/2 bg-[#222] flex items-start justify-center overflow-hidden backface-hidden rounded-b-xl origin-top"
                                style={{ transform: "rotateX(180deg)" }}
                            >
                                <span className="text-5xl sm:text-7xl md:text-[10rem] font-bold font-mono text-[#e0e0e0] -translate-y-[50%]">
                                    {currentDigit}
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Static Bottom (Previous Digit) - Visible until covered by flip */}
                {!isFlipping && (
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[#222] flex items-start justify-center overflow-hidden rounded-b-xl z-0">
                        <span className="text-5xl sm:text-7xl md:text-[10rem] font-bold font-mono text-[#e0e0e0] -translate-y-[50%]">
                            {currentDigit}
                        </span>
                    </div>
                )}
                {isFlipping && (
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[#222] flex items-start justify-center overflow-hidden rounded-b-xl z-0">
                        <span className="text-5xl sm:text-7xl md:text-[10rem] font-bold font-mono text-[#e0e0e0] -translate-y-[50%]">
                            {previousDigit}
                        </span>
                    </div>
                )}


                {/* Hinge Line */}
                <div className="absolute top-1/2 left-0 right-0 h-[3px] bg-background z-20 shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />

                {/* Side Accents (Hinge mechanism) */}
                <div className="absolute top-1/2 -left-1 w-2 h-4 bg-[#333] rounded-r-md -translate-y-1/2 z-20 border border-black/40" />
                <div className="absolute top-1/2 -right-1 w-2 h-4 bg-[#333] rounded-l-md -translate-y-1/2 z-20 border border-black/40" />
            </div>
        </div>
    );
};
