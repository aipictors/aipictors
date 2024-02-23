import { GenerationEditorLayout } from "@/app/[lang]/generation/_components/generation-editor-layout"
import type { Meta, StoryObj } from "@storybook/react"

const meta = {
  title: "画像生成/generation-editor-layout",
  component: GenerationEditorLayout,
} satisfies Meta<typeof GenerationEditorLayout>

export default meta

type Story = StoryObj<typeof meta>

export const LITE: Story = {
  args: {
    config: <div className="bg-red-500 h-full">{"config"}</div>,
    promptEditor: <div className="bg-blue-500 h-full">{"promptEditor"}</div>,
    negativePromptEditor: (
      <div className="bg-green-500 h-full">{"negativePromptEditor"}</div>
    ),
    taskList: <div className="bg-yellow-500 h-full">{"history"}</div>,
    submission: <div className="bg-pink-500 h-full">{"submission"}</div>,
  },
}
