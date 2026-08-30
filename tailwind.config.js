/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#090A0F",
          card: "#131620",
          elevated: "#1C2030",
          border: "#282E42",
        },
        primary: {
          DEFAULT: "#10B981", // Emerald 500
          light: "#34D399",
          dark: "#059669",
        },
        expense: {
          DEFAULT: "#F43F5E", // Rose 500
          light: "#FB7185",
          dark: "#E11D48",
        },
        accent: {
          purple: "#8B5CF6",
          amber: "#F59E0B",
          cyan: "#06B6D4",
          blue: "#3B82F6",
        },
        content: {
          primary: "#F8FAFC",
          secondary: "#94A3B8",
          tertiary: "#64748B",
          muted: "#475569",
        },
      },
    },
  },
  plugins: [],
};
