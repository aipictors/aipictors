import {
  AI_MODEL_WORKS_PER_PAGE,
  parseAiModelWorksSearch,
  toAiModelWorksOrderBy,
  toAiModelWorksPageCount,
} from "~/routes/($lang)._main.models.$model/ai-model-works-page"
import { findAiModelImageModels } from "~/routes/($lang)._main.models.$model/ai-model-image-models"
import { toAiModelPageText } from "~/routes/($lang)._main.models.$model/ai-model-seo"
import { useTranslation } from "~/hooks/use-translation"
import { ParamsError } from "~/errors/params-error"
import { loaderClient } from "~/lib/loader-client"
import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { useParams } from "@remix-run/react"
import { useLoaderData } from "@remix-run/react"
import { readFragment } from "gql.tada"
import { AppJsonLdScript } from "~/components/app/app-jsonld-script"
import { createCollectionJsonLd } from "~/utils/collection-json-ld"
import { createMeta } from "~/utils/create-meta"
import {
  findHubModel,
  toHubModelPath,
} from "~/lib/seo-hubs/seo-hub-catalog.server"
import { config, META } from "~/config"
import {
  AiModelArticle,
  aiModelImageModelsQuery,
  aiModelQuery,
  ModelItemFragment,
} from "~/routes/($lang)._main.models.$model/components/ai-model-article"

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.model === undefined) {
    throw new Response(null, { status: 404 })
  }

  const url = new URL(props.request.url)

  const search = parseAiModelWorksSearch(url.searchParams, "r15")

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
          ratings: search.isMoreRatings ? ["G", "R15"] : ["G"],
          isSensitive: false,
          hasPrompt: hasPrompt,
          orderBy: toAiModelWorksOrderBy(search.sort),
          ...(hasPrompt && {
            isPromptPublic: true,
          }),
        },
      },
    }),
    // 「このモデルで生成」と似ているモデルに使う。取れなくても作品一覧は出す
    loaderClient
      .query({ query: aiModelImageModelsQuery })
      .then((result) => result.data.imageModels)
      .catch(() => []),
  ])

  if (!resp.data.aiModel) {
    throw new Response(null, { status: 404 })
  }

  const model = readFragment(ModelItemFragment, resp.data.aiModel)

  const imageModel = findAiModelImageModels(imageModels, model, 12)

  return {
    data: resp.data.aiModel,
    search: search,
    generation: imageModel.current,
    relatedModels: imageModel.related,
    promptHubPath: findHubModel(props.params.model, false)
      ? toHubModelPath(props.params.model, false)
      : null,
  }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneDay,
})

export const meta: MetaFunction<typeof loader> = (props) => {
  if (!props.data) {
    return [{ title: "モデル作品一覧" }]
  }

  const model = readFragment(ModelItemFragment, props.data.data)

  const generation = props.data.generation

  const page = props.data.search.page

  const pageCount = toAiModelWorksPageCount(model.worksCount)

  const text = toAiModelPageText({
    name: model.name,
    worksCount: model.worksCount,
    page: page,
    pageCount: pageCount,
    workTitles: model.works.map((work) =>
      props.params.lang === "en" && work.enTitle ? work.enTitle : work.title,
    ),
    modelType: generation?.type ?? null,
    lang: props.params.lang,
  })

  const thumbnailUrl =
    model.thumbnailImageURL ??
    model.works[0]?.largeThumbnailImageURL ??
    generation?.thumbnailImageURL ??
    ""

  const metaTags = createMeta(
    META.MODEL,
    {
      title: text.title,
      enTitle: text.title,
      description: text.description,
      enDescription: text.description,
      url: thumbnailUrl,
    },
    props.params.lang,
  )

  // 作品のないページ（範囲外のページ・作品のないモデル）は検索結果に出さない
  const robots =
    model.works.length === 0
      ? [{ name: "robots", content: "noindex, follow" }]
      : []

  // 前後のページ（canonical と同じく ?page= だけを残す）。並び替え・絞り込みの一覧は canonical が別の一覧なので出さない
  const search = props.data.search
  const isFiltered =
    search.hasPrompt || search.isMoreRatings || search.sort !== "new"
  const basePath = `${config.siteURL}${props.params.lang === "en" ? "/en" : ""}/models/${encodeURIComponent(model.name)}`
  const toPageUrl = (value: number) =>
    value > 0 ? `${basePath}?page=${value}` : basePath
  const pageLinks = isFiltered
    ? []
    : [
        ...(page > 0 && page < pageCount
          ? [{ tagName: "link", rel: "prev", href: toPageUrl(page - 1) }]
          : []),
        ...(page + 1 < pageCount
          ? [{ tagName: "link", rel: "next", href: toPageUrl(page + 1) }]
          : []),
      ]

  return [
    ...metaTags.filter(
      (tag) => robots.length === 0 || !("name" in tag && tag.name === "robots"),
    ),
    ...robots,
    ...pageLinks,
  ]
}

/**
 * モデルの詳細
 */
export default function ModelPage() {
  const t = useTranslation()
  const params = useParams()

  if (params.model === undefined) {
    throw new ParamsError()
  }

  const data = useLoaderData<typeof loader>()

  if (data.data === null) {
    throw new ParamsError()
  }

  // ページを変えた URL は canonical が別なので、そのページの作品だけを載せる
  const model = readFragment(ModelItemFragment, data.data)

  const page = data.search.page

  return (
    <>
      <AppJsonLdScript
        jsonLd={createCollectionJsonLd({
          name: t(
            `${model.name}の作品一覧`,
            `Works generated with ${model.name}`,
          ),
          path: `/models/${encodeURIComponent(model.name)}${page > 0 ? `?page=${page}` : ""}`,
          lang: params.lang,
          parents: [{ name: t("モデル一覧", "Models"), path: "/models" }],
          items: model.works.map((work) => ({
            name: t.workTitle(work.title, work.enTitle),
            path: `/posts/${work.id}`,
          })),
        })}
      />
      <AiModelArticle
        model={data.data}
        search={data.search}
        generation={data.generation}
        relatedModels={data.relatedModels}
        promptHubPath={data.promptHubPath}
      />
    </>
  )
}
