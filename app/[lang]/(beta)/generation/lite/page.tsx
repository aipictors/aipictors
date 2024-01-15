import { GenerationEditorLite } from "@/app/[lang]/(beta)/generation/lite/_components/generation-editor-lite"
import { createClient } from "@/app/_contexts/client"
import { promptCategoriesQuery } from "@/graphql/queries/prompt-category/prompt-category"
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

export const revalidate = 60

export default GenerationLitePage
