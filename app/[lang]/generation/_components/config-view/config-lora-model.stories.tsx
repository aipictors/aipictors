import { ConfigLoraModel } from "@/[lang]/generation/_components/config-view/config-lora-model"
import type { Meta, StoryObj } from "@storybook/react"

const meta = {
  title: "画像生成/config-lora-model",
  component: ConfigLoraModel,
  parameters: { layout: "centered" },
} satisfies Meta<typeof ConfigLoraModel>

export default meta

type Story = StoryObj<typeof ConfigLoraModel>

export const Story: Story = {
  args: {
    imageURL: "https://placekitten.com/200/200",
    name: "サンプル",
    description: "サンプルの説明",
    value: 0.4,
  },
}
