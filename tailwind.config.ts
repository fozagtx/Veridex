import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#FFFFFF",
        foreground: "#121212",
        card: "#F6F6F2",
        muted: "#EDEDE7",
        mutedForeground: "#5D5D52",
        primary: "#25243A",
        primaryForeground: "#FFFFFF",
        border: "#D8D8CF",
        input: "#CFCFC6",
        ring: "#686852",
        brand: "#D25611",
        brandDark: "#9E400A",
        brandLight: "#E8804A",
        destructive: "#C92F3A",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "SFMono-Regular", "ui-monospace", "monospace"],
        serif: ["var(--font-instrument-serif)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
