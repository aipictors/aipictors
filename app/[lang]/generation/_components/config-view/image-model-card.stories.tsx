import { ImageModelCard } from "@/app/[lang]/generation/_components/config-view/image-model-card"
import type { Meta, StoryObj } from "@storybook/react"

const meta = {
  title: "画像生成/image-model-card",
  component: ImageModelCard,
  parameters: { layout: "centered" },
} satisfies Meta<typeof ImageModelCard>

export default meta

type Story = StoryObj<typeof ImageModelCard>

export const 選択された状態: Story = {
  args: {
    displayName: "モデル名",
    thumbnailImageURL: "https://picsum.photos/seed/1/300/300",
    isActive: true,
  },
}

export const 選択されていない状態: Story = {
  args: {
    displayName: "モデル名",
    thumbnailImageURL: "https://picsum.photos/seed/1/300/300",
    isActive: false,
  },
}
