import animate from "tailwindcss-animate"
import { fontFamily } from "tailwindcss/defaultTheme"
import shadcnConfig from "./tailwind.config.shadcn"
import typography from "@tailwindcss/typography"
import type { Config } from "tailwindcss"

export default {
  plugins: [animate, typography],
  darkMode: ["class", '[data-theme^="dark"]'],
  content: [".storybook/**/*.tsx", "app/**/*.tsx"],
  theme: {
    container: shadcnConfig.theme.container,
    extend: {
      colors: {
        ...shadcnConfig.theme.extend.colors,
      },
      borderRadius: {
        ...shadcnConfig.theme.extend.borderRadius,
      },
      keyframes: {
        ...shadcnConfig.theme.extend.keyframes,
      },
      animation: {
        ...shadcnConfig.theme.extend.animation,
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
} satisfies Config
