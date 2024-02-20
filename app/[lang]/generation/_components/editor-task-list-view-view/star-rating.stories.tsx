import { StarRating } from "@/app/[lang]/generation/_components/editor-task-list-view-view/star-rating"
import type { Meta, StoryObj } from "@storybook/react"

const meta = {
  title: "画像生成/star-rating",
  component: StarRating,
  parameters: { layout: "centered" },
} satisfies Meta<typeof StarRating>

export default meta

type Story = StoryObj<typeof meta>

export const デフォルト: Story = {
  args: {
    value: 2,
  },
}

export const 星5: Story = {
  args: {
    value: 5,
  },
}
