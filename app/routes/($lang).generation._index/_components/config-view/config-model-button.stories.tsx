import { ConfigModelButton } from "@/routes/($lang).generation._index/_components/config-view/config-model-button"
import type { Meta, StoryObj } from "@storybook/react"

const meta = {
  title: "画像生成/config-modal-button",
  component: ConfigModelButton,
  parameters: { layout: "centered" },
} satisfies Meta<typeof ConfigModelButton>

export default meta

type Story = StoryObj<typeof ConfigModelButton>

export const 選択されていない: Story = {
  args: {
    imageURL: "https://placekitten.com/200/200",
    name: "デフォルト",
    isSelected: false,
  },
}

export const 選択されている: Story = {
  args: {
    imageURL: "https://placekitten.com/200/200",
    name: "デフォルト",
    isSelected: true,
  },
}
