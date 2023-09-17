import type { Metadata } from "next"
import type {
  PromptCategoryQuery} from "__generated__/apollo";
import {
  PromptCategoryDocument
} from "__generated__/apollo"
import { MainGeneration } from "app/(main)/generation/components/MainGeneration"
import { client } from "app/client"

const GenerationLitePage = async () => {
  const promptCategoryQuery = await client.query<PromptCategoryQuery>({
    query: PromptCategoryDocument,
    variables: {},
  })

  return <MainGeneration promptCategoryQuery={promptCategoryQuery.data} />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default GenerationLitePage
