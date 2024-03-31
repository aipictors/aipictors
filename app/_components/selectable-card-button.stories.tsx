import { SelectableCardButton } from "@/app/_components/selectable-card-button"
import type { Meta, StoryObj } from "@storybook/react"

const meta = {
  title: "画像生成/selectable-card-button",
  component: SelectableCardButton,
  parameters: { layout: "centered" },
} satisfies Meta<typeof SelectableCardButton>

export default meta

type Story = StoryObj<typeof SelectableCardButton>

export const デフォルト: Story = {
  args: {
    isSelected: false,
    isDisabled: true,
    children: <img src="https://picsum.photos/seed/1/300/300" alt="" />,
  },
}

export const 選択中: Story = {
  args: {
    isSelected: true,
    isDisabled: true,
    children: <img src="https://picsum.photos/seed/1/300/300" alt="" />,
  },
}
