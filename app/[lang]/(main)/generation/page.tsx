import type {
  ImageLoraModelsQuery,
  ImageModelsQuery,
  PromptCategoryQuery,
} from "__generated__/apollo"
import {
  ImageLoraModelsDocument,
  ImageModelsDocument,
  PromptCategoryDocument,
} from "__generated__/apollo"
import { GenerationEditor } from "app/[lang]/(main)/generation/components/GenerationEditor"
import { createClient } from "app/client"
import type { Metadata } from "next"

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

  const imageLoraModelsQuery = await client.query<ImageLoraModelsQuery>({
    query: ImageLoraModelsDocument,
    variables: {},
  })

  return (
    <>
      <GenerationEditor
        promptCategories={promptCategoryQuery.data.promptCategories}
        imageModels={imageModelsQuery.data.imageModels}
        imageLoraModels={imageLoraModelsQuery.data.imageLoraModels}
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
