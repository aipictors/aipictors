import { redirect } from "@remix-run/cloudflare"
import { graphql } from "gql.tada"
import { loaderClient } from "~/lib/loader-client"
import { resolveAiModelParam } from "~/routes/($lang)._main.models.$model/ai-model-resolve"

const aiModelNamesQuery = graphql(
  `query AiModelNames($limit: Int!) {
    aiModels(offset: 0, limit: $limit) {
      name
    }
  }`,
)

type ImageModel = {
  id: string
  modelName: string
  displayName: string
}

/**
 * /models/:model の名前で作品のモデルが見つからなかったとき
 * 生成機の番号（/models/730）・表示名・大文字小文字違いは正しい名前のページへ 301 で移し、
 * 作品のモデルがまだ無い生成機のモデルはそのモデルを返す（中身のあるページを出す）。どれでもなければ 404
 */
export const resolveAiModelFallback = async <T extends ImageModel>(props: {
  request: Request
  param: string
  imageModels: T[]
  isSensitive: boolean
  lang: string | undefined
}): Promise<T> => {
  // 作品のモデルは百数十件なので、見つからなかったときだけ全件の名前を読んで比べる
  const aiModelNames = await loaderClient
    .query({ query: aiModelNamesQuery, variables: { limit: 500 } })
    .then((result) => (result.data.aiModels ?? []).map((model) => model.name))
    .catch(() => [] as string[])

  const result = resolveAiModelParam({
    param: props.param,
    imageModels: props.imageModels,
    aiModelNames,
  })

  if (result === null) {
    throw new Response(null, { status: 404 })
  }

  if (result.kind === "redirect") {
    const url = new URL(props.request.url)
    const prefix = `${props.lang === "en" ? "/en" : ""}${props.isSensitive ? "/r" : ""}`
    throw redirect(
      `${prefix}/models/${encodeURIComponent(result.name)}${url.search}`,
      301,
    )
  }

  const imageModel = props.imageModels.find(
    (item) => item.id === result.imageModel.id,
  )

  if (imageModel === undefined) {
    throw new Response(null, { status: 404 })
  }

  return imageModel
}
