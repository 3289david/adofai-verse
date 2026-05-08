import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        page: "#09091a",
        card: "#111127",
        "card-hover": "#161636",
        line: "#1e1e40",
        "line-hi": "#2a2a58",
        fire: "#ff3355",
        "fire-2": "#ff8800",
        ice: "#0077ff",
        "ice-2": "#00ccff",
        soft: "#6666aa",
        dim: "#33334a",
        easy: "#44dd88",
        medium: "#ffdd00",
        hard: "#ff8800",
        extreme: "#ff3355",
        ultra: "#cc44ff",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
