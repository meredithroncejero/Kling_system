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
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        kling: {
          blue: "hsl(var(--kling-blue))",
          green: "hsl(var(--kling-green))",
          red: "hsl(var(--kling-red))",
          pink: "hsl(var(--kling-pink))",
          yellow: "hsl(var(--kling-yellow))",
          gold: "hsl(var(--kling-gold))",
          forest: "hsl(var(--kling-forest))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
      },
      fontFamily: {
        sans: ["var(--font-nunito)", "system-ui", "sans-serif"],
        display: ["var(--font-fredoka)", "system-ui", "sans-serif"],
        script: ["var(--font-caveat)", "cursive"],
      },
      boxShadow: {
        kling: "0 4px 20px -4px hsl(var(--kling-pink) / 0.25)",
        bead: "0 2px 8px hsl(var(--kling-gold) / 0.3)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
