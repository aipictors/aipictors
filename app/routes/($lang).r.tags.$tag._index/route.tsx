import { ParamsError } from "~/errors/params-error"
import { loaderClient } from "~/lib/loader-client"
import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/cloudflare"
import { useParams, useSearchParams } from "@remix-run/react"
import { useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"
import { PhotoAlbumWorkFragment } from "~/components/responsive-photo-works-album"
import React, { useEffect } from "react"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import type { SortType } from "~/types/sort-type"
import { SensitiveTagWorkSection } from "~/routes/($lang)._main.tags._index/components/sensitive-tag-work-section"
import { config } from "~/config"

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.tag === undefined) {
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

  const worksResp = await loaderClient.query({
    query: tagWorksQuery,
    variables: {
      offset: page * 32,
      limit: 32,
      where: {
        tagNames: [decodeURIComponent(props.params.tag)],
        orderBy: orderBy,
        sort: sort,
        isSensitive: true,
      },
    },
  })

  const tagWorksCountResp = await loaderClient.query({
    query: tagWorksCountQuery,
    variables: {
      where: {
        tagName: decodeURIComponent(props.params.tag),
        ratings: ["R18", "R18G"],
      },
    },
  })

  return {
    tag: decodeURIComponent(props.params.tag),
    works: worksResp.data.tagWorks,
    worksCount: tagWorksCountResp.data.tagWorksCount,
    page: page,
    isSensitive: true,
  }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneHour,
})

export default function Tag() {
  const params = useParams()

  if (params.tag === undefined) {
    throw ParamsError()
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
      "LIKES_COUNT",
  )

  const [worksOrderDeskAsc, setWorksOrderDeskAsc] = React.useState<SortType>(
    (searchParams.get("sort") as SortType) || "DESC",
  )

  const [rating, setRating] =
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

  if (data === null) {
    return null
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

    // isSensitiveのパラメータが1なら、セット
    if (data.isSensitive) {
      params.set("sensitive", "1")
    }

    setSearchParams(params)
  }, [page, workType, WorkOrderby, worksOrderDeskAsc])

  return (
    <>
      <SensitiveTagWorkSection
        works={data.works}
        worksCount={data.worksCount}
        tag={decodeURIComponent(params.tag)}
        page={page}
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
