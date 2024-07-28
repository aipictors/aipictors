import { AppDevelopmentPage } from "~/components/app/app-development-page"
import type { Meta, StoryObj } from "@storybook/react"

const meta = {
  title: "共有/app-development-page",
  component: AppDevelopmentPage,
  parameters: {},
} satisfies Meta<typeof AppDevelopmentPage>

export default meta

type Story = StoryObj<typeof AppDevelopmentPage>

export const Default: Story = {
  args: {},
}
