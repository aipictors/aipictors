import { ParamsError } from "~/errors/params-error"
import { loaderClient } from "~/lib/loader-client"
import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { useParams, useSearchParams } from "@remix-run/react"
import { useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"
import { PhotoAlbumWorkFragment } from "~/components/responsive-photo-works-album"
import React, { useEffect } from "react"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import type { SortType } from "~/types/sort-type"
import { SensitiveTagWorkSection } from "~/routes/($lang)._main.tags._index/components/sensitive-tag-work-section"
import { config, META } from "~/config"
import { createSensitiveMeta } from "~/utils/create-sensitive-meta"
import {
  isIndexableSensitiveTag,
  isFeaturableSensitiveTag,
} from "~/utils/sensitive-tag-filter"
import { SensitiveTagLinks } from "~/routes/($lang).r._index/components/sensitive-tag-links"
import { AppBreadcrumbScript } from "~/components/app/app-breadcrumb-script"
import { AppJsonLdScript } from "~/components/app/app-jsonld-script"
import type {
  BreadcrumbList,
  CollectionPage,
  ItemList,
  WithContext,
} from "schema-dts"
import { useContext } from "react"
import { AuthContext } from "~/contexts/auth-context"
import { toListWorks } from "~/utils/to-list-works"

const TEMPORARILY_PRIVATE_TAGS = new Set(["ロリ"])

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.tag === undefined) {
    throw new Response(null, { status: 404 })
  }

  const decodedTag = decodeURIComponent(props.params.tag).normalize("NFKC")
  if (TEMPORARILY_PRIVATE_TAGS.has(decodedTag)) {
    throw new Response(null, { status: 404 })
  }

  // const redirectResponse = checkLocaleRedirect(props.request)

  // if (redirectResponse) {
  //   return redirectResponse
  // }

  const url = new URL(props.request.url)

  const page = url.searchParams.get("page")
    ? Number.parseInt(url.searchParams.get("page") as string) > 100
      ? 0
      : Number.parseInt(url.searchParams.get("page") as string)
    : 0

  const orderBy = url.searchParams.get("orderBy")
    ? (url.searchParams.get("orderBy") as IntrospectionEnum<"WorkOrderBy">)
    : "LIKES_COUNT"

  const sort = url.searchParams.get("sort")
    ? (url.searchParams.get("sort") as SortType)
    : "DESC"

  // mode パラメータを追加
  const mode = url.searchParams.get("mode") || "pagination"

  const worksResp = await loaderClient.query({
    query: tagWorksQuery,
    variables: {
      offset: page * 32,
      limit: 32,
      where: {
        tagNames: [decodedTag],
        orderBy: orderBy,
        sort: sort,
        isSensitive: true,
        isNowCreatedAt: true,
      },
    },
  })

  const [tagWorksCountResp, hotTagsResp] = await Promise.all([
    loaderClient.query({
      query: tagWorksCountQuery,
      variables: {
        where: {
          tagName: decodedTag,
          ratings: ["R18", "R18G"],
        },
      },
    }),
    loaderClient.query({ query: relatedHotTagsQuery }),
  ])

  return {
    tag: decodedTag,
    works: toListWorks(worksResp.data.tagWorks),
    worksCount: tagWorksCountResp.data.tagWorksCount,
    hotTagNames: hotTagsResp.data.hotSensitiveTags
      .map((tag) => tag.name)
      .filter((name) => name !== decodedTag && isFeaturableSensitiveTag(name))
      .slice(0, 16),
    page: page,
    isSensitive: true,
    mode: mode, // mode を追加
  }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneHour,
})

export const meta: MetaFunction<typeof loader> = (props) => {
  if (!props.data) {
    return createSensitiveMeta(META.SENSITIVE_DEFAULT, undefined, props.params.lang)
  }

  const worksCount = props.data.worksCount

  const tag = decodeURIComponent(props.params.tag ?? "")

  // 未成年を連想させるタグ・実在の人物・R18G に寄ったタグと、作品のないタグは検索エンジンに載せない
  if (!isIndexableSensitiveTag(tag) || worksCount === 0) {
    return createSensitiveMeta(META.SENSITIVE_DEFAULT, undefined, props.params.lang)
  }

  return createSensitiveMeta(
    META.TAGS,
    {
      title: `${tag}のR18 AIイラスト（${worksCount}件）`,
      enTitle: `${tag} R18 AI Illustrations (${worksCount})`,
      description: `「${tag}」タグが付いた18歳以上の方向けのAIイラスト一覧です（${worksCount}件）。人気順や新着順で探せて、プロンプトを公開している作品もあります。`,
      enDescription: `${worksCount} adult AI illustrations tagged "${tag}", for people aged 18 and over. Sort by popularity or date and see prompts where they are public.`,
    },
    props.params.lang,
  )
}

