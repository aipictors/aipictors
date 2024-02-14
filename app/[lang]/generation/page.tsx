import { join } from "path"
import { GenerationDocument } from "@/app/[lang]/generation/_components/generation-document"
import { GenerationEditor } from "@/app/[lang]/generation/_components/generation-editor"
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
  const descriptionMarkdownText = await readFile(
    join(process.cwd(), "assets/image-generation-description.md"),
    "utf-8",
  )

  return (
    <div className="overflow-x-hidden w-full">
      <GenerationEditor
        termsMarkdownText={termsMarkdownText}
        promptCategories={promptCategoriesResp.data.promptCategories}
        imageModels={imageModelsResp.data.imageModels}
        imageLoraModels={imageLoraModelsResp.data.imageLoraModels}
      />
      <GenerationDocument
        markdownText={descriptionMarkdownText}
        models={imageModelsResp.data.imageModels}
      />
    </div>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default GenerationPage
