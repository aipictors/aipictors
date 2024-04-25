import type { Meta, StoryObj } from "@storybook/react"
import InPaintingEditImage from "build/server/assets/in-painting-edit-image-RIT2co96"

const meta = {
  title: "画像生成/in-painting-edit-image",
  component: InPaintingEditImage,
  parameters: { layout: "centered" },
} satisfies Meta<typeof InPaintingEditImage>

export default meta

type Story = StoryObj<typeof InPaintingEditImage>

export const 通常: Story = {
  args: {
    imageUrl: "https://picsum.photos/800",
    isLoading: false,
    onLoaded() {},
  },
}

export const ローディング中: Story = {
  args: {
    imageUrl: "https://picsum.photos/800",
    isLoading: true,
    onLoaded() {},
  },
}
