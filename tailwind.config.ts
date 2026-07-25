import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
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
        surface: "var(--background)",
        "card-bg": "var(--card-bg)",
        "text-header": "var(--foreground)",
        "text-body": "var(--secondary)",
        "border-soft": "var(--border)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        albers: {
          pink: {
            soft: "var(--albers-pink-soft)",
            bold: "var(--albers-pink-bold)",
          },
          purple: {
            soft: "var(--albers-purple-soft)",
            bold: "var(--albers-purple-bold)",
          },
          blue: {
            soft: "var(--albers-blue-soft)",
            bold: "var(--albers-blue-bold)",
          },
          green: {
            soft: "var(--albers-green-soft)",
            bold: "var(--albers-green-bold)",
          },
        }
      },
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
        serif: ["var(--font-serif)", "serif"],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
export default config;
