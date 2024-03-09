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
    config: <div className="h-full bg-red-500">{"config"}</div>,
    promptEditor: <div className="h-full bg-blue-500">{"promptEditor"}</div>,
    negativePromptEditor: (
      <div className="h-full bg-green-500">{"negativePromptEditor"}</div>
    ),
    taskList: <div className="h-full bg-yellow-500">{"history"}</div>,
    submission: <div className="h-full bg-pink-500">{"submission"}</div>,
    taskDetails: <div className="h-full bg-indigo-500">{"taskDetails"}</div>,
    taskContentPreview: (
      <div className="h-full bg-purple-500">{"taskContent"}</div>
    ),
  },
}
