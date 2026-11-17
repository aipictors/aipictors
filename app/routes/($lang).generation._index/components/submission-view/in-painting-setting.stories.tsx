import type { Meta, StoryObj } from "@storybook/react"
import { InPaintingSetting } from "~/routes/($lang).generation._index/components/submission-view/in-painting-setting"

const meta = {
  title: "画像生成/in-painting-setting",
  component: InPaintingSetting,
  parameters: { layout: "centered" },
} satisfies Meta<typeof InPaintingSetting>

export default meta

type Story = StoryObj<typeof InPaintingSetting>

export const Default: Story = {}
