import { AppLoadingPage } from "@/_components/app/app-loading-page"
import type { IntrospectionEnum } from "@/_lib/introspection-enum"
import type { SortType } from "@/_types/sort-type"
import { WorksListContainer } from "@/routes/($lang).my._index/_components/works-list-container"
import { WorksSetting } from "@/routes/($lang).my._index/_components/works-settings"
import type { HeadersFunction, MetaFunction } from "@remix-run/cloudflare"
import React from "react"
import { Suspense } from "react"

export const headers: HeadersFunction = () => {
  return {
    "Cache-Control": "max-age=0, s-maxage=0",
  }
}

export const meta: MetaFunction = () => {
  const metaTitle = "Aipictors - ダッシュボード - 作品"

  const metaDescription = "ダッシュボード - 作品"

  const metaImage =
    "https://pub-c8b482e79e9f4e7ab4fc35d3eb5ecda8.r2.dev/aipictors-ogp.jpg"

  return [
    { title: metaTitle },
    { name: "description", content: metaDescription },
    { name: "robots", content: "noindex" },
    { name: "twitter:title", content: metaTitle },
    { name: "twitter:description", content: metaDescription },
    { name: "twitter:image", content: metaImage },
    { name: "twitter:card", content: "summary_large_image" },
    { property: "og:title", content: metaTitle },
    { property: "og:description", content: metaDescription },
    { property: "og:image", content: metaImage },
    { property: "og:site_name", content: metaTitle },
  ]
}

export default function MyPosts() {
  const [page, setPage] = React.useState(0)

  const [albumOrderDeskAsc, setAlbumOrderDeskAsc] =
    React.useState<SortType>("DESC")

  const [accessType, setAccessType] =
    React.useState<IntrospectionEnum<"AccessType"> | null>(null)

  const [workType, setWorkType] =
    React.useState<IntrospectionEnum<"WorkType"> | null>(null)

  const [WorkOrderby, setWorkOrderby] =
    React.useState<IntrospectionEnum<"WorkOrderBy">>("DATE_CREATED")

  const [worksOrderDeskAsc, setWorksOrderDeskAsc] =
    React.useState<SortType>("DESC")

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

  const [rating, setRating] =
    React.useState<IntrospectionEnum<"Rating"> | null>(null)

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
