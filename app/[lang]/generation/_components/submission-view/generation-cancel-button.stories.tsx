import { GenerationCancelButton } from "@/[lang]/generation/_components/submission-view/generation-cancel-button"
import type { Meta, StoryObj } from "@storybook/react"

const meta = {
  title: "画像生成/generation-cancel-button",
  component: GenerationCancelButton,
  parameters: { layout: "centered" },
} satisfies Meta<typeof GenerationCancelButton>

export default meta

type Story = StoryObj<typeof GenerationCancelButton>

export const デフォルト: Story = {
  args: {
    isLoading: false,
  },
}

export const ローディングあり: Story = {
  args: {
    isLoading: true,
  },
}
