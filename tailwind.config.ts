import type { Config } from "tailwindcss";

// Bridge3 Academy design tokens with Universal Dark Mode
// Direction: "premium academic meets Web3-native" — a quiet paper canvas,
// ink text with a green undertone, and ONE confident green accent used sparingly.
// Uses CSS variables for instant, seamless dark mode adaptation across all components.

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "rgb(var(--color-ink) / <alpha-value>)",
          soft: "rgb(var(--color-ink-soft) / <alpha-value>)",
          muted: "rgb(var(--color-ink-muted) / <alpha-value>)",
        },
        paper: {
          DEFAULT: "rgb(var(--color-paper) / <alpha-value>)",
          raised: "rgb(var(--color-paper-raised) / <alpha-value>)",
          hover: "rgb(var(--color-paper-hover) / <alpha-value>)",
        },
        border: {
          DEFAULT: "rgb(var(--color-border) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--color-accent) / <alpha-value>)",
          hover: "rgb(var(--color-accent-hover) / <alpha-value>)",
          tint: "rgb(var(--color-accent-tint) / <alpha-value>)",
          contrast: "#FFFFFF",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        sans: ["var(--font-manrope)", "sans-serif"],
      },
      maxWidth: {
        content: "1140px",
        prose: "68ch",
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        md: "8px",
      },
    },
  },
  plugins: [],
};

export default config;
