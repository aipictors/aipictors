import React, { Suspense, useEffect } from "react"
import { useSearchParams } from "@remix-run/react"
import { AppLoadingPage } from "~/components/app/app-loading-page"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import type { SortType } from "~/types/sort-type"
import { WorksListContainer } from "~/routes/($lang).my._index/components/works-list-container"
import { WorksSetting } from "~/routes/($lang).my._index/components/works-settings"
import type { MetaFunction } from "@remix-run/cloudflare"
import { createMeta } from "~/utils/create-meta"
import { META } from "~/config"

export const meta: MetaFunction = () => {
  return createMeta(META.MY_POSTS)
}

export default function MyPosts() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [page, setPage] = React.useState(Number(searchParams.get("page")) || 0)

  const [albumOrderDeskAsc, setAlbumOrderDeskAsc] = React.useState<SortType>(
    (searchParams.get("albumOrderDeskAsc") as SortType) || "DESC",
  )

  const [accessType, setAccessType] =
    React.useState<IntrospectionEnum<"AccessType"> | null>(
      (searchParams.get("accessType") as IntrospectionEnum<"AccessType">) ||
        null,
    )

  const [workType, setWorkType] =
    React.useState<IntrospectionEnum<"WorkType"> | null>(
      (searchParams.get("workType") as IntrospectionEnum<"WorkType">) || null,
    )

  const [WorkOrderby, setWorkOrderby] = React.useState<
    IntrospectionEnum<"WorkOrderBy">
  >(
    (searchParams.get("WorkOrderby") as IntrospectionEnum<"WorkOrderBy">) ||
      "DATE_CREATED",
  )

  const [worksOrderDeskAsc, setWorksOrderDeskAsc] = React.useState<SortType>(
    (searchParams.get("worksOrderDeskAsc") as SortType) || "DESC",
  )

  const [rating, setRating] =
    React.useState<IntrospectionEnum<"Rating"> | null>(
      (searchParams.get("rating") as IntrospectionEnum<"Rating">) || null,
    )

  // URLパラメータの監視と更新
  useEffect(() => {
    const params = new URLSearchParams()

    params.set("page", String(page))
    params.set("albumOrderDeskAsc", albumOrderDeskAsc)
    if (accessType) params.set("accessType", accessType)
    if (workType) params.set("workType", workType)
    if (rating) params.set("rating", rating)
    params.set("WorkOrderby", WorkOrderby)
    params.set("worksOrderDeskAsc", worksOrderDeskAsc)

    setSearchParams(params)
  }, [
    page,
    albumOrderDeskAsc,
    accessType,
    workType,
    rating,
    WorkOrderby,
    worksOrderDeskAsc,
    setSearchParams,
  ])

  // 作品一覧のソートボタンクリック時の処理
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

  const [worksMaxCount, setWorksMaxCount] = React.useState(0)

  return (
    <>
      <Suspense fallback={<AppLoadingPage />}>
        <>
          <WorksSetting
            sort={worksOrderDeskAsc}
            orderBy={WorkOrderby}
            sumWorksCount={worksMaxCount}
            accessType={accessType}
            workType={workType}
            rating={rating}
            onClickTitleSortButton={onClickTitleSortButton}
            onClickLikeSortButton={onClickLikeSortButton}
            onClickBookmarkSortButton={onClickBookmarkSortButton}
            onClickCommentSortButton={onClickCommentSortButton}
            onClickViewSortButton={onClickViewSortButton}
            onClickAccessTypeSortButton={onClickAccessTypeSortButton}
            onClickDateSortButton={onClickDateSortButton}
            onClickWorkTypeSortButton={onClickWorkTypeSortButton}
            setAccessType={setAccessType}
            setWorkType={setWorkType}
            setRating={setRating}
            setSort={setWorksOrderDeskAsc}
          />
          <Suspense fallback={<AppLoadingPage />}>
            <WorksListContainer
              page={page}
              accessType={accessType}
              workType={workType}
              rating={rating}
              sort={worksOrderDeskAsc}
              orderBy={WorkOrderby}
              setWorksMaxCount={setWorksMaxCount}
              setAccessType={setAccessType}
              setRating={setRating}
              setSort={setWorksOrderDeskAsc}
              setPage={setPage}
              onClickTitleSortButton={onClickTitleSortButton}
              onClickLikeSortButton={onClickLikeSortButton}
              onClickBookmarkSortButton={onClickBookmarkSortButton}
              onClickCommentSortButton={onClickCommentSortButton}
              onClickViewSortButton={onClickViewSortButton}
              onClickAccessTypeSortButton={onClickAccessTypeSortButton}
              onClickDateSortButton={onClickDateSortButton}
              onClickWorkTypeSortButton={onClickWorkTypeSortButton}
            />
          </Suspense>
        </>
      </Suspense>
    </>
  )
}
