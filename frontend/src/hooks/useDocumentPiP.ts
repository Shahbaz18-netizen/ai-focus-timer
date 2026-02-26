"use client";

import { useState, useCallback, useEffect } from 'react';

export const useDocumentPiP = () => {
    const [isSupported, setIsSupported] = useState(false);
    const [pipWindow, setPipWindow] = useState<Window | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'documentPictureInPicture' in window) {
            setIsSupported(true);
        }
    }, []);

    const requestPiP = useCallback(async (options: { width: number; height: number }) => {
        if (!isSupported) return null;

        try {
            // @ts-ignore - Experimental API
            const pip = await window.documentPictureInPicture.requestWindow({
                width: options.width,
                height: options.height,
            });

            // Copy styles from the main document to the PiP document
            const styleSheets = Array.from(document.styleSheets);
            styleSheets.forEach((styleSheet) => {
                if (styleSheet.href) {
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = styleSheet.href;
                    pip.document.head.appendChild(link);
                } else {
                    try {
                        const style = document.createElement('style');
                        const cssRules = Array.from(styleSheet.cssRules)
                            .map((rule) => rule.cssText)
                            .join('');
                        style.appendChild(document.createTextNode(cssRules));
                        pip.document.head.appendChild(style);
                    } catch (e) {
                        // CORS issues handling some stylesheets, safe to ignore usually
                    }
                }
            });

            // Add a dark background base to the PiP window
            pip.document.body.style.backgroundColor = '#000000';
            pip.document.body.style.color = '#ffffff';
            pip.document.body.style.margin = '0';
            pip.document.body.style.display = 'flex';
            pip.document.body.style.justifyContent = 'center';
            pip.document.body.style.alignItems = 'center';
            pip.document.body.style.height = '100vh';

            pip.addEventListener('pagehide', () => {
                setPipWindow(null);
            });

            setPipWindow(pip);
            return pip;
        } catch (error) {
            console.error('Failed to open PiP window:', error);
            return null;
        }
    }, [isSupported]);

    const closePiP = useCallback(() => {
        if (pipWindow) {
            pipWindow.close();
        }
    }, [pipWindow]);

    return {
        isSupported,
        pipWindow,
        requestPiP,
        closePiP,
    };
};
