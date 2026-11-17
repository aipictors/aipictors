import type { Meta, StoryObj } from "@storybook/react"
import { GenerationCancelButton } from "~/routes/($lang).generation._index/components/submission-view/generation-cancel-button"

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
