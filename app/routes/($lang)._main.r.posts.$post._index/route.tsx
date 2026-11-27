import { redirectToWorkRatingPath } from "~/utils/work-rating-redirect"
import {
  type HeadersFunction,
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/cloudflare"
import {
  isRouteErrorResponse,
  useLoaderData,
  useParams,
  useRouteError,
} from "@remix-run/react"
import { type FragmentOf, graphql } from "gql.tada"
import type { BreadcrumbList, VisualArtwork, WithContext } from "schema-dts"
import { AppBreadcrumbScript } from "~/components/app/app-breadcrumb-script"
import { AppErrorPage } from "~/components/app/app-error-page"
import { AppJsonLdScript } from "~/components/app/app-jsonld-script"
import { AppLoadingPage } from "~/components/app/app-loading-page"
import { SensitiveAgeGate } from "~/components/sensitive/sensitive-age-gate"
import { SensitiveBlurToggle } from "~/components/sensitive/sensitive-blur"
import { OwnWorkNotFoundPage } from "~/components/work/own-work-not-found-page"
import { config, META } from "~/config"
import { ParamsError } from "~/errors/params-error"
import { useTranslation } from "~/hooks/use-translation"
import { loaderClient } from "~/lib/loader-client"
import {
  sensitiveWorkArticleFragment,
  type workArticleFragment,
} from "~/routes/($lang)._main.posts.$post._index/components/work-article"
import { SensitiveWorkContainer } from "~/routes/($lang)._main.r.posts.$post._index/components/sensitive-work-container"
import { fetchWorkDiscovery } from "~/routes/($lang)._main.posts.$post._index/utils/work-discovery.server"
import { buildWorkMetaDescription } from "~/routes/($lang)._main.posts.$post._index/utils/work-meta-description"
import { createSensitiveMeta } from "~/utils/create-sensitive-meta"
import {
  isEnglishLang,
  withEnglishWorkRobots,
} from "~/utils/english-work-robots"
import {
  isIndexableSensitiveWork,
  isSuggestableSensitiveTag,
} from "~/utils/sensitive-tag-filter"

/**
 * 予約投稿などで見つからないときは、持ち主なら下書き表示に移す
 */
export function ErrorBoundary() {
  const error = useRouteError()
  const params = useParams()

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <OwnWorkNotFoundPage workId={params.post} />
  }

  if (isRouteErrorResponse(error)) {
    return <AppErrorPage status={error.status} message={error.data} />
  }

  return (
    <AppErrorPage
      status={500}
      message={error instanceof Error ? error.message : ""}
    />
  )
}

export function HydrateFallback() {
  return <AppLoadingPage />
}

