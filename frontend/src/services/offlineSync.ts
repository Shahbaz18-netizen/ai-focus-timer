import { get, set } from 'idb-keyval';
import { orchestratorService } from './api';

const SYNC_QUEUE_KEY = 'aura-offline-sync-queue';

export type SyncAction = {
    id: string;
    type: 'CREATE_TASK' | 'UPDATE_TASK' | 'DELETE_TASK' | 'LOG_SESSION';
    payload: any;
    timestamp: number;
};

export const offlineSyncService = {
    async enqueueAction(action: Omit<SyncAction, 'id' | 'timestamp'>) {
        if (typeof window === 'undefined') return;

        const queue: SyncAction[] = (await get(SYNC_QUEUE_KEY)) || [];

        const fullAction: SyncAction = {
            ...action,
            id: crypto.randomUUID(),
            timestamp: Date.now()
        };

        queue.push(fullAction);
        await set(SYNC_QUEUE_KEY, queue);
        console.log(`[Offline Sync] Queued action: ${action.type}`, fullAction);
    },

    async processQueue() {
        if (typeof window === 'undefined' || !navigator.onLine) return;

        const queue: SyncAction[] = (await get(SYNC_QUEUE_KEY)) || [];
        if (queue.length === 0) return;

        console.log(`[Offline Sync] Processing ${queue.length} pending actions...`);
        const failedQueue: SyncAction[] = [];

        for (const action of queue) {
            try {
                switch (action.type) {
                    case 'CREATE_TASK':
                        await orchestratorService.createTask(action.payload.userId, action.payload.title);
                        // Backend will create a new real ID. We rely on a frontend refresh to sync it.
                        break;
                    case 'UPDATE_TASK':
                        // If it's a temporary task ID (<0), we technically shouldn't patch it directly if it hasn't synced yet.
                        // For a robust system, we would map temp IDs to real IDs.
                        // For now, only send updates for real tasks.
                        if (action.payload.taskId > 0) {
                            await orchestratorService.updateTask(action.payload.taskId, action.payload.isCompleted);
                        }
                        break;
                    case 'DELETE_TASK':
                        if (action.payload.taskId > 0) {
                            await orchestratorService.deleteTask(action.payload.taskId);
                        }
                        break;
                    case 'LOG_SESSION':
                        await orchestratorService.logSession(
                            action.payload.userId,
                            action.payload.taskIntent,
                            action.payload.durationMinutes,
                            action.payload.startTime
                        );
                        break;
                }
                console.log(`[Offline Sync] Synced: ${action.type}`);
            } catch (error) {
                console.error(`[Offline Sync] Failed to sync action: ${action.type}`, error);
                failedQueue.push(action);
            }
        }

        // Save only the ones that failed (to retry next time)
        await set(SYNC_QUEUE_KEY, failedQueue);

        if (failedQueue.length === 0) {
            console.log('[Offline Sync] All actions synced successfully.');
        } else {
            console.warn(`[Offline Sync] ${failedQueue.length} actions failed and remain in queue.`);
        }
    }
};

// Global Listeners to trigger sync when coming online
if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
        offlineSyncService.processQueue();
    });
}
