import { resolve } from "path"
import type { StorybookConfig } from "@storybook/nextjs"

const config: StorybookConfig = {
  stories: ["../components/**/*.stories.tsx", "../app/**/*.stories.tsx"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-onboarding",
    "@storybook/addon-interactions",
    "@storybook/addon-mdx-gfm",
  ],
  framework: {
    name: "@storybook/nextjs",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
  async webpackFinal(config) {
    if (config.resolve === undefined) {
      return config
    }
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": resolve(__dirname, ".."),
    }
    return config
  },
}

export default config
