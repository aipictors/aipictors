import type {
  ImageLoraModelsQuery,
  ImageLoraModelsQueryVariables,
  ImageModelsQuery,
  ImageModelsQueryVariables,
  PromptCategoriesQuery,
  PromptCategoriesQueryVariables,
} from "@/__generated__/apollo"
import {
  ImageLoraModelsDocument,
  ImageModelsDocument,
  PromptCategoriesDocument,
} from "@/__generated__/apollo"
import { GenerationDocument } from "@/app/[lang]/(beta)/generation/_components/generation-document"
import { GenerationEditor } from "@/app/[lang]/(beta)/generation/_components/generation-editor"
import { LoadingPage } from "@/app/_components/page/loading-page"
import { createClient } from "@/app/_contexts/client"
import type { Metadata } from "next"
import { Suspense } from "react"

const GenerationPage = async () => {
  const client = createClient()

  const promptCategoriesQuery = await client.query<
    PromptCategoriesQuery,
    PromptCategoriesQueryVariables
  >({
    query: PromptCategoriesDocument,
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
      <Suspense fallback={<LoadingPage text={"準備中"} />}>
        <GenerationEditor
          promptCategories={promptCategoriesQuery.data.promptCategories}
          imageModels={imageModelsQuery.data.imageModels}
          imageLoraModels={imageLoraModelsQuery.data.imageLoraModels}
        />
      </Suspense>
      <GenerationDocument models={imageModelsQuery.data.imageModels} />
    </>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default GenerationPage
