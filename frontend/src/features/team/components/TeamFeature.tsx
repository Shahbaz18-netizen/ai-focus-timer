import { useState } from 'react';
import { TeamDashboard } from './TeamDashboard';
import { RoomView } from './RoomView';

interface TeamFeatureProps {
    userId: string;
    username: string;
    userStatus: 'focusing' | 'paused' | 'idle';
}

export const TeamFeature = ({ userId, username, userStatus }: TeamFeatureProps) => {
    const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);

    return (
        <div className="h-full w-full">
            {currentRoomId ? (
                <RoomView
                    roomId={currentRoomId}
                    userId={userId}
                    username={username}
                    onLeave={() => setCurrentRoomId(null)}
                    userStatus={userStatus}
                />
            ) : (
                <TeamDashboard
                    onJoinRoom={(roomId) => setCurrentRoomId(roomId)}
                    userId={userId}
                />
            )}
        </div>
    );
};
