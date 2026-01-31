import { ParamsError } from "~/errors/params-error"
import { loaderClient } from "~/lib/loader-client"
import { TagWorkSection } from "~/routes/($lang)._main.tags._index/components/tag-work-section"
import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { useParams, useSearchParams } from "@remix-run/react"
import { useLoaderData } from "@remix-run/react"
import { graphql, readFragment } from "gql.tada"
import { PhotoAlbumWorkFragment } from "~/components/responsive-photo-works-album"
import React, { useEffect } from "react"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import type { SortType } from "~/types/sort-type"
import { config, META } from "~/config"
import { createMeta } from "~/utils/create-meta"
import { AppBreadcrumbScript } from "~/components/app/app-breadcrumb-script"
import { AppJsonLdScript } from "~/components/app/app-jsonld-script"
import type { BreadcrumbList, ItemList, WithContext } from "schema-dts"
import { useContext } from "react"
import { AuthContext } from "~/contexts/auth-context"

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.tag === undefined) {
    throw new Response(null, { status: 404 })
  }

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

  const isSensitive = url.searchParams.get("sensitive") === "1"

  // mode パラメータを追加
  const mode = url.searchParams.get("mode") || "pagination"

  const tagName = decodeURIComponent(props.params.tag)

  console.log("Loading tag page for:", tagName, "isSensitive:", isSensitive)

  // ログイン状態を確認するためにviewerを取得
  let isLoggedIn = false
  try {
    const viewerResp = await loaderClient.query({
      query: viewerQuery,
      variables: {},
    })
    isLoggedIn = !!viewerResp.data.viewer
    console.log(
      "User logged in:",
      isLoggedIn,
      "User ID:",
      viewerResp.data.viewer?.id,
    )
  } catch (error) {
    console.log("Not logged in or viewer query failed:", error)
    isLoggedIn = false
  }

  // 全年齢作品を検索
  const generalWorksResp = await loaderClient.query({
    query: tagWorksQuery,
    variables: {
      offset: page * 32,
      limit: 32,
      where: {
        tagNames: [tagName],
        orderBy: orderBy,
        sort: sort,
        ratings: ["G", "R15"],
        ...(isSensitive === true && {
          isSensitive: isSensitive,
        }),
        isNowCreatedAt: true,
      },
    },
  })

  console.log("General works found:", generalWorksResp.data.tagWorks.length)

  // 全年齢作品が見つからず、R18検索がまだ実行されていない場合、R18作品を検索
  let worksResp = generalWorksResp
  let shouldShowR18 = false

  if (generalWorksResp.data.tagWorks.length === 0 && !isSensitive) {
    console.log("No general works found, searching R18 works...")
    console.log("User is logged in:", isLoggedIn)

    const r18WorksResp = await loaderClient.query({
      query: tagWorksQuery,
      variables: {
        offset: page * 32,
        limit: 32,
        where: {
          tagNames: [tagName],
          orderBy: orderBy,
          sort: sort,
          ratings: ["R18", "R18G"],
          isSensitive: true,
          isNowCreatedAt: true,
        },
      },
    })

    console.log("R18 works found:", r18WorksResp.data.tagWorks.length)

    if (r18WorksResp.data.tagWorks.length > 0) {
      worksResp = r18WorksResp
      shouldShowR18 = true
      console.log("Using R18 works as fallback")
    } else {
      console.log("No R18 works found either")
    }
  } else if (generalWorksResp.data.tagWorks.length > 0) {
    console.log("General works found, no need for R18 fallback")
  } else if (isSensitive) {
    console.log(
      "Already searching with isSensitive=true, skipping R18 fallback",
    )
  }

  const tagWorksCountResp = await loaderClient.query({
    query: tagWorksCountQuery,
    variables: {
      where: {
        tagName: tagName,
        ratings: shouldShowR18 ? ["R18", "R18G"] : ["G", "R15"],
      },
    },
  })

  console.log(
    "Final result - shouldShowR18:",
    shouldShowR18,
    "worksCount:",
    tagWorksCountResp.data.tagWorksCount,
  )

  return {
    tag: tagName,
    works: worksResp.data.tagWorks,
    worksCount: tagWorksCountResp.data.tagWorksCount,
    page: page,
    isSensitive: shouldShowR18 || isSensitive,
    mode: mode, // mode を追加
    shouldShowR18: shouldShowR18, // R18作品を表示すべきかのフラグ
  }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneHour,
})

