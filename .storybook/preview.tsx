import type { Preview } from "@storybook/react"
import { Noto_Sans_JP } from "next/font/google"
import "../app/globals.css"

const notoSansJp = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  preload: false,
})

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    nextjs: {
      appDirectory: true,
      navigation: {
        segments: [["lang", "ja"]],
      },
    },
  },
}

export default preview
