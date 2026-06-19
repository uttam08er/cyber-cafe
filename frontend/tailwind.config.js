/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Syne", "system-ui", "sans-serif"],
        signature: ['"Dancing Script"', "cursive"],
        mono: ["JetBrains Mono", "monospace"],
        display: ["Syne", "sans-serif"],
      },
      appName: "Shaurya eServices",
      colors: {
        brand: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
        accent: {
          110: "#e4e4e4ff",
          120: "#989898ff",
          130: "#565656ff",

          210: "#f7dbb5ff",
          220: "#dc9d45ff",
          230: "#BA7517",

          310: "#ffeeee",
          320: "#fb923c",
          330: "#d20505",

          410: "#E24B4A",
          420: "#E24B4A",
          430: "#E24B4A",

          510: "#b9f5e2ff",
          520: "#1D9E75",
          530: "#1D9E75",

          610: "#bdb8f4ff",
          620: "#7F77DD",
          630: "#7F77DD",

          710: "#bfdbf6ff",
          720: "#185FA5",
          730: "#185FA5",
        },
        surface: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#c6d2e1",
          400: "#9ca9b5",
          500: "#6e7379",
          600: "#1e293b",
          700: "#1e293b",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-slow": "pulse 3s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      boxShadow: {
        brand: "0 4px 24px -4px rgba(14, 165, 233, 0.3)",
        card: "0 2px 12px -2px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)",
      },
    },
  },
  plugins: [],
};
