import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        netflixRed: {
          DEFAULT: "#E50914",
          hover: "#f40612",
          dark: "#B20710",
        },
        visionDark: {
          950: "#08080A",
          900: "#0E0E12",
          850: "#131318",
          800: "#1A1A22",
          700: "#24242F",
          600: "#323240",
          500: "#4B4B5E",
          400: "#717185",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        'glow-red': '0 0 25px -5px rgba(229, 9, 20, 0.35)',
        'glow-red-lg': '0 0 40px -5px rgba(229, 9, 20, 0.45)',
        'subtle-card': '0 8px 30px rgba(0, 0, 0, 0.45)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
export default config;
