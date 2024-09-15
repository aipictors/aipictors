import animatePlugin from "tailwindcss-animate"
import { fontFamily } from "tailwindcss/defaultTheme"

/** @type {import('tailwindcss').Config} */

export default {
  plugins: [animatePlugin, require("@tailwindcss/typography")],
  darkMode: ["class", '[data-theme^="dark"]'],
  content: [".storybook/**/*.tsx", "app/**/*.tsx"],
  theme: {
    container: {
      center: true,
      screens: {
        "2xl": "1400px",
      },
    },
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
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        "clear-bright-blue": "#0090f0",
        "line-theme": "#06C755",
        monotone: {
          "50": "hsl(var(--monotone-50))",
          "100": "hsl(var(--monotone-100))",
          "200": "hsl(var(--monotone-200))",
          "300": "hsl(var(--monotone-300))",
          "400": "hsl(var(--monotone-400))",
          "500": "hsl(var(--monotone-500))",
          "600": "hsl(var(--monotone-600))",
          "700": "hsl(var(--monotone-700))",
          "800": "hsl(var(--monotone-800))",
          "900": "hsl(var(--monotone-900))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        animation: {
          "accordion-down": "accordion-down 0.2s ease-out",
          "accordion-up": "accordion-up 0.2s ease-out",
        },
      },
      fontFamily: {
        sans: ['"M PLUS 2 Variable"', ...fontFamily.sans],
      },
      height: {
        main: "calc(100vh - 72px)",
        header: "72px",
      },
      width: {
        aide: "12rem",
      },
      inset: {
        header: "72px",
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "100vw",
          },
        },
      },
    },
  },
}
