import { BetaHeader } from "@/app/[lang]/(beta)/_components/beta-header"
import { AppLoadingPage } from "@/components/app/app-loading-page"
import { imageLoraModelsQuery } from "@/graphql/queries/image-model/image-lora-models"
import { imageModelsQuery } from "@/graphql/queries/image-model/image-models"
import { promptCategoriesQuery } from "@/graphql/queries/prompt-category/prompt-category"
import { createClient } from "@/lib/client"
import dynamic from "next/dynamic"

type Props = {
  children: React.ReactNode
}

export async function GenerationLayout(props: Props) {
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
      <BetaHeader title="画像生成 β" />
      <GenerationContextProvider
        promptCategories={promptCategoriesResp.data.promptCategories}
        imageModels={imageModelsResp.data.imageModels}
        imageLoraModels={imageLoraModelsResp.data.imageLoraModels}
      >
        <div className="container max-w-none">{props.children}</div>
      </GenerationContextProvider>
    </>
  )
}

const GenerationContextProvider = dynamic(
  () => {
    return import(
      "@/app/[lang]/generation/_components/generation-context-provider"
    ).then((m) => {
      return m.GenerationContextProvider
    })
  },
  {
    ssr: false,
    loading() {
      return <AppLoadingPage />
    },
  },
)

export const revalidate = 60

export default GenerationLayout
