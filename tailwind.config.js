/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#141312", // Warm Deep Charcoal
          card: "#1D1B19",     // Warm Card Surface
          elevated: "#282522", // Elevated Warm Stone
          border: "#3B3632",   // Warm Hairline Border
        },
        primary: {
          DEFAULT: "#2A9D60", // Sage Forest Green
          light: "#34D399",
          dark: "#1B6D42",
        },
        expense: {
          DEFAULT: "#DC4C38", // Terracotta / Japanese Vermilion
          light: "#F87171",
          dark: "#B91C1C",
        },
        accent: {
          gold: "#C69230",     // Warm Ochre Gold
          purple: "#7C3AED",
          amber: "#D97706",    // Warm Amber
          blue: "#4338CA",     // Washed Denim / Indigo
          sand: "#D6CFBF",
        },
        content: {
          primary: "#F5F2EB",   // Ivory Parchment
          secondary: "#D6CFBF", // Warm Sand
          tertiary: "#948B7E",  // Muted Ochre
          muted: "#5A5248",     // Dark Warm Muted
        },
      },
    },
  },
  plugins: [],
};
