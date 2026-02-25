export const APP_THEME = {
    colors: {
        background: "#050505",
        glass: "rgba(255, 255, 255, 0.02)",
        border: "rgba(255, 255, 255, 0.05)",
        accent: "#F1C40F", // Aura Yellow
        text: "#e0e0e0",
        textDim: "#888",
        pureWhite: "#ffffff",
    },
    fonts: {
        body: "Inter, sans-serif",
        mono: "JetBrains Mono, monospace",
    }
};

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
