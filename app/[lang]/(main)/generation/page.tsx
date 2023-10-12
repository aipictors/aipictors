import type { Metadata } from "next"
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
        promptCategoryQuery={promptCategoryQuery.data}
        imageModels={imageModelsQuery.data.imageModels}
        ImageLoraModelsQuery={imageLoraModelsQuery.data}
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
