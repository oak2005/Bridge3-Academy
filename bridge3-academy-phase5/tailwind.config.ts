import type { Config } from "tailwindcss";

// Bridge3 Academy design tokens
// Direction: "premium academic meets Web3-native" — a quiet paper canvas,
// ink text with a green undertone (ties the palette together instead of
// pure black), and ONE confident green accent used sparingly for the
// things that matter (primary actions, verified/proof-of-work states).
// Deliberately avoiding: cream+terracotta, near-black+neon-accent, and
// uniform rounded-shadow "SaaS card" treatments.

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#1C2A22", // primary text — near-black with a green undertone
          soft: "#3A473F",    // secondary text
          muted: "#5C6B60",   // tertiary / helper text
        },
        paper: {
          DEFAULT: "#F5F5EF", // page background — cool bone, not the flagged warm cream
          raised: "#FFFFFF",  // cards / raised surfaces
        },
        border: {
          DEFAULT: "#DEDFD3", // hairline dividers and outlines
        },
        accent: {
          DEFAULT: "#3E9A5C", // primary CTA green
          hover: "#347F4C",
          tint: "#E3F1E2",    // light green for badges / verified states
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
