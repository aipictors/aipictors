import { Tabs, TabsList, TabsTrigger } from "@/_components/ui/tabs"
import { AuthContext } from "@/_contexts/auth-context"
import { useQuery } from "@apollo/client/index"
import React, { Suspense } from "react"
import { useContext } from "react"
import type { DashboardContentType } from "@/routes/($lang).dashboard._index/_types/content-type"
import type { SortType } from "@/_types/sort-type"
import { AppLoadingPage } from "@/_components/app/app-loading-page"
import type { WorkTabType } from "@/routes/($lang).dashboard._index/_types/work-tab-type"
import { albumsQuery } from "@/_graphql/queries/album/albums"
import type {
  AccessType,
  Rating,
  WorkOrderBy,
} from "@/_graphql/__generated__/graphql"
import { WorksListContainer } from "@/routes/($lang).dashboard._index/_components/works-list-container"
import { WorksSetting } from "@/routes/($lang).dashboard._index/_components/works-settings"

export const DashboardContents = () => {
  const [page, setPage] = React.useState(0)

  const [dashBoardContentType, setDashBoardContentType] =
    React.useState<DashboardContentType>("WORK")

  const [WorkOrderby, setWorkOrderby] =
    React.useState<WorkOrderBy>("DATE_CREATED")

  const [worksOrderDeskAsc, setWorksOrderDeskAsc] =
    React.useState<SortType>("DESC")

  const authContext = useContext(AuthContext)

  const [accessType, setAccessType] = React.useState<AccessType | null>(null)

  const [rating, setRating] = React.useState<Rating | null>(null)

  const [workTabType, setWorkTabType] = React.useState<WorkTabType | null>(
    "WORK",
  )

  const [worksMaxCount, setWorksMaxCount] = React.useState(0)

  const [albumsMaxCount, setAlbumsMaxCount] = React.useState(0)

  if (
    authContext.isLoading ||
    authContext.isNotLoggedIn ||
    authContext.userId === undefined ||
    !authContext.userId
  ) {
    return null
  }

  const { data: albums } = useQuery(albumsQuery, {
    skip: authContext.isLoading,
    variables: {
      limit: 124,
      offset: 0,
      where: {
        ownerUserId: authContext.userId,
        isSensitiveAndAllRating: true,
        needInspected: false,
        needsThumbnailImage: false,
      },
    },
  })

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

  const onClickDateSortButton = () => {
    setWorkOrderby("DATE_CREATED")
    setWorksOrderDeskAsc(worksOrderDeskAsc === "ASC" ? "DESC" : "ASC")
  }

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
                  setDashBoardContentType("WORK")
                }}
                className="w-full"
                value="WORK"
              >
                作品
              </TabsTrigger>
              <TabsTrigger
                onClick={() => {
                  setDashBoardContentType("HOME")
                }}
                className="w-full"
                value="HOME"
              >
                ホーム
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        {dashBoardContentType === "WORK" && (
          <>
            {workTabType === "WORK" && (
              <>
                <WorksSetting
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
                    onClickDateSortButton={onClickDateSortButton}
                  />
                </Suspense>
              </>
            )}
            {workTabType === "ALBUM" && "シリーズ一覧"}
          </>
        )}
      </div>
    </>
  )
}
