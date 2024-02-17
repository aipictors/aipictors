import { AppLoadingPage } from "@/components/app/app-loading-page"
import type { Meta, StoryObj } from "@storybook/react"

const meta = {
  title: "共有/app-loading-page",
  component: AppLoadingPage,
  parameters: {},
} satisfies Meta<typeof AppLoadingPage>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}
