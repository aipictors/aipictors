import { GenerationDocument } from "@/app/[lang]/(beta)/generation/_components/generation-document"
import { GenerationEditor } from "@/app/[lang]/(beta)/generation/_components/generation-editor"
import { LoadingPage } from "@/app/_components/page/loading-page"
import { createClient } from "@/app/_contexts/client"
import { imageLoraModelsQuery } from "@/graphql/queries/image-model/image-lora-models"
import { imageModelsQuery } from "@/graphql/queries/image-model/image-models"
import { promptCategoriesQuery } from "@/graphql/queries/prompt-category/prompt-category"
import type { Metadata } from "next"
import { Suspense } from "react"

const GenerationPage = async () => {
  const client = createClient()

  const promptCategoriesResp = await client.query({
    query: promptCategoriesQuery,
    variables: {},
  })

  const imageModelsResp = await client.query({
    query: imageModelsQuery,
    variables: {},
  })

  const imageLoraModelsResp = await client.query({
    query: imageLoraModelsQuery,
    variables: {},
  })

  return (
    <>
      <Suspense fallback={<LoadingPage text={"準備中"} />}>
        <GenerationEditor
          promptCategories={promptCategoriesResp.data.promptCategories}
          imageModels={imageModelsResp.data.imageModels}
          imageLoraModels={imageLoraModelsResp.data.imageLoraModels}
        />
      </Suspense>
      <GenerationDocument models={imageModelsResp.data.imageModels} />
    </>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default GenerationPage
