"use client";

import { useCallback } from 'react';

/**
 * A hook to safely interact with the native Vibration API for haptic feedback.
 */
export const useHaptics = () => {
    const vibrate = useCallback((pattern: number | number[]) => {
        if (typeof window === 'undefined' || !navigator.vibrate) return;

        try {
            navigator.vibrate(pattern);
        } catch (error) {
            console.warn("Haptic feedback failed or not supported:", error);
        }
    }, []);

    const lightTap = useCallback(() => vibrate(10), [vibrate]);
    const solidTap = useCallback(() => vibrate(30), [vibrate]);
    const successDoubleTap = useCallback(() => vibrate([30, 50, 30]), [vibrate]);
    const heavyLongTap = useCallback(() => vibrate(100), [vibrate]);

    return {
        vibrate,
        lightTap,
        solidTap,
        successDoubleTap,
        heavyLongTap
    };
};
