import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        // Pure black background
        background: "#000000",

        // Surface colors - subtle elevation
        surface: {
          DEFAULT: "#0a0a0a",
          secondary: "#0f0f0f",
          tertiary: "#141414",
          elevated: "#1a1a1a",
        },

        // Gold/Amber accent - premium mono-color
        accent: {
          DEFAULT: "#d4a853",      // Primary gold
          light: "#e8c679",        // Lighter gold
          muted: "#b08d3e",        // Muted gold
          dim: "#8a6d2f",          // Dim gold
          subtle: "#4a3a1a",       // Very subtle gold
        },

        // Text hierarchy - warm tones
        text: {
          primary: "#fafafa",      // Almost white
          secondary: "#a3a3a3",    // Neutral gray
          tertiary: "#737373",     // Muted gray
          muted: "#525252",        // Very muted
        },

        // Border colors
        border: {
          DEFAULT: "#1f1f1f",
          subtle: "#171717",
          accent: "#3d2f14",       // Subtle gold border
        },

        // Status colors - muted versions
        success: "#4ade80",
        error: "#f87171",
        warning: "#fbbf24",
      },
      backgroundImage: {
        "gradient-gold": "linear-gradient(135deg, #d4a853 0%, #b08d3e 100%)",
        "gradient-gold-subtle": "linear-gradient(135deg, rgba(212, 168, 83, 0.1) 0%, rgba(176, 141, 62, 0.05) 100%)",
        "gradient-surface": "linear-gradient(180deg, #0f0f0f 0%, #0a0a0a 100%)",
      },
      boxShadow: {
        "glow": "0 0 20px rgba(212, 168, 83, 0.15)",
        "glow-lg": "0 0 40px rgba(212, 168, 83, 0.2)",
        "glow-sm": "0 0 10px rgba(212, 168, 83, 0.1)",
        "soft": "0 4px 24px rgba(0, 0, 0, 0.4)",
        "elevated": "0 8px 32px rgba(0, 0, 0, 0.5)",
      },
      animation: {
        "shimmer": "shimmer 2s infinite linear",
        "fade-in": "fadeIn 0.4s ease-out forwards",
        "fade-in-up": "fadeInUp 0.5s ease-out forwards",
        "pulse-subtle": "pulseSubtle 2s ease-in-out infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSubtle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
