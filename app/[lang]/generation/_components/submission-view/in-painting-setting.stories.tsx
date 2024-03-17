import { InPaintingSetting } from "@/app/[lang]/generation/_components/submission-view/in-painting-setting"
import type { Meta, StoryObj } from "@storybook/react"

const meta = {
  title: "画像生成/in-painting-setting",
  component: InPaintingSetting,
  parameters: { layout: "centered" },
} satisfies Meta<typeof InPaintingSetting>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
