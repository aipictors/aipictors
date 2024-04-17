import { GenerationEditorLite } from "@/[lang]/generation/lite/_components/generation-editor-lite"
import { promptCategoriesQuery } from "@/_graphql/queries/prompt-category/prompt-category"
import { createClient } from "@/_lib/client"
import { useLoaderData } from "@remix-run/react"

export async function loader() {
  const client = createClient()

  const promptCategoryQuery = await client.query({
    query: promptCategoriesQuery,
    variables: {},
  })

  return {
    promptCategories: promptCategoryQuery.data.promptCategories,
  }
}
/**
 * 画像生成・ライト
 * @returns
 */
export default function GenerationLite() {
  const promptCategoryQuery = useLoaderData<typeof loader>()

  return (
    <GenerationEditorLite
      promptCategories={promptCategoryQuery.promptCategories}
    />
  )
}