export default function Tag () {
  const params = useParams()

  const authContext = useContext(AuthContext)

  if (params.tag === undefined) {
    throw new ParamsError()
  }

  const data = useLoaderData<typeof loader>()

  const [searchParams, setSearchParams] = useSearchParams()

  const [workType, setWorkType] =
    React.useState<IntrospectionEnum<"WorkType"> | null>(
      (searchParams.get("workType") as IntrospectionEnum<"WorkType">) || null,
    )

  const defaultOrderBy: IntrospectionEnum<"WorkOrderBy"> =
    authContext.isLoggedIn ? "DATE_CREATED" : "LIKES_COUNT"

  const [WorkOrderby, setWorkOrderby] = React.useState<
    IntrospectionEnum<"WorkOrderBy">
  >(
    (searchParams.get("orderBy") as IntrospectionEnum<"WorkOrderBy">) ||
      defaultOrderBy,
  )

  const [worksOrderDeskAsc, setWorksOrderDeskAsc] = React.useState<SortType>(
    (searchParams.get("sort") as SortType) || "DESC",
  )

  const [_rating, setRating] =
    React.useState<IntrospectionEnum<"Rating"> | null>(
      (searchParams.get("rating") as IntrospectionEnum<"Rating">) || null,
    )

  const onClickTitleSortButton = () => {
    setWorkOrderby("NAME")
    setWorksOrderDeskAsc(worksOrderDeskAsc === "ASC" ? "DESC" : "ASC")
  }

  const onClickLikeSortButton = () => {
    setWorkOrderby("LIKES_COUNT")
    setWorksOrderDeskAsc(worksOrderDeskAsc === "ASC" ? "DESC" : "ASC")
  }

  const onClickBookmarkSortButton = () => {
    setWorkOrderby("BOOKMARKS_COUNT")
    setWorksOrderDeskAsc(worksOrderDeskAsc === "ASC" ? "DESC" : "ASC")
  }

  const onClickCommentSortButton = () => {
    setWorkOrderby("COMMENTS_COUNT")
    setWorksOrderDeskAsc(worksOrderDeskAsc === "ASC" ? "DESC" : "ASC")
  }

  const onClickViewSortButton = () => {
    setWorkOrderby("VIEWS_COUNT")
    setWorksOrderDeskAsc(worksOrderDeskAsc === "ASC" ? "DESC" : "ASC")
  }

  const onClickAccessTypeSortButton = () => {
    setWorkOrderby("ACCESS_TYPE")
    setWorksOrderDeskAsc(worksOrderDeskAsc === "ASC" ? "DESC" : "ASC")
  }

  const onClickDateSortButton = () => {
    setWorkOrderby("DATE_CREATED")
    setWorksOrderDeskAsc(worksOrderDeskAsc === "ASC" ? "DESC" : "ASC")
  }

  const onClickWorkTypeSortButton = () => {
    setWorkOrderby("WORK_TYPE")
    setWorksOrderDeskAsc(worksOrderDeskAsc === "ASC" ? "DESC" : "ASC")
  }

  const onClickIsPromotionSortButton = () => {
    setWorkOrderby("IS_PROMOTION")
    setWorksOrderDeskAsc(worksOrderDeskAsc === "ASC" ? "DESC" : "ASC")
  }

  const [page, setPage] = React.useState(Number(searchParams.get("page")) || 0)

  const [hasPrompt, setHasPrompt] = React.useState(
    Number(searchParams.get("prompt")) || 0,
  )

  // mode の状態を追加
  const [mode, setMode] = React.useState<"feed" | "pagination">(
    (searchParams.get("mode") as "feed" | "pagination") || "pagination",
  )

  // URLパラメータの監視と更新
  useEffect(() => {
    // 既定の値は URL に出さない（同じ一覧が別の URL で検索結果に出てしまうのを防ぐ）
    const params = new URLSearchParams()
    if (workType) {
      params.set("workType", workType)
    }
    if (WorkOrderby !== defaultOrderBy) {
      params.set("orderBy", WorkOrderby)
    }
    if (worksOrderDeskAsc !== "DESC") {
      params.set("sort", worksOrderDeskAsc)
    }
    if (page > 0) {
      params.set("page", page.toString())
    }
    if (hasPrompt > 0) {
      params.set("prompt", hasPrompt.toString())
    }

    // mode パラメータの処理（デフォルトがpaginationなのでfeedの時のみセット）
    if (mode === "feed") {
      params.set("mode", "feed")
    }

    if (params.toString() === searchParams.toString()) {
      return
    }

    setSearchParams(params, { replace: true, preventScrollReset: true })
  }, [
    page,
    hasPrompt,
    workType,
    WorkOrderby,
    worksOrderDeskAsc,
    mode,
    defaultOrderBy,
    searchParams,
    setSearchParams,
  ])

  if (data === null) {
    return null
  }

  const localePrefix = params.lang === "en" ? "/en" : ""
  const baseUrl = `${config.siteURL}${localePrefix}`
  const lang = params.lang === "en" ? "en" : "ja"
  const tagName = decodeURIComponent(params.tag)
  const pageUrl = `${baseUrl}/r/tags/${encodeURIComponent(tagName)}`

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
        name: lang === "en" ? "R18 AI Illustrations" : "R18 AIイラスト",
        item: `${baseUrl}/r`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: tagName,
        item: pageUrl,
      },
    ],
  }

  const itemList: WithContext<ItemList> = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name:
      lang === "en" ? `R18 works tagged ${tagName}` : `${tagName}のR18作品一覧`,
    numberOfItems: data.works?.length ?? 0,
    itemListElement: (data.works ?? []).map((work, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${baseUrl}/r/posts/${encodeURIComponent(work.id)}`,
      name:
        lang === "en" && work.enTitle && work.enTitle.length > 0
          ? work.enTitle
          : work.title,
    })),
  }

  const collectionPage: WithContext<CollectionPage> = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name:
      lang === "en"
        ? `${tagName} R18 AI Illustrations`
        : `${tagName}のR18 AIイラスト`,
    url: pageUrl,
    inLanguage: lang,
    isFamilyFriendly: false,
  }

  return (
    <>
      <AppBreadcrumbScript breadcrumb={breadcrumb} />
      <AppJsonLdScript jsonLd={[collectionPage, itemList]} />
      <h1 className="sr-only">
        {lang === "en"
          ? `${tagName} R18 AI illustrations`
          : `${tagName}のR18 AIイラスト`}
      </h1>
      <SensitiveTagWorkSection
        works={data.works}
        worksCount={data.worksCount}
        page={page}
        hasPrompt={hasPrompt}
        mode={mode}
        setMode={setMode}
        sort={worksOrderDeskAsc}
        orderBy={WorkOrderby}
        tag={tagName}
        setPage={setPage}
        onClickTitleSortButton={onClickTitleSortButton}
        onClickLikeSortButton={onClickLikeSortButton}
        onClickBookmarkSortButton={onClickBookmarkSortButton}
        onClickCommentSortButton={onClickCommentSortButton}
        onClickViewSortButton={onClickViewSortButton}
        onClickAccessTypeSortButton={onClickAccessTypeSortButton}
        onClickDateSortButton={onClickDateSortButton}
        onClickWorkTypeSortButton={onClickWorkTypeSortButton}
        onClickIsPromotionSortButton={onClickIsPromotionSortButton}
        setWorkType={setWorkType}
        setRating={setRating}
        setSort={setWorksOrderDeskAsc}
        setHasPrompt={setHasPrompt}
      />
      <SensitiveTagLinks
        title={lang === "en" ? "Popular tags" : "人気のタグ"}
        tagNames={data.hotTagNames}
      />
    </>
  )
}

export const tagWorksQuery = graphql(
  `query Works($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    tagWorks(offset: $offset, limit: $limit, where: $where) {
      ...PhotoAlbumWork
    }
  }`,
  [PhotoAlbumWorkFragment],
)

const relatedHotTagsQuery = graphql(
  `query RelatedHotSensitiveTags {
    hotSensitiveTags {
      id
      name
    }
  }`,
)

const tagWorksCountQuery = graphql(
  `query TagWorksCount($where: TagWorksCountWhereInput!) {
    tagWorksCount(where: $where)
  }`,
)
