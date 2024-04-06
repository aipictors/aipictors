import { AppLoadingPage } from "@/_components/app/app-loading-page"
import type { Meta, StoryObj } from "@storybook/react"

const meta = {
  title: "共有/app-loading-page",
  component: AppLoadingPage,
  parameters: {},
} satisfies Meta<typeof AppLoadingPage>

export default meta

type Story = StoryObj<typeof AppLoadingPage>

export const Default: Story = {
  args: {},
}
