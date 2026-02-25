import { motion } from 'framer-motion';
import { Participant } from '../types';

interface PulseAvatarProps {
    participant: Participant;
}

export const PulseAvatar = ({ participant }: PulseAvatarProps) => {
    const statusColor = {
        focusing: 'bg-green-500',
        paused: 'bg-yellow-500',
        idle: 'bg-gray-500',
        break: 'bg-blue-500',
    }[participant.status] || 'bg-gray-500';

    return (
        <div className="relative flex flex-col items-center gap-2">
            <div className="relative">
                {participant.status === 'focusing' && (
                    <motion.div
                        className={`absolute inset-0 rounded-full ${statusColor} opacity-50 blur-md`}
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 0.2, 0.5],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                        }}
                    />
                )}
                <div className={`w-12 h-12 rounded-full border-2 border-white/10 ${statusColor}/20 flex items-center justify-center overflow-hidden bg-black/50`}>
                    {participant.avatar_url ? (
                        <img src={participant.avatar_url} alt={participant.username} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-sm font-bold uppercase">{participant.username.slice(0, 2)}</span>
                    )}
                </div>
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-black ${statusColor}`} />
            </div>
            <span className="text-xs text-white/50">{participant.username}</span>
        </div>
    );
};
