import { ParamsError } from "~/errors/params-error"
import { loaderClient } from "~/lib/loader-client"
import {
  sensitiveWorkArticleFragment,
  type workArticleFragment,
} from "~/routes/($lang)._main.posts.$post._index/components/work-article"
import { CommentListItemFragment } from "~/routes/($lang)._main.posts.$post._index/components/work-comment-list"
import {
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
import { getJstDate } from "~/utils/jst-date"
import { homeAwardWorksQuery } from "~/routes/($lang)._main._index/components/home-award-works"
import { SensitiveWorkContainer } from "~/routes/($lang)._main.r.posts.$post._index/components/sensitive-work-container"
import type { BreadcrumbList, VisualArtwork, WithContext } from "schema-dts"

export function HydrateFallback () {
  return <AppLoadingPage />
}

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.post === undefined) {
    throw new Response(null, { status: 404 })
  }

  // const redirectResponse = checkLocaleRedirect(props.request)

  // if (redirectResponse) {
  //   return redirectResponse
  // }

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

  // センシティブでない作品の場合は/postsにリダイレクト
  if (
    workResp.data.work.rating === "G" ||
    workResp.data.work.rating === "R15"
  ) {
    return redirect(`/posts/${props.params.post}`)
  }

  const workCommentsResp = await loaderClient.query({
    query: workCommentsQuery,
    variables: {
      workId: props.params.post,
    },
  })

  if (workCommentsResp.data.work === null) {
    throw new Response(null, { status: 404 })
  }

  const newComments = await loaderClient.query({
    query: newCommentsQuery,
    variables: {
      workId: props.params.post,
    },
  })

  const now = getJstDate(new Date())

  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  const awardWorks = await loaderClient.query({
    query: homeAwardWorksQuery,
    variables: {
      offset: 0,
      limit: 4,
      where: {
        isSensitive: true,
        year: yesterday.getFullYear(),
        month: yesterday.getMonth() + 1,
        day: yesterday.getDate(),
      },
    },
  })

  return {
    post: props.params.post,
    work: workResp.data.work,
    workComments: workCommentsResp.data.work.comments,
    newComments: newComments.data.newComments,
    awardWorks: awardWorks.data.workAwards,
  }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneDay,
})

export const meta: MetaFunction = (props) => {
  if (!props.data) {
    return [{ title: "Aipictorsの作品ページ" }]
  }

  const work = props.data as { work: FragmentOf<typeof workArticleFragment> }

  const localePrefix = props.params.lang === "en" ? "/en" : ""
  const baseUrl = `${config.siteURL}${localePrefix}`
  const pageUrl = `${baseUrl}/r/posts/${encodeURIComponent(props.params.post ?? work.work.id)}`

  const userPart =
    props.params.lang === "en"
      ? work.work.user
        ? ` - ${work.work.user?.name}`
        : ""
      : work.work.user
        ? ` - ${work.work.user?.name}の作品`
        : ""

  return createMeta(
    META.POSTS,
    {
      title: `${props.params.lang === "en" ? (work.work.enTitle.length > 0 ? work.work.enTitle : work.work.title) : work.work.title}${userPart}`,
      enTitle: `${props.params.lang === "en" ? (work.work.enTitle.length > 0 ? work.work.enTitle : work.work.title) : work.work.title}${userPart}`,
      description:
        props.params.lang === "en"
          ? work.work.enDescription ||
            work.work.description ||
            "Aipictors work page"
          : work.work.description ||
            "Aipictorsの作品ページです、AIイラストなどの作品を閲覧することができます",
      enDescription:
        props.params.lang === "en"
          ? work.work.enDescription ||
            work.work.description ||
            "Aipictors work page"
          : work.work.description ||
            "Aipictorsの作品ページです、AIイラストなどの作品を閲覧することができます",
      url: config.defaultSensitiveOgpImageUrl,
      pageUrl,
    },
    props.params.lang,
  )
}

export default function Work () {
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
      ? new Date(data.work.createdAt).toISOString()
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
      <SensitiveWorkContainer
        post={data.post}
        work={data.work}
        comments={data.workComments}
        newComments={data.newComments}
        awardWorks={data.awardWorks}
      />
    </>
  )
}

const workCommentsQuery = graphql(
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
  [sensitiveWorkArticleFragment],
)

const newCommentsQuery = graphql(
  `query NewComments {
    newComments: newComments(
      offset: 0,
      limit: 8,
      where: {
        isSensitive: true,
        isTextOnly: true,
        ratings: [R18, R18G],
      }
    ) {
      ...HomeNewComments
    }
  }`,
  [HomeNewCommentsFragment],
)
