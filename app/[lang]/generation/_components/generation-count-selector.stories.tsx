import { GenerationCountSelector } from "@/app/[lang]/generation/_components/generation-count-selector"
import type { Meta, StoryObj } from "@storybook/react"

const meta = {
  title: "画像生成/generation-count-selector",
  component: GenerationCountSelector,
  parameters: { layout: "centered" },
} satisfies Meta<typeof GenerationCountSelector>

export default meta

type Story = StoryObj<typeof meta>

export const LITE: Story = {
  args: {
    selectedCount: 0,
    pass: "LITE",
  },
}

export const STANDARD: Story = {
  args: {
    selectedCount: 4,
    pass: "STANDARD",
  },
}
