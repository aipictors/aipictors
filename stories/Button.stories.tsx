import type { Meta, StoryObj } from "@storybook/react"

import { shadcnButton } from "./Button"

//👇 This default export determines where your story goes in the story list
const meta: Meta<typeof shadcnButton> = {
  title: "Aipictors/Button",
  component: shadcnButton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof shadcnButton>

export const Primary: Story = {
  args: {
    primary: true,
    label: "Primary",
  },
}

export const Secondary: Story = {
  args: {
    variant: "secondary",
    label: "Secondary",
  },
}

export const Destructive: Story = {
  args: {
    variant: "destructive",
    label: "Destructive",
  },
}

export const Outline: Story = {
  args: {
    variant: "outline",
    label: "Outline",
  },
}

export const Ghost: Story = {
  args: {
    variant: "ghost",
    label: "Ghost",
  },
}

export const Link: Story = {
  args: {
    variant: "link",
    label: "Link",
  },
}

// https://seki19.com/post/extension-error-ts-tsx
