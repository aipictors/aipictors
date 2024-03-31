import { GenerationCountSelect } from "@/app/[lang]/generation/_components/submission-view/generation-count-select"
import type { Meta, StoryObj } from "@storybook/react"

const meta = {
  title: "画像生成/generation-count-selector",
  component: GenerationCountSelect,
  parameters: { layout: "centered" },
} satisfies Meta<typeof GenerationCountSelect>

export default meta

type Story = StoryObj<typeof GenerationCountSelect>

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
