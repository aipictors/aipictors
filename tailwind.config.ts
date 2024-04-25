import type { Config } from "tailwindcss"
import animatePlugin from "tailwindcss-animate"
import { fontFamily } from "tailwindcss/defaultTheme"

export default {
  plugins: [animatePlugin],
  darkMode: ["class"],
  content: ["app/**/*.tsx"],
  theme: {
    /**
     * shadcn/ui
     */
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      /**
       * shadcn/ui
       */
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
        /**
         * custom color
         */
        "clear-bright-blue": "#0090f0",
      },
      /**
       * shadcn/ui
       */
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      /**
       * shadcn/ui
       */
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      /**
       * shadcn/ui
       */
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      /**
       * 追加: カスタムフォントに使用
       */
      fontFamily: {
        sans: ['"Noto Sans JP Variable"', ...fontFamily.sans],
      },
      height: {
        /**
         * 追加: ヘッダーを除いた高さ
         */
        main: "calc(100vh - 72px)",
        /**
         * 追加: ヘッダーの高さ
         */
        header: "72px",
      },
      width: {
        /**
         * 追加: 左のメニュー部分
         */
        aide: "12rem",
      },
      inset: {
        /**
         * 追加: ヘッダーの高さ
         */
        header: "72px",
      },
    },
  },
} satisfies Config
