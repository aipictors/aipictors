import "../app/globals.css"

import type { Preview } from "@storybook/react"
import { cn } from "../lib/utils"

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
        segments: [["locale", "ja"]],
      },
    },
  },
  decorators: [
    (Story) => {
      return (
        <div
          className={cn(
            "min-h-screen font-sans antialiased",
            notoSansFont.variable,
          )}
        >
          <Story />
        </div>
      )
    },
  ],
}

export default preview
