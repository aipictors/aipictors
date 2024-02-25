import { join } from "path"
import { GenerationConfigView } from "@/app/[lang]/generation/_components/editor-config-view/generation-config-view"
import { GenerationNegativePromptView } from "@/app/[lang]/generation/_components/editor-negative-prompt-view/generation-negative-prompt-view"
import { GenerationPromptView } from "@/app/[lang]/generation/_components/editor-prompt-view/generation-prompt-view"
import { GenerationSubmissionView } from "@/app/[lang]/generation/_components/editor-submission-view/generation-submit-view"
import { GenerationTaskView } from "@/app/[lang]/generation/_components/editor-task-view/generation-task-view"
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
      config={<GenerationConfigView />}
      promptEditor={<GenerationPromptView />}
      negativePromptEditor={<GenerationNegativePromptView />}
      submission={<GenerationSubmissionView termsText={termsMarkdownText} />}
      taskList={<GenerationTaskView />}
    />
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default GenerationPage
