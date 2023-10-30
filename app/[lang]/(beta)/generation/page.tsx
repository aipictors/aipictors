import type {
  ImageLoraModelsQuery,
  ImageLoraModelsQueryVariables,
  ImageModelsQuery,
  ImageModelsQueryVariables,
  PromptCategoryQuery,
  PromptCategoryQueryVariables,
} from "__generated__/apollo"
import {
  ImageLoraModelsDocument,
  ImageModelsDocument,
  PromptCategoryDocument,
} from "__generated__/apollo"
import { GenerationEditor } from "app/[lang]/(beta)/generation/_components/GenerationEditor"
import { createClient } from "app/_utils/client"
import type { Metadata } from "next"

const GenerationPage = async () => {
  const client = createClient()

  const promptCategoryQuery = await client.query<
    PromptCategoryQuery,
    PromptCategoryQueryVariables
  >({
    query: PromptCategoryDocument,
    variables: {},
  })

  const imageModelsQuery = await client.query<
    ImageModelsQuery,
    ImageModelsQueryVariables
  >({
    query: ImageModelsDocument,
    variables: {},
  })

  const imageLoraModelsQuery = await client.query<
    ImageLoraModelsQuery,
    ImageLoraModelsQueryVariables
  >({
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
