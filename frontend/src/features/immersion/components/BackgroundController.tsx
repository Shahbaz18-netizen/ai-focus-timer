"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useSceneStore } from '../hooks/useSceneStore';
import { useEffect, useState } from 'react';

export const BackgroundController = () => {
    const { currentScene } = useSceneStore();
    const [isLoaded, setIsLoaded] = useState(false);

    // Reset loaded state when url changes to trigger fade
    useEffect(() => {
        setIsLoaded(false);
        const img = new Image();
        if (currentScene.url) {
            img.src = currentScene.url;
            img.onload = () => setIsLoaded(true);
        } else {
            setIsLoaded(true);
        }
    }, [currentScene.url]);

    return (
        <div className="fixed inset-0 z-0 h-screen w-screen overflow-hidden bg-black transition-colors duration-1000">
            <AnimatePresence mode="wait">
                {currentScene.url ? (
                    <motion.div
                        key={currentScene.id}
                        initial={{ opacity: 0 }}
                        animate={{
                            opacity: isLoaded ? 1 : 0,
                            scale: 1.1 // Start slightly zoomed in
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5 }}
                        className="absolute inset-0 h-full w-full"
                    >
                        {/* Ken Burns Effect Layer */}
                        <motion.div
                            className="h-full w-full bg-cover bg-center"
                            style={{ backgroundImage: `url(${currentScene.url})` }}
                            animate={{
                                scale: [1.1, 1.2],
                                x: ['0%', '2%'],
                            }}
                            transition={{
                                duration: 30,
                                ease: "linear",
                                repeat: Infinity,
                                repeatType: "reverse"
                            }}
                        />

                        {/* Overlay to darken/tint */}
                        <div
                            className="absolute inset-0 bg-black transition-all duration-1000"
                            style={{
                                opacity: 1 - (currentScene.brightness ?? 0.5),
                                backdropFilter: currentScene.blur ? `blur(${currentScene.blur}px)` : 'none'
                            }}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="minimalist"
                        className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-black"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};
