import { GenerationEditorLite } from "@/[lang]/generation/lite/_components/generation-editor-lite"
import { promptCategoriesQuery } from "@/_graphql/queries/prompt-category/prompt-category"
import { createClient } from "@/_lib/client"
import type { Metadata } from "next"

/**
 * 画像生成・ライト
 * @returns
 */
const GenerationLitePage = async () => {
  const client = createClient()

  const promptCategoryQuery = await client.query({
    query: promptCategoriesQuery,
    variables: {},
  })

  return (
    <GenerationEditorLite
      promptCategories={promptCategoryQuery.data.promptCategories}
    />
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export default GenerationLitePage