export const meta: MetaFunction<typeof loader> = (props) => {
  if (!props.data) {
    return [{ title: "タグページ" }]
  }

  const works = readFragment(PhotoAlbumWorkFragment, props.data.works)

  const thumbnailUrl = works.length ? works[0].smallThumbnailImageURL : ""

  const worksCount = props.data.worksCount

  const tag = decodeURIComponent(props.params.tag ?? "")

  const lang = props.params.lang ?? "ja"
  const pageUrl = `${config.siteURL}/${lang}/tags/${encodeURIComponent(tag)}`

  return createMeta(
    META.TAGS,
    {
      title: `${tag}のAIイラスト ${worksCount}件`,
      enTitle: `A list of works where AI illustrations of ${tag} are posted.`,
      description: `${tag}のAIイラストが投稿された作品一覧ページです。`,
      enDescription: `This is a list of works where AI illustrations of ${tag} are posted.`,
      url: thumbnailUrl,
      pageUrl,
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

  const [WorkOrderby, setWorkOrderby] = React.useState<
    IntrospectionEnum<"WorkOrderBy">
  >(
    (searchParams.get("orderBy") as IntrospectionEnum<"WorkOrderBy">) ||
      (authContext.isLoggedIn ? "DATE_CREATED" : "LIKES_COUNT"),
  )

  const [worksOrderDeskAsc, setWorksOrderDeskAsc] = React.useState<SortType>(
    (searchParams.get("sort") as SortType) || "DESC",
  )

  const [_rating, setRating] =
    React.useState<IntrospectionEnum<"Rating"> | null>(
      (searchParams.get("rating") as IntrospectionEnum<"Rating">) || null,
    )

  const [page, setPage] = React.useState(Number(searchParams.get("page")) || 0)

  const [hasPrompt, setHasPrompt] = React.useState(
    Number(searchParams.get("prompt")) || 0,
  )

  // mode の状態を追加
  const [mode, setMode] = React.useState<"feed" | "pagination">(
    (searchParams.get("mode") as "feed" | "pagination") || "pagination",
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

  // URLパラメータの監視と更新
  useEffect(() => {
    setSearchParams(
      (prevParams) => {
        const params = new URLSearchParams(prevParams)

        if (workType) {
          params.set("workType", workType)
        } else {
          params.delete("workType")
        }

        params.set("orderBy", WorkOrderby)
        params.set("sort", worksOrderDeskAsc)
        params.set("page", page.toString())
        params.set("prompt", hasPrompt.toString())

        // mode パラメータの処理（デフォルトがfeedなのでpaginationの時のみセット）
        if (mode === "pagination") {
          params.set("mode", "pagination")
        } else {
          params.delete("mode")
        }

        // isSensitiveのパラメータが1なら、セット
        if (data.isSensitive) {
          params.set("sensitive", "1")
        } else {
          params.delete("sensitive")
        }

        return params
      },
      { replace: true },
    )
  }, [
    page,
    hasPrompt,
    workType,
    WorkOrderby,
    worksOrderDeskAsc,
    mode,
    data.isSensitive,
    setSearchParams,
  ])

  if (data === null) {
    return null
  }

  const lang = params.lang === "en" ? "en" : "ja"
  const tagName = decodeURIComponent(params.tag)
  const pageUrl = `${config.siteURL}/${lang}/tags/${encodeURIComponent(tagName)}`

  const breadcrumb: WithContext<BreadcrumbList> = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Aipictors",
        item: `${config.siteURL}/${lang}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: lang === "en" ? "Tags" : "タグ",
        item: `${config.siteURL}/${lang}/tags`,
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
    name: lang === "en" ? `Works tagged ${tagName}` : `${tagName}の作品一覧`,
    numberOfItems: data.works?.length ?? 0,
    itemListElement: (data.works ?? []).map((work, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${config.siteURL}/${lang}/posts/${encodeURIComponent(work.id)}`,
      name:
        lang === "en" && work.enTitle && work.enTitle.length > 0
          ? work.enTitle
          : work.title,
    })),
  }

  return (
    <>
      {!data.isSensitive && (
        <>
          <AppBreadcrumbScript breadcrumb={breadcrumb} />
          <AppJsonLdScript jsonLd={itemList} />
        </>
      )}
      <TagWorkSection
        works={data.works}
        worksCount={data.worksCount}
        tag={tagName}
        page={page}
        setPage={setPage}
        hasPrompt={hasPrompt}
        mode={mode}
        setMode={setMode}
        shouldShowR18={data.shouldShowR18}
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
        sort={worksOrderDeskAsc}
        orderBy={WorkOrderby}
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

const tagWorksCountQuery = graphql(
  `query TagWorksCount($where: TagWorksCountWhereInput!) {
    tagWorksCount(where: $where)
  }`,
)

const viewerQuery = graphql(`
  query Viewer {
    viewer {
      id
      login
    }
  }
`)
