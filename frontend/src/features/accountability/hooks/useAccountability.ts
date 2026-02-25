import { useState, useEffect } from 'react';
import { orchestratorService } from '@/services/api';

export const useAccountability = (userId: string, hasPlan: boolean) => {
    const [showCheckIn, setShowCheckIn] = useState(false);
    const [targetTime, setTargetTime] = useState<string | null>(null);

    useEffect(() => {
        if (!hasPlan) return;

        const checkPlan = async () => {
            try {
                const res = await orchestratorService.getLatestPlan(userId);
                if (res.status === "success" && res.data?.tasks?.target_end_time) {
                    setTargetTime(res.data.tasks.target_end_time);
                }
            } catch (e) {
                console.error("Accountability sync failed", e);
            }
        };

        checkPlan();
    }, [userId, hasPlan]);

    useEffect(() => {
        if (!targetTime) return;

        const interval = setInterval(() => {
            const now = new Date();
            const [hours, minutes] = targetTime.split(':').map(Number);
            const target = new Date();
            target.setHours(hours, minutes, 0, 0);

            // Trigger if current time is past target time (within 1 minute margin to avoid repeated triggers if we store state purely in memory)
            // In a real app, we'd store "checkedInToday" in API/LocalStorage
            const diff = now.getTime() - target.getTime();

            // Trigger only if within first 5 minutes of passing time (simple logic for now)
            if (diff > 0 && diff < 5 * 60 * 1000) {
                const alreadyCheckedKey = `aura_checked_${new Date().toDateString()}`;
                if (!localStorage.getItem(alreadyCheckedKey)) {
                    setShowCheckIn(true);
                    localStorage.setItem(alreadyCheckedKey, "true");
                }
            }
        }, 10000); // Check every 10s

        return () => clearInterval(interval);
    }, [targetTime]);

    return { showCheckIn, setShowCheckIn, targetTime };
};
