/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ---- Design tokens: grounded in kanjivaram silk + zari thread ----
        maroon: {
          DEFAULT: "#7A1B2B", // primary — kanjivaram silk red
          dark: "#54101C",
          light: "#9A2E40",
        },
        gold: {
          DEFAULT: "#B8862E", // zari thread gold
          light: "#D9B26A",
          soft: "#F0E2C4",
        },
        ivory: "#FBF5EA",     // background — raw silk / undyed cotton
        charcoal: "#2A2320",  // primary text
        blush: "#E7C3B4",     // soft accent (sindoor-adjacent)
      },
      fontFamily: {
        display: ["'Cormorant Garamond'", "serif"],
        body: ["'Jost'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"], // used for order numbers / measurements
      },
      backgroundImage: {
        "stitch-line":
          "repeating-linear-gradient(90deg, currentColor 0 10px, transparent 10px 18px)",
      },
    },
  },
  plugins: [],
};
