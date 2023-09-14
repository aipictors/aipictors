import { Metadata } from "next"
import {
  PromptCategoryDocument,
  PromptCategoryQuery,
} from "__generated__/apollo"
import { client } from "app/client"
import { MainGeneration } from "app/generation/components/MainGeneration"

const SettingGenerationPage = async () => {
  const resp = await client.query<PromptCategoryQuery>({
    query: PromptCategoryDocument,
    variables: {},
  })

  return <MainGeneration promptCategoryQuery={resp.data} />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default SettingGenerationPage
