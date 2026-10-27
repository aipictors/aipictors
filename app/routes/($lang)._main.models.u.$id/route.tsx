import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { useLoaderData, useParams } from "@remix-run/react"
import { ClientOnly } from "remix-utils/client-only"
import { AppJsonLdScript } from "~/components/app/app-jsonld-script"
import { config, META } from "~/config"
import {
  callUserModelsApi,
  fetchPublicUserModels,
  resolveUserModelsProxy,
} from "~/lib/server/user-models.server"
import { normalizeUserModel } from "~/lib/user-models/client"
import { baseModelLabel, kindLabel } from "~/lib/user-models/constants"
import { splitTriggerWords } from "~/lib/user-models/generation"
import type { UserModel } from "~/lib/user-models/types"
import { UserModelDetail } from "~/routes/($lang)._main.models.u.$id/components/user-model-detail"
import { createMeta } from "~/utils/create-meta"

/**
 * 公開情報と似ているモデルをサーバーで取得する（失敗してもクライアントで再取得する）
 */
export async function loader({ request, context, params }: LoaderFunctionArgs) {
  const id = params.id ?? ""
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(id)) {
    throw new Response(null, { status: 404 })
  }

  let model: UserModel | null = null
  try {
    const resolved = await resolveUserModelsProxy({
      request: new Request(request.url),
      context,
      requireViewer: false,
    })
    if (resolved.ok) {
      const response = await callUserModelsApi({
        proxy: resolved.value,
        path: `/internal/user-models/${id}`,
        method: "GET",
        fallbackError: "",
      })
      if (response.status === 404) {
        throw new Response(null, { status: 404 })
      }
      const json = (await response.json()) as { data: UserModel | null }
      model = json.data ? normalizeUserModel(json.data) : null
    }
  } catch (error) {
    if (error instanceof Response) {
      throw error
    }
  }

  // 同じ系統・種類のモデル（内部リンクと回遊のため）
  const related = model
    ? await fetchPublicUserModels(context, {
        sort: "popular",
        kind: model.kind,
        baseModel: model.baseModel,
        limit: 13,
      })
    : { models: [] }

  return {
    model,
    relatedModels: related.models
      .filter((item) => item.id !== id)
      .slice(0, 12)
      .map(normalizeUserModel),
  }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
})

const isSensitiveRating = (rating: string) =>
  rating === "R18" || rating === "R18G"

/**
 * 検索結果の説明文（説明が短いモデルでも内容が伝わるように種類・系統・トリガーワードを入れる）
 */
const toModelDescription = (model: UserModel) => {
  const triggerWords = splitTriggerWords(model.triggerWords).slice(0, 5)
  const parts = [
    `${model.name}は${baseModelLabel(model.baseModel)}向けの${kindLabel(model.kind)}です。`,
    triggerWords.length > 0
      ? `トリガーワード: ${triggerWords.join(", ")}。`
      : "",
    model.description
      ? model.description.replace(/\s+/g, " ").slice(0, 80)
      : "",
    "Aipictors の画像生成でそのまま使えます。",
  ]
  return parts.filter(Boolean).join(" ")
}

export const meta: MetaFunction<typeof loader> = (props) => {
  const model = props.data?.model
  if (!model) {
    return createMeta(
      { ...META.USER_MODEL, isIndex: false },
      { title: "モデル", description: "Aipictors のみんなのモデル", url: "" },
      props.params.lang,
    )
  }
  return createMeta(
    {
      ...META.USER_MODEL,
      // 公開中の全年齢・R15 のモデルだけ検索結果に出す
      isIndex: model.status === "READY" && !isSensitiveRating(model.rating),
    },
    {
      title: `${model.name}（${kindLabel(model.kind)}・${baseModelLabel(model.baseModel)}）`,
      description: toModelDescription(model),
      url: model.thumbnailUrl ?? config.defaultOgpImageUrl,
    },
    props.params.lang,
  )
}

export default function UserModelPage() {
  const data = useLoaderData<typeof loader>()
  const params = useParams()
  const model = data.model

  if (!model) {
    return (
      <ClientOnly fallback={<div className="min-h-screen" />}>
        {() => <UserModelDetail id={params.id ?? ""} initialModel={null} />}
      </ClientOnly>
    )
  }

  const lang = params.lang === "en" ? "en" : "ja"
  const homeUrl = lang === "en" ? `${config.siteURL}/en` : config.siteURL
  const pageUrl = `${homeUrl}/models/u/${model.id}`
  const images = [model.thumbnailUrl, ...model.sampleImageUrls].filter(
    (url): url is string => typeof url === "string" && url.length > 0,
  )

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      "@id": pageUrl,
      name: model.name,
      url: pageUrl,
      description: toModelDescription(model),
      genre: `${kindLabel(model.kind)} (${baseModelLabel(model.baseModel)})`,
      keywords: [
        kindLabel(model.kind),
        baseModelLabel(model.baseModel),
        ...model.tags,
        ...splitTriggerWords(model.triggerWords).slice(0, 10),
      ].join(", "),
      image: images.slice(0, 5),
      dateCreated: model.createdAt
        ? new Date(model.createdAt * 1000).toISOString()
        : undefined,
      dateModified: model.updatedAt
        ? new Date(model.updatedAt * 1000).toISOString()
        : undefined,
      isBasedOn: model.sourceUrl ?? undefined,
      creator: model.sourceCreator
        ? { "@type": "Person", name: model.sourceCreator }
        : model.user
          ? {
              "@type": "Person",
              name: model.user.name,
              url: `${homeUrl}/users/${model.user.login}`,
            }
          : undefined,
      contentRating: model.rating,
      interactionStatistic: {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/UseAction",
        userInteractionCount: model.useCount,
      },
      isPartOf: { "@type": "WebSite", name: "Aipictors", url: homeUrl },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Aipictors", item: homeUrl },
        {
          "@type": "ListItem",
          position: 2,
          name: lang === "en" ? "Models" : "モデル",
          item: `${homeUrl}/models`,
        },
        { "@type": "ListItem", position: 3, name: model.name, item: pageUrl },
      ],
    },
  ]

  return (
    <>
      {model.status === "READY" && !isSensitiveRating(model.rating) && (
        <AppJsonLdScript
          jsonLd={jsonLd as unknown as Parameters<typeof AppJsonLdScript>[0]["jsonLd"]}
        />
      )}
      <UserModelDetail
        id={params.id ?? ""}
        initialModel={model}
        relatedModels={data.relatedModels}
      />
    </>
  )
}
