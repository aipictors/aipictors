import type { Config } from "tailwindcss"

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  darkMode: ["selector", '[data-theme^="dark"]'], // dark で始まるすべてのテーマに対応
  theme: {
    extend: {
      // 既存のCSSカスタムプロパティを使用
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        monotone: {
          50: "hsl(var(--monotone-50))",
          100: "hsl(var(--monotone-100))",
          200: "hsl(var(--monotone-200))",
          300: "hsl(var(--monotone-300))",
          400: "hsl(var(--monotone-400))",
          500: "hsl(var(--monotone-500))",
          600: "hsl(var(--monotone-600))",
          700: "hsl(var(--monotone-700))",
          800: "hsl(var(--monotone-800))",
          900: "hsl(var(--monotone-900))",
        },
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
}

export default config
