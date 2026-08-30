/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#0F1012", // Cool Dark Slate Ground
          card: "#17181C",     // Dark Charcoal Step 1
          elevated: "#212329", // Muted Slate Step 2
          border: "#2A2D35",   // Ultra-subtle rule
        },
        primary: {
          DEFAULT: "#10B981", // Electric Precision Emerald
          light: "#34D399",
          dark: "#059669",
        },
        expense: {
          DEFAULT: "#EF4444", // Precision Crimson
          light: "#F87171",
          dark: "#DC2626",
        },
        accent: {
          gold: "#F59E0B",     // Precision Amber
          amber: "#F59E0B",
          purple: "#8B5CF6",   // Precision Violet
          blue: "#3B82F6",     // Precision Ice Blue
          emerald: "#10B981",
        },
        content: {
          primary: "#F3F4F6",   // High-contrast pure text
          secondary: "#9CA3AF", // Secondary values & subheaders
          tertiary: "#6B7280",  // Overlines, labels, timestamps
          muted: "#4B5563",     // Dividers, disabled states
        },
      },
    },
  },
  plugins: [],
};
