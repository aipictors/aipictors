import { GenerationSubmitButton } from "@/app/[lang]/generation/_components/editor-submission-view/generation-submit-button"
import type { Meta, StoryObj } from "@storybook/react"

const meta = {
  title: "画像生成/generation-submit-button",
  component: GenerationSubmitButton,
  parameters: { layout: "centered" },
} satisfies Meta<typeof GenerationSubmitButton>

export default meta

type Story = StoryObj<typeof meta>

export const 通常: Story = {
  args: {
    isLoading: false,
    isDisabled: false,
    generatingCount: 0,
    maxGeneratingCount: 30,
    buttonActionCaption: "生成",
  },
}

export const ローディング: Story = {
  args: {
    isLoading: true,
    isDisabled: false,
    generatingCount: 0,
    maxGeneratingCount: 30,
    buttonActionCaption: "生成",
  },
}

export const 無効: Story = {
  args: {
    isLoading: false,
    isDisabled: true,
    generatingCount: 0,
    maxGeneratingCount: 30,
    buttonActionCaption: "生成",
  },
}
