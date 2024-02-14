import { ImageModelCard } from "@/app/[lang]/generation/_components/image-model-card"
import type { Meta, StoryObj } from "@storybook/react"

const meta = {
  title: "サイト/generation/image-model-card",
  component: ImageModelCard,
  parameters: {},
} satisfies Meta<typeof ImageModelCard>

export default meta

type Story = StoryObj<typeof meta>

export const Active: Story = {
  args: {
    displayName: "モデル名",
    thumbnailImageURL: "https://picsum.photos/seed/1/300/300",
    isActive: true,
  },
}

export const Inactive: Story = {
  args: {
    displayName: "モデル名",
    thumbnailImageURL: "https://picsum.photos/seed/1/300/300",
    isActive: false,
  },
}
