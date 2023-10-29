import {
  extendTheme,
  theme as defaultTheme,
  withDefaultColorScheme,
} from "@chakra-ui/react"

const baseTheme = extendTheme({
  config: {
    // initialColorMode: "light",
    useSystemColorMode: true,
  },
  colors: {
    primary: defaultTheme.colors.blue,
    background: {
      light: defaultTheme.colors.white,
      dark: defaultTheme.colors.gray[800],
    },
  },
  fonts: {
    body: ["'Noto Sans JP'", "system-ui", "sans-serif"].join(","),
    heading: ["'Noto Sans JP'", "system-ui", "sans-serif"].join(","),
    mono: ["Menlo", "monospace"].join(","),
  },
  styles: {
    global: {
      html: {
        overscrollBehaviorY: "none",
        overflowY: "auto",
      },
      "*": {
        WebkitTapHighlightColor: "transparent",
      },
      "body::-webkit-scrollbar": {
        display: "none",
      },
      "nav::-webkit-scrollbar": {
        display: "none",
      },
    },
  },
})

export const theme = extendTheme(
  baseTheme,
  withDefaultColorScheme({
    colorScheme: "primary",
    components: ["Tabs", "Switch"],
  }),
)
