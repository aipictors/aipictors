import { Tabs, TabsList, TabsTrigger } from "@/_components/ui/tabs"
import { AuthContext } from "@/_contexts/auth-context"
import { useSuspenseQuery } from "@apollo/client/index"
import React from "react"
import { useContext } from "react"
import type { DashboardContentType } from "@/routes/($lang).dashboard._index/_types/content-type"
import type { WorksOrderby } from "@/routes/($lang).dashboard._index/_types/works-orderby"
// import { ScrollArea } from "@/_components/ui/scroll-area"
import { WorksList } from "@/routes/($lang).dashboard._index/_components/works-list"
import { toDateText } from "@/_utils/to-date-text"
import { ResponsivePagination } from "@/_components/responsive-pagination"
import { worksQuery } from "@/_graphql/queries/work/works"
import { worksCountQuery } from "@/_graphql/queries/work/works-count"
import type { SortType } from "@/routes/($lang).dashboard._index/_types/sort-type"

export const DashboardContents = () => {
  const [page, setPage] = React.useState(0)

  const [dashBoardContentType, setDashBoardContentType] =
    React.useState<DashboardContentType>("WORK")

  const [worksOrderBy, setWorksOrderBy] =
    React.useState<WorksOrderby>("DATE_CREATED")

  const [worksOrderDeskAsc, setWorksOrderDeskAsc] =
    React.useState<SortType>("DESC")

  const authContext = useContext(AuthContext)

  if (
    authContext.isLoading ||
    authContext.isNotLoggedIn ||
    authContext.userId === undefined ||
    !authContext.userId
  ) {
    return null
  }

  const workResp = useSuspenseQuery(worksQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      offset: 16 * page,
      limit: 16,
      where: {
        userId: authContext.userId,
        orderBy: worksOrderBy,
        sort: worksOrderDeskAsc,
        isIncludePrivate: true,
      },
    },
  })

  const worksCountResp = useSuspenseQuery(worksCountQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      where: {
        userId: authContext.userId,
        orderBy: worksOrderBy,
        sort: worksOrderDeskAsc,
        isIncludePrivate: true,
      },
    },
  })

  const works = workResp?.data?.works

  const worksLength = works?.length ?? 0

  const worksMaxCount = worksCountResp.data?.worksCount ?? 0

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
        {dashBoardContentType === "WORK" && worksLength !== 0 && (
          <>
            <WorksList
              works={
                works?.map((work) => ({
                  id: work.id,
                  title: work.title,
                  thumbnailImageUrl: work.smallThumbnailImageURL,
                  likesCount: work.likesCount,
                  bookmarksCount: 0,
                  commentsCount: work.commentsCount ?? 0,
                  viewsCount: work.viewsCount,
                  accessType: work.accessType,
                  createdAt: toDateText(work.createdAt),
                  isTagEditable: work.isTagEditable,
                })) ?? []
              }
            />
            <div className="mt-4 mb-8">
              <ResponsivePagination
                perPage={16}
                maxCount={worksMaxCount}
                currentPage={page}
                onPageChange={(page: number) => {
                  setPage(page)
                }}
              />
            </div>
          </>
        )}
        {dashBoardContentType === "WORK" && worksLength === 0 && (
          <p>作品が存在しません。</p>
        )}
      </div>
    </>
  )
}
