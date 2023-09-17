import { Metadata } from "next"
import {
  ImageModelsDocument,
  ImageModelsQuery,
  PromptCategoryDocument,
  PromptCategoryQuery,
} from "__generated__/apollo"
import { ImageGenerationEditor } from "app/(main)/generation/components/ImageGenerationEditor"
import { client } from "app/client"

const GenerationPage = async () => {
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
      <ImageGenerationEditor
        promptCategoryQuery={promptCategoryQuery.data}
        imageModelsQuery={imageModelsQuery.data}
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
