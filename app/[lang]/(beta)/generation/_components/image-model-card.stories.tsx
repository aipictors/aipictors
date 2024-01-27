import { ImageModelCard } from "@/app/[lang]/(beta)/generation/_components/image-model-card"
import type { Meta, StoryObj } from "@storybook/react"

const meta = {
  title: "サイト/generation/image-model-card",
  component: ImageModelCard,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    imageURL: { type: "string" },
  },
} satisfies Meta<typeof ImageModelCard>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    name: "ImageModelCard",
    imageURL: "https://placehold.jp/150x150.png",
    isActive: false,
  },
}
