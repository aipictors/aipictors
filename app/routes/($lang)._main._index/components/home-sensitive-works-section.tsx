import type { FragmentOf } from "gql.tada"
import { useMemo } from "react"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import type { PhotoAlbumWorkFragment } from "~/components/responsive-photo-works-album"
import { SensitiveWorksPaginationMode } from "~/routes/($lang).r._index/components/sensitive-works-pagination-mode"
import { SensitiveWorksInfiniteMode } from "~/routes/($lang).r._index/components/sensitive-works-infinite-mode"
import { getAnchorAt } from "~/routes/($lang)._main._index/libs/anchor-manager"

/**
 * 期間指定による createdAt 範囲を計算するヘルパー関数
 */
function _getTimeRangeDates(timeRange: string) {
  // 実際のロジックは要件に応じて JST に合わせるなど調整してください
  const now = new Date()
  now.setHours(0, 0, 0, 0) // 当日 0:00 に合わせる

  switch (timeRange) {
    case "TODAY": {
      // 本日: 当日 0:00 以降
      return {
        createdAtAfter: now.toISOString(),
        createdAtBefore: null,
      }
    }
    case "YESTERDAY": {
      // 昨日: 昨日の 0:00 〜 本日の 0:00
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      return {
        createdAtAfter: yesterday.toISOString(),
        createdAtBefore: now.toISOString(),
      }
    }
    case "WEEK": {
      // 1週間: 7日前の 0:00 〜
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      return {
        createdAtAfter: weekAgo.toISOString(),
        createdAtBefore: null,
      }
    }
    default: {
      // ALL (全期間) の場合は指定なし
      return {
        createdAtAfter: null,
        createdAtBefore: null,
      }
    }
  }
}

type Props = {
  isCropped?: boolean
  page: number
  setPage: (page: number) => void
  workType: IntrospectionEnum<"WorkType"> | null
  isPromptPublic: boolean | null
  sortType: IntrospectionEnum<"WorkOrderBy"> | null
  timeRange?: string
  style?: IntrospectionEnum<"ImageStyle">
  isPagination?: boolean
  onSelect?: (index: string) => void
  updateWorks: (works: FragmentOf<typeof PhotoAlbumWorkFragment>[]) => void
}

/**
 * トップ画面ホーム作品一覧
 */
export function HomeSensitiveWorksSection(props: Props) {
  // const appContext = useContext(AuthContext)

  // const perPageCount = props.workType === "VIDEO" ? 8 : 32

  // // 期間指定から createdAtAfter/before を算出
  // const { createdAtAfter, createdAtBefore } = getTimeRangeDates(
  //   props.timeRange || "ALL",
  // )

  // const { data: worksResp } = useSuspenseQuery(WorksQuery, {
  //   skip: appContext.isLoading,
  //   variables: {
  //     offset: props.page * perPageCount,
  //     limit: perPageCount,
  //     where: {
  //       ratings: ["R18", "R18G"],
  //       isSensitive: true,
  //       ...(props.workType !== null && {
  //         workType: props.workType,
  //       }),
  //       ...(props.isPromptPublic !== null && {
  //         hasPrompt: props.isPromptPublic,
  //         isPromptPublic: props.isPromptPublic,
  //       }),
  //       ...((props.sortType !== null && {
  //         orderBy: props.sortType,
  //       }) || { orderBy: "DATE_CREATED" }),
  //       ...(props.style && {
  //         style: props.style,
  //       }),
  //       ...(!createdAtAfter && !createdAtBefore && { isNowCreatedAt: true }),

  //       // ★ 期間指定
  //       ...(createdAtAfter && { createdAtAfter: createdAtAfter }),
  //       ...(createdAtBefore && { beforeCreatedAt: createdAtBefore }),
  //     },
  //   },
  // })

  const key = `${props.timeRange}-${props.workType}-${props.sortType}-${props.isPagination}`

  const anchorAt = useMemo(() => getAnchorAt(), [])

  // useEffect(() => {
  //   if (props.updateWorks && worksResp?.works) {
  //     props.updateWorks(
  //       worksResp.works as FragmentOf<typeof PhotoAlbumWorkFragment>[],
  //     )
  //   }
  // }, [worksResp?.works, props.updateWorks])

  return (
    <div className="space-y-4">
      {props.isPagination ? (
        <SensitiveWorksPaginationMode
          key={key}
          {...props}
          anchorAt={anchorAt}
          onSelect={props.onSelect}
          updateWorks={props.updateWorks}
        />
      ) : (
        <SensitiveWorksInfiniteMode
          key={key}
          {...props}
          anchorAt={anchorAt}
          onSelect={props.onSelect}
          updateWorks={props.updateWorks}
        />
      )}
    </div>

    // <div className="space-y-4">
    //   {(props.workType === "WORK" || props.workType === null) && (
    //     <HomeWorkSection
    //       title={""}
    //       works={worksResp?.works || []}
    //       isCropped={props.isCropped}
    //       isShowProfile={true}
    //       onSelect={props.onSelect}
    //     />
    //   )}
    //   {(props.workType === "NOVEL" || props.workType === "COLUMN") && (
    //     <HomeNovelsWorksSection
    //       onSelect={props.onSelect}
    //       title={""}
    //       works={worksResp?.works || []}
    //     />
    //   )}
    //   {props.workType === "VIDEO" && (
    //     <HomeVideosWorksSection
    //       title={""}
    //       works={worksResp?.works || []}
    //       isAutoPlay={true}
    //       onSelect={props.onSelect}
    //     />
    //   )}
    //   <div className="h-8" />
    //   <div className="-translate-x-1/2 fixed bottom-0 left-1/2 z-10 w-full border-border/40 bg-background/95 p-2 backdrop-blur-sm supports-backdrop-filter:bg-background/80">
    //     <ResponsivePagination
    //       perPage={perPageCount}
    //       maxCount={1000}
    //       currentPage={props.page}
    //       onPageChange={(page: number) => {
    //         props.setPage(page)
    //       }}
    //     />
    //   </div>
    // </div>
  )
}

// const WorksQuery = graphql(
//   `query Works($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
//     works(offset: $offset, limit: $limit, where: $where) {
//       ...HomeWork
//       ...HomeNovelsWorkListItem
//       ...HomeVideosWorkListItem
//     }
//   }`,
//   [
//     HomeWorkFragment,
//     HomeNovelsWorkListItemFragment,
//     HomeVideosWorkListItemFragment,
//   ],
// )
