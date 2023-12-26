import type { Meta, StoryObj } from "@storybook/react"

import { shadcnButton } from "./Button"

//👇 This default export determines where your story goes in the story list
const meta: Meta<typeof shadcnButton> = {
  title: "Aipictors/Button",
  component: shadcnButton,
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof shadcnButton>

export const Primary: Story = {
  args: {
    primary: false,
    label: "Button",
  },
}

// https://seki19.com/post/extension-error-ts-tsx
