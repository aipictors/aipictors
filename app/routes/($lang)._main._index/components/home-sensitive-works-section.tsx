import type { FragmentOf } from "gql.tada"
import { useMemo } from "react"
import type { PhotoAlbumWorkFragment } from "~/components/responsive-photo-works-album"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { getAnchorAt } from "~/routes/($lang)._main._index/libs/anchor-manager"
import { SensitiveWorksInfiniteMode } from "~/routes/($lang).r._index/components/sensitive-works-infinite-mode"
import { SensitiveWorksPaginationMode } from "~/routes/($lang).r._index/components/sensitive-works-pagination-mode"

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
  updateWorks?: (works: FragmentOf<typeof PhotoAlbumWorkFragment>[]) => void
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
  const updateWorks = props.updateWorks ?? (() => {})

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
          updateWorks={updateWorks}
        />
      ) : (
        <SensitiveWorksInfiniteMode
          key={key}
          {...props}
          anchorAt={anchorAt}
          onSelect={props.onSelect}
          updateWorks={updateWorks}
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
    //   <div className="-translate-x-1/2 fixed bottom-[var(--aip-tabbar-h,0px)] left-1/2 z-10 w-full border-border/40 bg-background/95 p-2 backdrop-blur-sm supports-backdrop-filter:bg-background/80">
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
