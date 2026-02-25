
export interface Scene {
    id: string;
    name: string;
    type: 'video' | 'image' | 'youtube';
    url: string;
    thumbnail?: string;
    tags: string[];
}

export const SCENES: Scene[] = [
    {
        id: 'forest-river',
        name: 'Forest River',
        type: 'youtube',
        url: 'S0wXgt_3W04', // Verified 4K Moving River
        tags: ['nature', 'water', 'outdoors']
    },
    {
        id: 'rainy-cafe',
        name: 'Rainy Cafe',
        type: 'youtube',
        url: 'mPZkdNFkNps', // Verified Rainy window
        tags: ['rain', 'cafe', 'calm']
    },
    {
        id: 'ocean',
        name: 'Ocean Waves',
        type: 'youtube',
        url: '52aSNmVsvFk', // Verified Ocean Waves
        tags: ['ocean', 'water', 'calm']
    },
    {
        id: 'fireplace',
        name: 'Fireplace',
        type: 'youtube',
        url: 'L_LUpnjgPso', // Verified Fireplace
        tags: ['fire', 'warm', 'night']
    },
    {
        id: 'deep-focus',
        name: 'Deep Focus',
        type: 'image',
        // Very dark radial gradient matching the accent color (#F1C40F)
        url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><defs><radialGradient id="grad1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%"><stop offset="0%" style="stop-color:rgb(30, 24, 2);stop-opacity:1" /><stop offset="100%" style="stop-color:rgb(5, 5, 5);stop-opacity:1" /></radialGradient></defs><rect width="100%" height="100%" fill="url(%23grad1)" /></svg>',
        tags: ['dark', 'abstract', 'minimal', 'theme']
    }
];
