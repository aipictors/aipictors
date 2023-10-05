import type { Metadata } from "next"
import type { PromptCategoryQuery } from "__generated__/apollo"
import { PromptCategoryDocument } from "__generated__/apollo"
import { GenerationEditorLite } from "app/(main)/generation/lite/components/GenerationEditorLite"
import { createClient } from "app/client"

const GenerationLitePage = async () => {
  const client = createClient()

  const promptCategoryQuery = await client.query<PromptCategoryQuery>({
    query: PromptCategoryDocument,
    variables: {},
  })

  return <GenerationEditorLite promptCategoryQuery={promptCategoryQuery.data} />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default GenerationLitePage
