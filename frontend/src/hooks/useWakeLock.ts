"use client";

import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * A hook to manage the Screen Wake Lock API to prevent the device from sleeping.
 */
export const useWakeLock = () => {
    const [isLocked, setIsLocked] = useState(false);
    const wakeLockRef = useRef<WakeLockSentinel | null>(null);

    const requestLock = useCallback(async () => {
        if (typeof window === 'undefined' || !('wakeLock' in navigator)) {
            console.warn('Wake Lock API not supported in this browser.');
            return false;
        }

        try {
            const wakeLock = await navigator.wakeLock.request('screen');

            wakeLock.addEventListener('release', () => {
                console.log('Wake Lock was released');
                setIsLocked(false);
                wakeLockRef.current = null;
            });

            wakeLockRef.current = wakeLock;
            setIsLocked(true);
            console.log('Wake Lock is active');
            return true;
        } catch (err: any) {
            console.error(`${err.name}, ${err.message}`);
            setIsLocked(false);
            return false;
        }
    }, []);

    const releaseLock = useCallback(async () => {
        if (wakeLockRef.current) {
            try {
                await wakeLockRef.current.release();
                wakeLockRef.current = null;
                setIsLocked(false);
                console.log('Wake Lock manually released');
            } catch (err: any) {
                console.error(`Failed to release Wake Lock: ${err.message}`);
            }
        }
    }, []);

    // Re-acquire lock if visibility changes while it should be locked
    // The browser releases the wake lock automatically when the tab is hidden
    useEffect(() => {
        const handleVisibilityChange = async () => {
            if (wakeLockRef.current !== null && document.visibilityState === 'visible') {
                // We thought we had a lock, but being hidden released it. Re-acquire.
                await requestLock();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            // Cleanup on unmount
            if (wakeLockRef.current) {
                wakeLockRef.current.release().catch(console.error);
            }
        };
    }, [requestLock]);

    return { isLocked, requestLock, releaseLock };
};
