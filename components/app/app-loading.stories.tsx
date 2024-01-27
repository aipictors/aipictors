import { AppLoading } from "@/components/app/app-loading"
import type { Meta, StoryObj } from "@storybook/react"

const meta = {
  title: "共有/app-loading",
  component: AppLoading,
  parameters: {},
} satisfies Meta<typeof AppLoading>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}
