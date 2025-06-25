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

  const worksResp = await loaderClient.query({
    query: tagWorksQuery,
    variables: {
      offset: page * 32,
      limit: 32,
      where: {
        tagNames: [decodeURIComponent(props.params.tag)],
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

  const tagWorksCountResp = await loaderClient.query({
    query: tagWorksCountQuery,
    variables: {
      where: {
        tagName: decodeURIComponent(props.params.tag),
        ratings: ["G", "R15"],
      },
    },
  })

  return {
    tag: decodeURIComponent(props.params.tag),
    works: worksResp.data.tagWorks,
    worksCount: tagWorksCountResp.data.tagWorksCount,
    page: page,
    isSensitive: isSensitive,
    mode: mode, // mode を追加
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

  return createMeta(
    META.TAGS,
    {
      title: `${tag}のAIイラスト ${worksCount}件`,
      enTitle: `A list of works where AI illustrations of ${tag} are posted.`,
      description: `${tag}のAIイラストが投稿された作品一覧ページです。`,
      enDescription: `This is a list of works where AI illustrations of ${tag} are posted.`,
      url: thumbnailUrl,
    },
    props.params.lang,
  )
}

export default function Tag() {
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
    const params = new URLSearchParams()

    if (workType) {
      params.set("workType", workType)
    }

    params.set("orderBy", WorkOrderby)
    params.set("sort", worksOrderDeskAsc)
    params.set("page", page.toString())
    params.set("prompt", hasPrompt.toString())

    // mode パラメータの処理（デフォルトがfeedなのでpaginationの時のみセット）
    if (mode === "pagination") {
      params.set("mode", "pagination")
    }

    // isSensitiveのパラメータが1なら、セット
    if (data.isSensitive) {
      params.set("sensitive", "1")
    }

    setSearchParams(params, { replace: true })
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

  return (
    <>
      <TagWorkSection
        works={data.works}
        worksCount={data.worksCount}
        tag={decodeURIComponent(params.tag)}
        page={page}
        setPage={setPage}
        hasPrompt={hasPrompt}
        mode={mode}
        setMode={setMode}
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
