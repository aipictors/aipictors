import { AppPageNotFound } from "@/components/app/app-page-not-found"
import type { Meta, StoryObj } from "@storybook/react"

const meta = {
  title: "共有/app-page-not-found",
  component: AppPageNotFound,
  parameters: {},
} satisfies Meta<typeof AppPageNotFound>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}
