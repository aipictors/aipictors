import type { Metadata } from "next"
import type {
  ImageModelsQuery,
  PromptCategoryQuery,
} from "__generated__/apollo"
import {
  ImageModelsDocument,
  PromptCategoryDocument,
} from "__generated__/apollo"
import { GenerationEditor } from "app/(main)/generation/components/GenerationEditor"
import { createClient } from "app/client"

const GenerationPage = async () => {
  const client = createClient()

  const promptCategoryQuery = await client.query<PromptCategoryQuery>({
    query: PromptCategoryDocument,
    variables: {},
  })

  const imageModelsQuery = await client.query<ImageModelsQuery>({
    query: ImageModelsDocument,
    variables: {},
  })
  return (
    <>
      <GenerationEditor
        promptCategoryQuery={promptCategoryQuery.data}
        imageModels={imageModelsQuery.data.imageModels}
      />
    </>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default GenerationPage
