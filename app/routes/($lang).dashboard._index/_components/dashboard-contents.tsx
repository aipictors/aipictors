import { Tabs, TabsList, TabsTrigger } from "@/_components/ui/tabs"
import { AuthContext } from "@/_contexts/auth-context"
import React, { Suspense } from "react"
import { useContext } from "react"
import type { DashboardContentType } from "@/routes/($lang).dashboard._index/_types/content-type"
import type { SortType } from "@/_types/sort-type"
import { AppLoadingPage } from "@/_components/app/app-loading-page"
import type { WorkTabType } from "@/routes/($lang).dashboard._index/_types/work-tab-type"
import type {
  AccessType,
  AlbumOrderBy,
  AlbumRating,
  Rating,
  WorkOrderBy,
} from "@/_graphql/__generated__/graphql"
import { WorksListContainer } from "@/routes/($lang).dashboard._index/_components/works-list-container"
import { WorksSetting } from "@/routes/($lang).dashboard._index/_components/works-settings"
import { AlbumsListContainer } from "@/routes/($lang).dashboard._index/_components/albums-list-container"
import { AlbumsSetting } from "@/routes/($lang).dashboard._index/_components/albums-settings"
import { albumsCountQuery } from "@/_graphql/queries/album/albums-count"
import { useSuspenseQuery } from "@apollo/client/index"
import { DashboardHomeContents } from "@/routes/($lang).dashboard._index/_components/dashboard-home-contents"

type Props = {
  dashboardContentType: DashboardContentType
}

/**
 * ダッシュボードコンテンツ
 * @param props
 * @returns
 */
export const DashboardContents = (props: Props) => {
  const [page, setPage] = React.useState(0)

  const [albumPage, setAlbumPage] = React.useState(0)

  const [dashBoardContentType, setDashBoardContentType] =
    React.useState<DashboardContentType>(props.dashboardContentType)

  const [WorkOrderby, setWorkOrderby] =
    React.useState<WorkOrderBy>("DATE_CREATED")

  const [worksOrderDeskAsc, setWorksOrderDeskAsc] =
    React.useState<SortType>("DESC")

  const [AlbumOrderby, setAlbumOrderby] =
    React.useState<AlbumOrderBy>("DATE_CREATED")

  const [albumOrderDeskAsc, setAlbumOrderDeskAsc] =
    React.useState<SortType>("DESC")

  const authContext = useContext(AuthContext)

  const [accessType, setAccessType] = React.useState<AccessType | null>(null)

  const [rating, setRating] = React.useState<Rating | null>(null)

  const [albumRating, setAlbumRating] = React.useState<AlbumRating | null>(null)

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

  // アルバム一覧のソートボタンクリック時の処理
  const onClickAlbumTitleSortButton = () => {
    setAlbumOrderby("NAME")
    setAlbumOrderDeskAsc(albumOrderDeskAsc === "ASC" ? "DESC" : "ASC")
  }

  const onClickAlbumDateSortButton = () => {
    setAlbumOrderby("DATE_CREATED")
    setAlbumOrderDeskAsc(albumOrderDeskAsc === "ASC" ? "DESC" : "ASC")
  }

  const { data: albumsCountResp, refetch: albumsCountRefetch } =
    useSuspenseQuery(albumsCountQuery, {
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
    })

  const albumsMaxCount = albumsCountResp?.albumsCount ?? 0

  return (
    <>
      <div className="w-full">
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
            </TabsList>
          </Tabs>
        </div>
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
                  rating={rating}
                  onClickTitleSortButton={onClickTitleSortButton}
                  onClickLikeSortButton={onClickLikeSortButton}
                  onClickBookmarkSortButton={onClickBookmarkSortButton}
                  onClickCommentSortButton={onClickCommentSortButton}
                  onClickViewSortButton={onClickViewSortButton}
                  onClickAccessTypeSortButton={onClickAccessTypeSortButton}
                  onClickDateSortButton={onClickDateSortButton}
                  setWorkTabType={setWorkTabType}
                  setAccessType={setAccessType}
                  setRating={setRating}
                  setSort={setWorksOrderDeskAsc}
                />
                <Suspense fallback={<AppLoadingPage />}>
                  <WorksListContainer
                    page={page}
                    accessType={accessType}
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
        {dashBoardContentType === "HOME" && (
          <Suspense fallback={<AppLoadingPage />}>
            <DashboardHomeContents />
          </Suspense>
        )}
      </div>
    </>
  )
}
