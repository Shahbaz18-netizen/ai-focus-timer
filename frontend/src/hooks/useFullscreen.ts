import { useState, useCallback, useEffect } from 'react';

export const useFullscreen = () => {
    const [isFullscreen, setIsFullscreen] = useState(false);

    const toggleFullscreen = useCallback(async () => {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
            } else {
                if (document.exitFullscreen) {
                    await document.exitFullscreen();
                }
            }
        } catch (err) {
            console.error(`Error attempting to toggle fullscreen: ${err}`);
        }
    }, []);

    const enterFullscreen = useCallback(async () => {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
            }
        } catch (err) {
            console.error(`Error attempting to enter fullscreen: ${err}`);
        }
    }, []);

    const exitFullscreen = useCallback(async () => {
        try {
            if (document.fullscreenElement && document.exitFullscreen) {
                await document.exitFullscreen();
            }
        } catch (err) {
            console.error(`Error attempting to exit fullscreen: ${err}`);
        }
    }, []);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    return { isFullscreen, toggleFullscreen, enterFullscreen, exitFullscreen };
};
