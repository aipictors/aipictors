import { Tabs, TabsList, TabsTrigger } from "@/_components/ui/tabs"
import { AuthContext } from "@/_contexts/auth-context"
import React, { Suspense } from "react"
import { useContext } from "react"
import type { DashboardContentType } from "@/routes/($lang).dashboard._index/_types/content-type"
import type { SortType } from "@/_types/sort-type"
import { AppLoadingPage } from "@/_components/app/app-loading-page"
import type { WorkTabType } from "@/routes/($lang).dashboard._index/_types/work-tab-type"
import { WorksListContainer } from "@/routes/($lang).dashboard._index/_components/works-list-container"
import { WorksSetting } from "@/routes/($lang).dashboard._index/_components/works-settings"
import { AlbumsListContainer } from "@/routes/($lang).dashboard._index/_components/albums-list-container"
import { AlbumsSetting } from "@/routes/($lang).dashboard._index/_components/albums-settings"
import { useQuery } from "@apollo/client/index"
import { RecommendedListContainer } from "@/routes/($lang).dashboard._index/_components/recommended-list-container"
import { DashboardHomeContents } from "@/routes/($lang).dashboard._index/_components/dashboard-home-contents"
import { RecommendedBanner } from "@/routes/($lang).dashboard._index/_components/recommended-banner"
import { viewerCurrentPassQuery } from "@/_graphql/queries/viewer/viewer-current-pass"
import type { IntrospectionEnum } from "@/_lib/introspection-enum"
import { BookmarkListContainer } from "@/routes/($lang).dashboard._index/_components/bookmark-list-container"
import { userQuery } from "@/_graphql/queries/user/user"
import { graphql } from "gql.tada"

type Props = {
  dashboardContentType: DashboardContentType
}

/**
 * ダッシュボードコンテンツ
 */
