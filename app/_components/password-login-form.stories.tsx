import { PasswordLoginForm } from "@/app/_components/password-login-form"
import type { Meta, StoryObj } from "@storybook/react"

const meta = {
  title: "全体/password-login-form",
  component: PasswordLoginForm,
  parameters: { layout: "centered" },
} satisfies Meta<typeof PasswordLoginForm>

export default meta

type Story = StoryObj<typeof PasswordLoginForm>

export const Default: Story = {
  args: {
    isLoading: false,
  },
}
