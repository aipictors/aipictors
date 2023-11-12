import {
  PromptCategoriesDocument,
  PromptCategoriesQuery,
} from "__generated__/apollo"
import { GenerationEditorLite } from "app/[lang]/(beta)/generation/lite/_components/generation-editor-lite"
import { createClient } from "app/_contexts/client"
import type { Metadata } from "next"

const GenerationLitePage = async () => {
  const client = createClient()

  const promptCategoryQuery = await client.query<PromptCategoriesQuery>({
    query: PromptCategoriesDocument,
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
