import { join } from "path"
import { GenerationEditorConfigView } from "@/app/[lang]/generation/_components/editor-config-view/generation-editor-config-view"
import { GenerationEditorNegativePromptView } from "@/app/[lang]/generation/_components/editor-negative-prompt-view/generation-editor-negative-prompt-view"
import { GenerationEditorPromptView } from "@/app/[lang]/generation/_components/editor-prompt-view/generation-editor-prompt-view"
import { GenerationEditorSubmissionView } from "@/app/[lang]/generation/_components/editor-submission-view/generation-editor-submit-view"
import { GenerationEditorTaskView } from "@/app/[lang]/generation/_components/editor-task-view-view/generation-editor-task-view"
import { GenerationEditorLayout } from "@/app/[lang]/generation/_components/generation-editor-layout"
import { readFile } from "fs/promises"
import type { Metadata } from "next"

/**
 * 画像生成
 * @returns
 */
const GenerationPage = async () => {
  /**
   * 利用規約
   */
  const termsMarkdownText = await readFile(
    join(process.cwd(), "assets/image-generation-terms.md"),
    "utf-8",
  )

  /**
   * 説明
   */
  // const descriptionMarkdownText = await readFile(
  //   join(process.cwd(), "assets/image-generation-description.md"),
  //   "utf-8",
  // )

  return (
    <GenerationEditorLayout
      config={<GenerationEditorConfigView />}
      promptEditor={<GenerationEditorPromptView />}
      negativePromptEditor={<GenerationEditorNegativePromptView />}
      submission={
        <GenerationEditorSubmissionView termsMarkdownText={termsMarkdownText} />
      }
      taskList={<GenerationEditorTaskView />}
    />
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default GenerationPage
