import { join } from "path"
import { GenerationEditorConfigView } from "@/app/[lang]/generation/_components/editor-config-view/generation-editor-config-view"
import { GenerationEditorNegativePromptView } from "@/app/[lang]/generation/_components/editor-negative-prompt-view/generation-editor-negative-prompt-view"
import { GenerationEditorPromptView } from "@/app/[lang]/generation/_components/editor-prompt-view/generation-editor-prompt-view"
import { GenerationEditorSubmissionView } from "@/app/[lang]/generation/_components/editor-submission-view/generation-editor-submit-view"
import { GenerationEditorTaskView } from "@/app/[lang]/generation/_components/editor-task-view-view/generation-editor-task-view"
import { GenerationEditorLayout } from "@/app/[lang]/generation/_components/generation-editor-layout"
import { imageLoraModelsQuery } from "@/graphql/queries/image-model/image-lora-models"
import { imageModelsQuery } from "@/graphql/queries/image-model/image-models"
import { promptCategoriesQuery } from "@/graphql/queries/prompt-category/prompt-category"
import { createClient } from "@/lib/client"
import { readFile } from "fs/promises"
import type { Metadata } from "next"

const GenerationPage = async () => {
  const client = createClient()

  const promptCategoriesResp = await client.query({
    query: promptCategoriesQuery,
    variables: {},
  })

  const imageModelsResp = await client.query({
    query: imageModelsQuery,
    variables: {},
  })

  const imageLoraModelsResp = await client.query({
    query: imageLoraModelsQuery,
    variables: {},
  })

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

  // <div className="overflow-x-hidden w-full">

  return (
    <GenerationEditorLayout
      config={
        <GenerationEditorConfigView
          models={imageModelsResp.data.imageModels}
          loraModels={imageLoraModelsResp.data.imageLoraModels}
        />
      }
      promptEditor={
        <GenerationEditorPromptView
          promptCategories={promptCategoriesResp.data.promptCategories}
        />
      }
      negativePromptEditor={<GenerationEditorNegativePromptView />}
      history={
        <div className="flex flex-col h-full gap-y-2">
          <GenerationEditorSubmissionView
            imageModels={imageModelsResp.data.imageModels}
            termsMarkdownText={termsMarkdownText}
          />
          <GenerationEditorTaskView />
        </div>
      }
    />
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default GenerationPage
