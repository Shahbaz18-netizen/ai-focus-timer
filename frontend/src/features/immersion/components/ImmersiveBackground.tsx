
"use client";

import { useBackgroundStore } from "../stores/useBackgroundStore";
import { motion, AnimatePresence } from "framer-motion";

export const ImmersiveBackground = () => {
    const { currentScene, blurLevel, brightness } = useBackgroundStore();

    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden bg-background">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentScene.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5 }}
                    className="absolute inset-0"
                >
                    {currentScene.type === 'youtube' ? (
                        <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
                            {/* Scale it up slightly so YouTube titles/controls are hidden off-screen */}
                            <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube-nocookie.com/embed/${currentScene.url}?autoplay=1&mute=1&controls=0&loop=1&playlist=${currentScene.url}&playsinline=1`}
                                title="Background Video"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                className="absolute top-1/2 left-1/2 w-[120vw] h-[120vh] -translate-x-1/2 -translate-y-1/2 object-cover transition-all duration-700"
                                style={{ filter: `blur(${blurLevel}px)` }}
                            />
                        </div>
                    ) : currentScene.type === 'video' ? (
                        <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="absolute inset-0 w-full h-full object-cover transition-all duration-700"
                            style={{ filter: `blur(${blurLevel}px)` }}
                            onError={(e) => console.error("Video load error:", e.currentTarget.error, currentScene.url)}
                        >
                            <source src={currentScene.url} />
                        </video>
                    ) : (
                        <div
                            className="absolute inset-0 w-full h-full bg-cover bg-center transition-all duration-700"
                            style={{
                                backgroundImage: `url(${currentScene.url})`,
                                filter: `blur(${blurLevel}px)`
                            }}
                        />
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Overlay for Brightness/Contrast Control */}
            <div
                className="absolute inset-0 bg-background transition-opacity duration-300 pointer-events-none"
                style={{ opacity: 1 - brightness }}
            />

            {/* Gradient Overlay for Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />
        </div>
    );
};
