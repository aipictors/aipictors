import { ParamsError } from "~/errors/params-error"
import { loaderClient } from "~/lib/loader-client"
import { workArticleFragment } from "~/routes/($lang)._main.posts.$post._index/components/work-article"
import { CommentListItemFragment } from "~/routes/($lang)._main.posts.$post._index/components/work-comment-list"
import { WorkContainer } from "~/routes/($lang)._main.posts.$post._index/components/work-container"
import {
  json,
  redirect,
  type HeadersFunction,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/cloudflare"
import { useParams } from "@remix-run/react"
import { useLoaderData } from "@remix-run/react"
import { type FragmentOf, graphql } from "gql.tada"
import { AppLoadingPage } from "~/components/app/app-loading-page"
import { AppBreadcrumbScript } from "~/components/app/app-breadcrumb-script"
import { AppJsonLdScript } from "~/components/app/app-jsonld-script"
import { config, META } from "~/config"
import { createMeta } from "~/utils/create-meta"
import { HomeNewCommentsFragment } from "~/routes/($lang)._main._index/components/home-new-comments"
import { homeAwardWorksQuery } from "~/routes/($lang)._main._index/components/home-award-works"
import { getJstDate } from "~/utils/jst-date"
import type { BreadcrumbList, VisualArtwork, WithContext } from "schema-dts"

const PUBLIC_POST_CACHE_CONTROL =
  "public, max-age=0, s-maxage=120, stale-while-revalidate=600"

export function HydrateFallback () {
  return <AppLoadingPage />
}

export async function loader(props: LoaderFunctionArgs) {
  // const redirectResponse = checkLocaleRedirect(props.request)

  // if (redirectResponse) {
  //   return redirectResponse
  // }

  if (props.params.post === undefined) {
    throw new Response(null, { status: 404 })
  }

  const workResp = await loaderClient.query({
    query: workQuery,
    variables: {
      id: props.params.post,
    },
  })

  if (workResp.data.work === null) {
    throw new Response(null, { status: 404 })
  }

  // 非公開の場合はエラー
  if (
    workResp.data.work.accessType === "PRIVATE" ||
    workResp.data.work.accessType === "DRAFT"
  ) {
    throw new Response(null, { status: 404 })
  }

  // センシティブな作品の場合は/r/にリダイレクト
  if (
    workResp.data.work.rating === "R18" ||
    workResp.data.work.rating === "R18G"
  ) {
    return redirect(`/r/posts/${props.params.post}`)
  }

  return json(
    {
      post: props.params.post,
      work: workResp.data.work,
    },
    {
      headers: {
        "Cache-Control": PUBLIC_POST_CACHE_CONTROL,
      },
    },
  )
}

export const meta: MetaFunction = (props) => {
  if (!props.data) {
    if (props.params.lang === "en") {
      return [{ title: "Aipictors works page" }]
    }
    return [{ title: "Aipictorsの作品ページ" }]
  }

  if (
    typeof props.data !== "object" ||
    props.data === null ||
    !("work" in props.data)
  ) {
    return [{ title: "Aipictorsの作品ページ" }]
  }

  const work = props.data as { work: FragmentOf<typeof workArticleFragment> }

  const localePrefix = props.params.lang === "en" ? "/en" : ""
  const baseUrl = `${config.siteURL}${localePrefix}`
  const pageUrl = `${baseUrl}/posts/${encodeURIComponent(props.params.post ?? work.work.id)}`

  const userPart =
    props.params.lang === "en"
      ? work.work.user
        ? ` - ${work.work.user?.name}`
        : ""
      : work.work.user
        ? ` - ${work.work.user?.name}の作品`
        : ""

  const metaImageUrl =
    work.work.ogpThumbnailImageUrl ||
    work.work.largeThumbnailImageURL ||
    work.work.smallThumbnailImageURL ||
    work.work.imageURL ||
    config.defaultOgpImageUrl

  // 説明がない・短い作品は、タグ・モデルから説明文を作る（同じ説明文のページが大量にできないように）
  const tagText = (work.work.tagNames ?? []).slice(0, 6)
  const styleLabelJa =
    work.work.style === "REAL"
      ? "AIフォト"
      : work.work.type === "VIDEO"
        ? "AI動画"
        : work.work.type === "NOVEL" || work.work.type === "COLUMN"
          ? "AI小説"
          : "AIイラスト"
  const generatedDescriptionJa = `${work.work.title}${
    work.work.user ? `（${work.work.user.name}）` : ""
  }の${styleLabelJa}です。${
    tagText.length > 0 ? `タグ: ${tagText.join("、")}。` : ""
  }${work.work.model ? `モデル: ${work.work.model}。` : ""}${
    work.work.promptAccessType === "PUBLIC" && work.work.prompt
      ? "プロンプトも公開されています。"
      : ""
  }`
  const generatedDescriptionEn = `${
    work.work.enTitle || work.work.title
  }${work.work.user ? ` by ${work.work.user.name}` : ""} on Aipictors.${
    tagText.length > 0 ? ` Tags: ${tagText.join(", ")}.` : ""
  }${work.work.model ? ` Model: ${work.work.model}.` : ""}`
  const ownDescriptionJa = (work.work.description ?? "").trim()
  const ownDescriptionEn = (
    work.work.enDescription ||
    work.work.description ||
    ""
  ).trim()
  const descriptionJa =
    ownDescriptionJa.length >= 40
      ? ownDescriptionJa
      : `${ownDescriptionJa ? `${ownDescriptionJa} ` : ""}${generatedDescriptionJa}`
  const descriptionEn =
    ownDescriptionEn.length >= 60
      ? ownDescriptionEn
      : `${ownDescriptionEn ? `${ownDescriptionEn} ` : ""}${generatedDescriptionEn}`

  const metaTags = createMeta(
    META.POSTS,
    {
      title: `${props.params.lang === "en" ? (work.work.enTitle.length > 0 ? work.work.enTitle : work.work.title) : work.work.title}${userPart}`,
      enTitle: `${props.params.lang === "en" ? (work.work.enTitle.length > 0 ? work.work.enTitle : work.work.title) : work.work.title}${userPart}`,
      description: props.params.lang === "en" ? descriptionEn : descriptionJa,
      enDescription: descriptionEn,
      url: metaImageUrl,
      pageUrl,
    },
    props.params.lang,
  )

  // 作品ページの LCP はメイン画像なので、HTML の解析を待たずに読み込みを始める
  const shouldPreloadMainImage =
    work.work.type === "WORK" &&
    work.work.imageURL.length > 0 &&
    (work.work.rating === "G" || work.work.rating === "R15")

  if (!shouldPreloadMainImage) {
    return metaTags
  }

  return [
    ...metaTags,
    {
      tagName: "link",
      rel: "preload",
      as: "image",
      href: work.work.imageURL,
      fetchPriority: "high",
    },
  ]
}

export const headers: HeadersFunction = ({ loaderHeaders }) => ({
  "Cache-Control":
    loaderHeaders.get("Cache-Control") ?? config.cacheControl.short,
})

export default function Work () {
  const params = useParams()

  if (params.post === undefined) {
    throw new ParamsError()
  }

  const data = useLoaderData<typeof loader>()

  if (data === null) {
    return null
  }

  if (!("work" in data) || data.work === null) {
    return null
  }

  const localePrefix = params.lang === "en" ? "/en" : ""
  const baseUrl = `${config.siteURL}${localePrefix}`
  const lang = params.lang === "en" ? "en" : "ja"
  const pageUrl = `${baseUrl}/posts/${encodeURIComponent(data.post)}`
  const userUrl = data.work.user?.login
    ? `${baseUrl}/users/${encodeURIComponent(data.work.user.login)}`
    : undefined

  const title =
    lang === "en"
      ? data.work.enTitle && data.work.enTitle.length > 0
        ? data.work.enTitle
        : data.work.title
      : data.work.title

  const descriptionRaw =
    lang === "en"
      ? data.work.enDescription || data.work.description || ""
      : data.work.description || ""
  const description =
    descriptionRaw.length > 300
      ? `${descriptionRaw.slice(0, 297)}...`
      : descriptionRaw

  const imageUrl =
    data.work.imageURL ||
    data.work.largeThumbnailImageURL ||
    data.work.smallThumbnailImageURL ||
    ""

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
        name: lang === "en" ? "Works" : "作品",
        item: `${baseUrl}/posts`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: title,
        item: pageUrl,
      },
    ],
  }

  // createdAt は unix 秒
  const createdAtIso = data.work.createdAt
    ? new Date(data.work.createdAt * 1000).toISOString()
    : undefined
  const author = data.work.user?.name
    ? {
        "@type": "Person" as const,
        name: data.work.user.name,
        url: userUrl,
      }
    : undefined

  const artwork: WithContext<VisualArtwork> = {
    "@context": "https://schema.org",
    "@type": "VisualArtwork",
    name: title,
    description: description || undefined,
    url: pageUrl,
    image: imageUrl
      ? {
          "@type": "ImageObject",
          contentUrl: imageUrl,
          thumbnailUrl: data.work.largeThumbnailImageURL || undefined,
          creator: author,
          creditText: data.work.user?.name,
          copyrightNotice: data.work.user?.name
            ? `© ${data.work.user.name}`
            : undefined,
          acquireLicensePage: `${baseUrl}/terms`,
        }
      : undefined,
    thumbnailUrl: data.work.largeThumbnailImageURL || undefined,
    artMedium: data.work.style === "REAL" ? "AI generated photo" : "AI generated image",
    artform: "Digital art",
    dateCreated: createdAtIso,
    datePublished: createdAtIso,
    contentRating: data.work.rating ?? undefined,
    creditText: data.work.user?.name,
    interactionStatistic: [
      {
        "@type": "InteractionCounter",
        interactionType: { "@type": "LikeAction" },
        userInteractionCount: data.work.likesCount,
      },
      {
        "@type": "InteractionCounter",
        interactionType: { "@type": "WatchAction" },
        userInteractionCount: data.work.viewsCount,
      },
      {
        "@type": "InteractionCounter",
        interactionType: { "@type": "CommentAction" },
        userInteractionCount: data.work.commentsCount,
      },
    ],
    inLanguage: lang,
    keywords: data.work.tagNames?.length
      ? data.work.tagNames.join(", ")
      : undefined,
    author,
    creator: author,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": pageUrl,
    },
  }

  return (
    <>
      <AppBreadcrumbScript breadcrumb={breadcrumb} />
      <AppJsonLdScript jsonLd={artwork} />
      <WorkContainer
        post={data.post}
        work={data.work}
      />
    </>
  )
}

export const workCommentsQuery = graphql(
  `query WorkComments($workId: ID!) {
    work(id: $workId) {
      id
      comments(offset: 0, limit: 128) {
        ...Comment
      }
    }
  }`,
  [CommentListItemFragment],
)

const workQuery = graphql(
  `query Work($id: ID!) {
    work(id: $id) {
      ...WorkArticle
    }
  }`,
  [workArticleFragment],
)

export const newCommentsQuery = graphql(
  `query NewComments {
    newComments: newComments(
      offset: 0,
      limit: 8,
      where: {
        isSensitive: false,
        isTextOnly: true,
        ratings: [G],
      }
    ) {
      ...HomeNewComments
    }
  }`,
  [HomeNewCommentsFragment],
)
