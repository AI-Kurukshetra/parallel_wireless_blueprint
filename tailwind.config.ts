import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        surface: "#f1f6fb",
        ink: "#13263c",
        accent: {
          DEFAULT: "#4682B4",
          foreground: "#f8fbff"
        },
        success: "#0e9f6e",
        warning: "#d97706",
        danger: "#dc2626",
        telecom: {
          50: "#eef5fb",
          100: "#dbe9f5",
          300: "#97b9d7",
          500: "#4682B4",
          700: "#2e5f87",
          900: "#1a3550"
        }
      },
      boxShadow: {
        panel: "0 20px 40px -24px rgba(19, 38, 60, 0.28)"
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