export async function loader(props: LoaderFunctionArgs) {
  // 作品番号か UUID 以外（/posts/null など）は 404（そのまま問い合わせると API のエラーで 500 になっていた）
  if (
    props.params.post === undefined ||
    !/^(\d+|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i.test(
      props.params.post,
    )
  ) {
    throw new Response(null, { status: 404 })
  }

  // const redirectResponse = checkLocaleRedirect(props.request)

  // if (redirectResponse) {
  //   return redirectResponse
  // }

  // コメント・新着コメント・受賞作品はブラウザで取る（全年齢の作品ページと同じ。
  // 以前はクローラーを含む毎回の描画で問い合わせを 4 本投げていて、WorkComments だけで API の CPU の 1 割近くを使っていた）
  const workResp = await loaderClient.query({
    query: workQuery,
    variables: {
      id: props.params.post,
    },
    // ページの読み込みでは閲覧数を数えない（全年齢の作品ページと同じ。hooks/use-count-work-view.ts）
    context: { headers: { "x-aipictors-no-view": "1" } },
  })

  if (workResp.data.work === null) {
    throw new Response(null, { status: 404 })
  }

  // 作者が取れなかった作品を「欠けたまま」出さない（読み直し・古いキャッシュに任せる）
  if (workResp.errors?.length && !workResp.data.work.user) {
    throw new Error("作品の作者を取得できませんでした")
  }

  // 非公開の場合はエラー
  if (
    workResp.data.work.accessType === "PRIVATE" ||
    workResp.data.work.accessType === "DRAFT"
  ) {
    throw new Response(null, { status: 404 })
  }

  // センシティブでない作品の場合は/postsにリダイレクト
  if (
    workResp.data.work.rating === "G" ||
    workResp.data.work.rating === "R15"
  ) {
    return redirectToWorkRatingPath(props.params.lang, false, props.params.post)
  }

  // 下の一覧（おすすめ・前日ランキング・同じお題）も最初の HTML に入れる（全年齢の作品ページと同じ）
  const discoveryResult = await fetchWorkDiscovery({
    id: workResp.data.work.id,
    rating: workResp.data.work.rating,
    tagNames: workResp.data.work.tagNames ?? [],
    dailyTheme: workResp.data.work.dailyTheme,
    model: workResp.data.work.model ?? null,
  })

  return json(
    {
      post: props.params.post,
      work: workResp.data.work,
      discovery: discoveryResult.discovery,
    },
    {
      headers: {
        // 一部が欠けた内容はキャッシュしない。下の一覧だけ取れなかったときは短く
        ...(Boolean(workResp.errors?.length)
          ? { "Cache-Control": "no-store" }
          : !discoveryResult.isComplete && {
              "Cache-Control":
                "public, max-age=0, s-maxage=300, stale-while-revalidate=600",
            }),
        // 英語の作品ページは検索に載せない（app/utils/english-work-robots.ts）
        ...(isEnglishLang(props.params.lang) && { "X-Robots-Tag": "noindex" }),
      },
    },
  )
}

export const headers: HeadersFunction = ({ loaderHeaders }) => {
  const robots = loaderHeaders.get("X-Robots-Tag")
  return {
    "Cache-Control":
      loaderHeaders.get("Cache-Control") ?? config.cacheControl.oneDay,
    ...(robots && { "X-Robots-Tag": robots }),
  }
}

export const meta: MetaFunction = (props) => {
  if (!props.data) {
    return [{ title: "Aipictorsの作品ページ" }]
  }

  const work = props.data as { work: FragmentOf<typeof workArticleFragment> }

  const localePrefix = props.params.lang === "en" ? "/en" : ""
  const baseUrl = `${config.siteURL}${localePrefix}`
  const pageUrl = `${baseUrl}/r/posts/${encodeURIComponent(props.params.post ?? work.work.id)}`

  const isEn = props.params.lang === "en"
  const workTitle =
    isEn && work.work.enTitle.length > 0 ? work.work.enTitle : work.work.title
  const userName = work.work.user?.name ?? ""
  const userPart = work.work.user
    ? isEn
      ? ` - R18 AI art by ${userName}`
      : ` - ${userName}のR18 AIイラスト`
    : ""

  // R18G の作品と、未成年を連想させるタグ・タイトル・説明の作品などは検索エンジンに載せない
  const isIndex = isIndexableSensitiveWork({
    rating: work.work.rating,
    title: `${work.work.title} ${work.work.enTitle} ${work.work.description ?? ""}`,
    tagNames: work.work.tagNames,
  })

  // 「この作品は『タグ』タグがついた『作者』さんのAIイラストです。」＋作者の説明（全年齢の作品ページと同じ形）。
  // タグは一覧に出してよいものだけ
  const describableTags = work.work.tagNames.filter((tagName) =>
    isSuggestableSensitiveTag(tagName),
  )
  const ownDescription = isEn
    ? work.work.enDescription || work.work.description || ""
    : work.work.description || ""
  const description = buildWorkMetaDescription(
    {
      title: workTitle,
      userName: userName || null,
      model: null,
      tagNames: describableTags,
      style: null,
      type: work.work.type ?? null,
      isPromptPublic: work.work.promptAccessType === "PUBLIC",
      description:
        ownDescription.trim() ||
        (isEn
          ? "For people aged 18 and over."
          : "18歳以上の方向けの作品です。関連作品も見られます。"),
    },
    isEn ? "en" : "ja",
  )

  const metaTags = createSensitiveMeta(
    { ...META.POSTS, isIndex },
    {
      title: `${workTitle}${userPart}`,
      enTitle: `${workTitle}${userPart}`,
      description,
      enDescription: description,
      url: config.defaultSensitiveOgpImageUrl,
      pageUrl,
    },
    props.params.lang,
  )
  // 英語の作品ページは noindex, follow（もともと noindex の作品はそのまま）
  return withEnglishWorkRobots(metaTags, props.params.lang)
}

export default function Work() {
  const t = useTranslation()
  const params = useParams()

  if (params.post === undefined) {
    throw new ParamsError()
  }

  const data = useLoaderData<typeof loader>()

  if (data === null) {
    return null
  }

  if (!data || !("post" in data) || data.post === null) {
    return null
  }

  const localePrefix = params.lang === "en" ? "/en" : ""
  const baseUrl = `${config.siteURL}${localePrefix}`
  const lang = params.lang === "en" ? "en" : "ja"
  const pageUrl = `${baseUrl}/r/posts/${encodeURIComponent(data.post)}`
  const userUrl = data.work.user?.login
    ? `${baseUrl}/users/${encodeURIComponent(data.work.user.login)}`
    : undefined

  const title =
    lang === "en"
      ? data.work.enTitle && data.work.enTitle.length > 0
        ? data.work.enTitle
        : t(data.work.title, data.work.enTitle || undefined)
      : t(data.work.title, data.work.enTitle || undefined)

  const descriptionRaw =
    lang === "en"
      ? data.work.enDescription || data.work.description || ""
      : data.work.description || ""
  const description =
    descriptionRaw.length > 300
      ? `${descriptionRaw.slice(0, 297)}...`
      : descriptionRaw

  const breadcrumb: WithContext<BreadcrumbList> = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Aipictors",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: lang === "en" ? "R18" : "R18",
        item: `${baseUrl}/r`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: title,
        item: pageUrl,
      },
    ],
  }

  const artwork: WithContext<VisualArtwork> = {
    "@context": "https://schema.org",
    "@type": "VisualArtwork",
    name: title,
    description: description || undefined,
    url: pageUrl,
    image: config.defaultSensitiveOgpImageUrl,
    dateCreated: data.work.createdAt
      ? new Date(data.work.createdAt * 1000).toISOString()
      : undefined,
    inLanguage: lang,
    keywords: data.work.tagNames?.length
      ? data.work.tagNames.join(", ")
      : undefined,
    author: data.work.user?.name
      ? {
          "@type": "Person",
          name: data.work.user.name,
          url: userUrl,
        }
      : undefined,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": pageUrl,
    },
  }

  return (
    <>
      <AppBreadcrumbScript breadcrumb={breadcrumb} />
      <AppJsonLdScript jsonLd={artwork} />
      <SensitiveAgeGate />
      <SensitiveBlurToggle />
      <SensitiveWorkContainer
        post={data.post}
        work={data.work}
        discovery={data.discovery}
      />
    </>
  )
}

const workQuery = graphql(
  `query Work($id: ID!) {
    work(id: $id) {
      ...WorkArticle
    }
  }`,
  [sensitiveWorkArticleFragment],
)
