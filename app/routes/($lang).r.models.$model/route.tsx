import {
  AI_MODEL_WORKS_PER_PAGE,
  parseAiModelWorksSearch,
  toAiModelWorksOrderBy,
  toAiModelWorksPageCount,
} from "~/routes/($lang)._main.models.$model/ai-model-works-page"
import { findAiModelImageModels } from "~/routes/($lang)._main.models.$model/ai-model-image-models"
import { toAiModelPageText } from "~/routes/($lang)._main.models.$model/ai-model-seo"
import { aiModelImageModelsQuery } from "~/routes/($lang)._main.models.$model/components/ai-model-article"
import { ParamsError } from "~/errors/params-error"
import { resolveAiModelFallback } from "~/routes/($lang)._main.models.$model/ai-model-fallback.server"
import { findModelDetail } from "~/lib/model-details/model-details.server"
import { loaderClient } from "~/lib/loader-client"
import {
  redirect,
  type HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { useParams } from "@remix-run/react"
import { useLoaderData } from "@remix-run/react"
import { graphql, readFragment } from "gql.tada"
import { createSensitiveMeta } from "~/utils/create-sensitive-meta"
import { config, META } from "~/config"
import {
  AiModelSensitiveArticle,
  ModelSensitiveItemFragment,
} from "~/routes/($lang)._main.models.$model/components/ai-model-sensitive-article"

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.model === undefined) {
    throw new Response(null, { status: 404 })
  }

  const url = new URL(props.request.url)

  const search = parseAiModelWorksSearch(url.searchParams, "r18g")

  const page = search.page

  const hasPrompt = search.hasPrompt

  const [resp, imageModels] = await Promise.all([
    loaderClient.query({
      query: aiModelQuery,
      variables: {
        search: props.params.model,
        offset: page * AI_MODEL_WORKS_PER_PAGE,
        limit: AI_MODEL_WORKS_PER_PAGE,
        where: {
          ratings: search.isMoreRatings ? ["R18", "R18G"] : ["R18"],
          isSensitive: true,
          hasPrompt: hasPrompt,
          orderBy: toAiModelWorksOrderBy(search.sort),
          ...(hasPrompt && {
            isPromptPublic: true,
          }),
        },
      },
    }),
    loaderClient
      .query({ query: aiModelImageModelsQuery })
      .then((result) => result.data.imageModels)
      .catch(() => []),
  ])

  if (!resp.data.aiModel) {
    // 生成機の番号・表示名は正しい名前の R18 のページへ。作品のまだ無い生成機のモデルは全年齢の紹介のページへ
    const current = await resolveAiModelFallback({
      request: props.request,
      param: props.params.model,
      imageModels,
      isSensitive: true,
      lang: props.params.lang,
    })
    throw redirect(
      `${props.params.lang === "en" ? "/en" : ""}/models/${encodeURIComponent(current.displayName)}`,
      301,
    )
  }

  const model = readFragment(ModelSensitiveItemFragment, resp.data.aiModel)

  const imageModel = findAiModelImageModels(imageModels, model, 12)

  return {
    data: resp.data.aiModel,
    search: search,
    generation: imageModel.current,
    relatedModels: imageModel.related,
    detail: findModelDetail(imageModel.current?.id ?? model.generationModelId),
  }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneDay,
})

export const meta: MetaFunction<typeof loader> = (props) => {
  if (!props.data) {
    return [{ title: "モデル作品一覧" }]
  }

  const model = readFragment(ModelSensitiveItemFragment, props.data.data)

  const generation = props.data.generation

  const text = toAiModelPageText({
    name: model.name,
    worksCount: model.worksCount,
    page: props.data.search.page,
    pageCount: toAiModelWorksPageCount(model.worksCount),
    workTitles: model.works.map((work) =>
      props.params.lang === "en" && work.enTitle ? work.enTitle : work.title,
    ),
    modelType: generation?.type ?? null,
    lang: props.params.lang,
  })

  return createSensitiveMeta(
    META.MODEL,
    {
      title: text.title,
      enTitle: text.title,
      description: text.description,
      enDescription: text.description,
    },
    props.params.lang,
  )
}

/**
 * モデルの詳細
 */
export default function ModelPage() {
  const params = useParams()

  if (params.model === undefined) {
    throw new ParamsError()
  }

  const data = useLoaderData<typeof loader>()

  if (data.data === null) {
    throw new ParamsError()
  }

  return (
    <>
      <AiModelSensitiveArticle
        model={data.data}
        search={data.search}
        generation={data.generation}
        relatedModels={data.relatedModels}
        detail={data.detail}
      />
    </>
  )
}

export const aiModelQuery = graphql(
  `query AiModel($search: String!, $offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    aiModel(where:{search: $search}) {
      ...ModelItem
    }
  }`,
  [ModelSensitiveItemFragment],
)
