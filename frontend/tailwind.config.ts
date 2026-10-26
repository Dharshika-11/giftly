import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-playfair)", "Georgia", "serif"],
      },
      colors: {
        brand: {
          50: "#fdf4ff",
          100: "#fae8ff",
          200: "#f3d0fe",
          300: "#e9aafe",
          400: "#d97afa",
          500: "#c249f5",
          600: "#aa28d8",
          700: "#901db4",
          800: "#761c92",
          900: "#601b76",
          950: "#3e0552",
        },
        warm: {
          50: "#fff9f0",
          100: "#fef0d8",
          200: "#fcdcaa",
          300: "#f9c173",
          400: "#f59e3c",
          500: "#f27c14",
          600: "#e35e0a",
          700: "#bc430b",
          800: "#943510",
          900: "#782d10",
        },
        rose: {
          gift: "#ff6b8b",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "bounce-soft": "bounceSoft 1s ease-in-out infinite",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        shimmer: "shimmer 1.5s linear infinite",
        typing: "typing 1.2s steps(3) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        bounceSoft: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        typing: {
          "0%": { content: "." },
          "33%": { content: ".." },
          "66%": { content: "..." },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
