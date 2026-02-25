"use client";

import { motion } from "framer-motion";

export const AuraLoader = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6">
            <div className="relative w-24 h-24 flex items-center justify-center">
                {/* Core Aura */}
                <motion.div
                    className="absolute inset-0 bg-accent/30 rounded-full blur-xl"
                    animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.3, 0.7, 0.3],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />

                {/* Inner Ring */}
                <motion.div
                    className="absolute w-16 h-16 border-2 border-accent/50 rounded-full"
                    animate={{
                        rotate: 360,
                        scale: [1, 1.1, 1],
                    }}
                    transition={{
                        rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                        scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                    }}
                />

                {/* Outer Ring */}
                <motion.div
                    className="absolute w-20 h-20 border border-secondary/40 rounded-full border-dashed"
                    animate={{
                        rotate: -360,
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                />

                {/* Center Core */}
                <motion.div
                    className="w-4 h-4 bg-accent rounded-full shadow-[0_0_20px_rgba(0,255,255,0.8)]"
                    animate={{
                        opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                    }}
                />
            </div>

            <motion.p
                className="text-textDim text-sm font-medium tracking-widest uppercase"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
            >
                Initializing Aura Interface...
            </motion.p>
        </div>
    );
};
