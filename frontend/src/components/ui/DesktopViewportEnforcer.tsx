"use client";

import { useEffect } from "react";

export const DesktopViewportEnforcer = () => {
    useEffect(() => {
        // Only run on the client side
        if (typeof window === "undefined") return;

        // Check if the device is a mobile phone (narrow screen)
        if (window.innerWidth < 768 || screen.width < 768) {
            // Find the existing viewport meta tag
            let viewportMeta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;

            if (!viewportMeta) {
                // If it doesn't exist for some reason, create it
                viewportMeta = document.createElement("meta");
                viewportMeta.name = "viewport";
                document.head.appendChild(viewportMeta);
            }

            // Hardcode the viewport to a desktop width of 1024px.
            // This forces the mobile browser to "zoom out" the UI, exactly matching the spacious
            // layout of the desktop app, preventing the timer and widgets from colliding.
            viewportMeta.content = "width=1024, initial-scale=0.3, maximum-scale=2.0";
        }
    }, []);

    return null;
};
