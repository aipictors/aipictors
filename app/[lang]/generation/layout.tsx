import { HomeHeader } from "@/[lang]/(main)/_components/home-header"
import { GenerationConfigProvider } from "@/[lang]/generation/_components/generation-config-provider"
import { GenerationQueryProvider } from "@/[lang]/generation/_components/generation-query-provider"
import { imageLoraModelsQuery } from "@/_graphql/queries/image-model/image-lora-models"
import { imageModelsQuery } from "@/_graphql/queries/image-model/image-models"
import { promptCategoriesQuery } from "@/_graphql/queries/prompt-category/prompt-category"
import { createClient } from "@/_lib/client"

export const revalidate = 60

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
      <HomeHeader title="画像生成 β" />
      <GenerationQueryProvider
        promptCategories={promptCategoriesResp.data.promptCategories}
        imageModels={imageModelsResp.data.imageModels}
        imageLoraModels={imageLoraModelsResp.data.imageLoraModels}
      >
        <GenerationConfigProvider>
          <div className="container max-w-none">{props.children}</div>
        </GenerationConfigProvider>
      </GenerationQueryProvider>
    </>
  )
}

export default GenerationLayout
