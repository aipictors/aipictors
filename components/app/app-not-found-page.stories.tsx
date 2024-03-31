import { AppNotFoundPage } from "@/components/app/app-not-found-page"
import type { Meta, StoryObj } from "@storybook/react"

const meta = {
  title: "共有/app-not-found-page",
  component: AppNotFoundPage,
  parameters: {},
} satisfies Meta<typeof AppNotFoundPage>

export default meta

type Story = StoryObj<typeof AppNotFoundPage>

export const Default: Story = {
  args: {},
}
