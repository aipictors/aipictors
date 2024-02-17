import "../app/globals.css"

// biome-ignore lint/nursery/noUnusedImports: <explanation>
import React from "react"

import type { Preview } from "@storybook/react"
import { notoSansFont } from "../app/_fonts/noto-sans-font"
import { cn } from "../lib/utils"

console.log(notoSansFont)

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