export const DashboardContents = (props: Props) => {
  const [page, setPage] = React.useState(0)

  const [albumPage, setAlbumPage] = React.useState(0)

  const [bookmarkPage, setBookmarkPage] = React.useState(0)

  const [dashBoardContentType, setDashBoardContentType] =
    React.useState<DashboardContentType>(props.dashboardContentType)

  const [WorkOrderby, setWorkOrderby] =
    React.useState<IntrospectionEnum<"WorkOrderBy">>("DATE_CREATED")

  const [worksOrderDeskAsc, setWorksOrderDeskAsc] =
    React.useState<SortType>("DESC")

  const [AlbumOrderby, setAlbumOrderby] =
    React.useState<IntrospectionEnum<"AlbumOrderBy">>("DATE_CREATED")

  const [albumOrderDeskAsc, setAlbumOrderDeskAsc] =
    React.useState<SortType>("DESC")

  const authContext = useContext(AuthContext)

  const [accessType, setAccessType] =
    React.useState<IntrospectionEnum<"AccessType"> | null>(null)

  const [workType, setWorkType] =
    React.useState<IntrospectionEnum<"WorkType"> | null>(null)

  const [rating, setRating] =
    React.useState<IntrospectionEnum<"Rating"> | null>(null)

  const [albumRating, setAlbumRating] =
    React.useState<IntrospectionEnum<"AlbumRating"> | null>(null)

  const [workTabType, setWorkTabType] = React.useState<WorkTabType | null>(
    "WORK",
  )

  const [worksMaxCount, setWorksMaxCount] = React.useState(0)

  if (
    authContext.isLoading ||
    authContext.isNotLoggedIn ||
    authContext.userId === undefined ||
    !authContext.userId
  ) {
    return null
  }

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

  // アルバム一覧のソートボタンクリック時の処理
  const onClickAlbumTitleSortButton = () => {
    setAlbumOrderby("NAME")
    setAlbumOrderDeskAsc(albumOrderDeskAsc === "ASC" ? "DESC" : "ASC")
  }

  const onClickAlbumDateSortButton = () => {
    setAlbumOrderby("DATE_CREATED")
    setAlbumOrderDeskAsc(albumOrderDeskAsc === "ASC" ? "DESC" : "ASC")
  }

  const { data: albumsCountResp, refetch: albumsCountRefetch } = useQuery(
    albumsCountQuery,
    {
      skip: authContext.isLoading || authContext.isNotLoggedIn,
      variables: {
        where: {
          ownerUserId: authContext.userId,
          isSensitiveAndAllRating: albumRating === null,
          isSensitive: albumRating !== "G",
          needInspected: false,
          needsThumbnailImage: false,
        },
      },
    },
  )

  const albumsMaxCount = albumsCountResp?.albumsCount ?? 0

  const { data: pass } = useQuery(viewerCurrentPassQuery, {})

  const passData = pass?.viewer?.currentPass

  const isStandardOrPremium =
    passData?.type === "STANDARD" || passData?.type === "PREMIUM"

  const { data: userResp, refetch } = useQuery(userQuery, {
    skip: authContext.isLoading,
    variables: {
      bookmarksOffset: 0,
      bookmarksLimit: 0,
      userId: decodeURIComponent(authContext.userId),
      worksWhere: {},
      followeesWorksWhere: {},
      followersWorksWhere: {},
      worksOffset: 0,
      worksLimit: 0,
      followeesOffset: 0,
      followeesLimit: 0,
      followeesWorksOffset: 0,
      followeesWorksLimit: 0,
      followersOffset: 0,
      followersLimit: 0,
      followersWorksOffset: 0,
      followersWorksLimit: 0,
    },
  })

  const bookmarkMaxCount = userResp?.user?.createdBookmarksCount ?? 0

  return (
    <>
      <div
        className="container m-auto w-full"
        style={{
          margin: "0 auto",
        }}
      >
        <div>
          <p className="font-bold text-xl">ダッシュボード</p>
          <Tabs
            className="mt-2 mb-8"
            value={dashBoardContentType}
            defaultValue={"HOME"}
          >
            <TabsList>
              <TabsTrigger
                onClick={() => {
                  setDashBoardContentType("HOME")
                }}
                className="w-full"
                value="HOME"
              >
                ホーム
              </TabsTrigger>
              <TabsTrigger
                onClick={() => {
                  setDashBoardContentType("WORK")
                }}
                className="w-full"
                value="WORK"
              >
                作品
              </TabsTrigger>
              <TabsTrigger
                onClick={() => {
                  setDashBoardContentType("RECOMMEND")
                }}
                className="w-full"
                value="RECOMMEND"
              >
                推薦
              </TabsTrigger>
              <TabsTrigger
                onClick={() => {
                  setDashBoardContentType("BOOKMARK")
                }}
                className="w-full"
                value="BOOKMARK"
              >
                ブックマーク
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        {dashBoardContentType === "HOME" && (
          <Suspense fallback={<AppLoadingPage />}>
            <DashboardHomeContents />
          </Suspense>
        )}
        {dashBoardContentType === "WORK" && (
          <>
            {workTabType === "WORK" && (
              <>
                <WorksSetting
                  workTabType={workTabType}
                  sort={worksOrderDeskAsc}
                  orderBy={WorkOrderby}
                  sumWorksCount={worksMaxCount}
                  sumAlbumsCount={albumsMaxCount}
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
                  setWorkTabType={setWorkTabType}
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
                    setWorkTabType={setWorkTabType}
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
                    albumsCountRefetch={albumsCountRefetch}
                  />
                </Suspense>
              </>
            )}
            {workTabType === "ALBUM" && (
              <>
                <AlbumsSetting
                  workTabType={workTabType}
                  sort={albumOrderDeskAsc}
                  orderBy={AlbumOrderby}
                  sumWorksCount={worksMaxCount}
                  sumAlbumsCount={albumsMaxCount}
                  rating={albumRating}
                  onClickAlbumTitleSortButton={onClickAlbumTitleSortButton}
                  onClickAlbumDateSortButton={onClickAlbumDateSortButton}
                  setWorkTabType={setWorkTabType}
                  setRating={setAlbumRating}
                  setSort={setAlbumOrderDeskAsc}
                />
                <Suspense fallback={<AppLoadingPage />}>
                  <AlbumsListContainer
                    page={albumPage}
                    sort={albumOrderDeskAsc}
                    orderBy={AlbumOrderby}
                    rating={albumRating}
                    albumsMaxCount={albumsMaxCount}
                    setAlbumPage={setAlbumPage}
                    onClickAlbumTitleSortButton={onClickAlbumTitleSortButton}
                    onClickAlbumDateSortButton={onClickAlbumDateSortButton}
                  />
                </Suspense>
              </>
            )}
          </>
        )}
        {dashBoardContentType === "RECOMMEND" && (
          <>
            <Suspense fallback={<AppLoadingPage />}>
              <RecommendedListContainer />
            </Suspense>
            {!isStandardOrPremium && <RecommendedBanner />}
          </>
        )}
        {dashBoardContentType === "BOOKMARK" && (
          <>
            <Suspense fallback={<AppLoadingPage />}>
              <BookmarkListContainer
                page={bookmarkPage}
                maxCount={bookmarkMaxCount}
                setPage={setBookmarkPage}
              />
            </Suspense>
          </>
        )}
      </div>
    </>
  )
}

export const albumsCountQuery = graphql(
  `query AlbumsCount($where: AlbumsWhereInput) {
    albumsCount(where: $where)
  }`,
)
