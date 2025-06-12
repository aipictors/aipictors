import {
  type CSSProperties,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { useNavigate, useSearchParams } from "@remix-run/react"
import { useApolloClient, useQuery } from "@apollo/client/index"
import { graphql, type FragmentOf } from "gql.tada"

import { AuthContext } from "~/contexts/auth-context"
import { ResponsivePagination } from "~/components/responsive-pagination"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { Button } from "~/components/ui/button"
import { List, Loader2Icon, Navigation } from "lucide-react"

import { useInfiniteScroll } from "~/routes/($lang)._main._index/hooks/use-infinite-scroll"
import { useScrollRestoration } from "../hooks/use-scroll-restoration"
import { usePagedInfinite } from "../hooks/use-paged-infinite"

import { HomeWorkFragment, HomeWorkSection } from "./home-work-section"
import {
  HomeNovelsWorkListItemFragment,
  HomeNovelsWorksSection,
} from "./home-novels-works-section"
import {
  HomeVideosWorkListItemFragment,
  HomeVideosWorksSection,
} from "./home-video-works-section"

/* ───────── CONSTS ───────── */
const PER_IMG = 32
const PER_VID = 8

interface PaginationModeProps extends HomeWorksProps {
  anchorAt: string
}

/* ───────── GraphQL ───────── */
const WorksQuery = graphql(
  `query Works($offset:Int!,$limit:Int!,$where:WorksWhereInput!) {
     works(offset:$offset,limit:$limit,where:$where){
       ...HomeWork
       ...HomeNovelsWorkListItem
       ...HomeVideosWorkListItem
     }
   }`,
  [
    HomeWorkFragment,
    HomeNovelsWorkListItemFragment,
    HomeVideosWorkListItemFragment,
  ],
)

/* ───────── Types ───────── */
export type WorkType = IntrospectionEnum<"WorkType">
export type WorkOrderBy = IntrospectionEnum<"WorkOrderBy">
export type ImageStyle = IntrospectionEnum<"ImageStyle">

interface WorksWhereInput {
  ratings?: string[]
  workType?: WorkType
  hasPrompt?: boolean
  isPromptPublic?: boolean
  orderBy?: WorkOrderBy
  style?: ImageStyle
  isNowCreatedAt?: boolean
  createdAtAfter?: string
  beforeCreatedAt?: string
}

export type HomeWorksProps = {
  /* 一覧表示オプション */
  isCropped?: boolean
  /* 絞り込み */
  workType: WorkType | null
  isPromptPublic: boolean | null
  sortType: WorkOrderBy | null
  timeRange?: string
  style?: ImageStyle
  /* Pagination 用 */
  page?: number
  setPage?: (p: number) => void
  /* ページネーション切り替え用 */
  isPagination?: boolean
  onPaginationModeChange?: (isPagination: boolean) => void
}

export type WorkItem = FragmentOf<
  | typeof HomeWorkFragment
  | typeof HomeNovelsWorkListItemFragment
  | typeof HomeVideosWorkListItemFragment
>

/* ───────── Helpers ───────── */
function startOfDay(date: Date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function getTimeRangeDates(range: HomeWorksProps["timeRange"] = "ALL") {
  const today0 = startOfDay(new Date())

  switch (range) {
    case "TODAY":
      return {
        createdAtAfter: today0.toISOString(),
        createdAtBefore: null,
        isNowCreatedAt: true,
      }
    case "YESTERDAY": {
      const yesterday0 = new Date(today0.getTime() - 86400000)
      return {
        createdAtAfter: yesterday0.toISOString(),
        createdAtBefore: today0.toISOString(),
      }
    }
    case "WEEK": {
      const day = today0.getDay()
      const diffMon = (day + 6) % 7
      const thisMon0 = new Date(today0.getTime() - diffMon * 86400000)
      const lastMon0 = new Date(thisMon0.getTime() - 7 * 86400000)
      return {
        createdAtAfter: lastMon0.toISOString(),
        createdAtBefore: thisMon0.toISOString(),
      }
    }
    default:
      return {
        createdAtAfter: null,
        createdAtBefore: null,
        isNowCreatedAt: true,
      }
  }
}

/* ───────── anchorAt (タブ内で一度だけ決定) ───────── */
let persistedAnchorAt: string | null = null
function getAnchorAt() {
  if (typeof window === "undefined") return new Date().toISOString()
  if (persistedAnchorAt) return persistedAnchorAt
  persistedAnchorAt =
    window.sessionStorage.getItem("home-works-anchorAt") ??
    new Date().toISOString()
  window.sessionStorage.setItem("home-works-anchorAt", persistedAnchorAt)
  return persistedAnchorAt
}

/* ───────── where 生成 ───────── */
/* ───────── 修正 1: makeWhere ───────── */
function makeWhere(
  props: Omit<HomeWorksProps, "page" | "setPage">,
  anchorAt: string,
): WorksWhereInput {
  const { createdAtAfter, createdAtBefore } = getTimeRangeDates(props.timeRange)

  const needAllMode = !props.timeRange || props.timeRange === "ALL"
  const needAnchor = needAllMode // ← 常に anchor 付ける

  return {
    ratings: ["G", "R15"],
    ...(props.workType && { workType: props.workType }),
    ...(props.isPromptPublic !== null && {
      hasPrompt: props.isPromptPublic,
      isPromptPublic: props.isPromptPublic,
    }),
    orderBy: props.sortType ?? "DATE_CREATED",
    ...(props.style && { style: props.style }),
    ...(createdAtAfter && { createdAtAfter }),
    ...(createdAtBefore && { beforeCreatedAt: createdAtBefore }),
    ...(!createdAtBefore && needAnchor ? { beforeCreatedAt: anchorAt } : {}),
  }
}

function chunkWorks<T>(arr: T[], size: number): T[][] {
  const res: T[][] = []
  for (let i = 0; i < arr.length; i += size) res.push(arr.slice(i, i + size))
  return res
}

/* ───────── Root Component ───────── */
export function HomeWorksSection(props: HomeWorksProps) {
  const anchorAt = getAnchorAt()

  useEffect(() => {
    if (props.isPagination !== undefined && props.onPaginationModeChange) {
      props.onPaginationModeChange(props.isPagination)
    }
  }, [props.isPagination])

  const handlePaginationModeChange = (isPagination: boolean) => {
    props.onPaginationModeChange?.(isPagination)

    // 無限スクロール → ページネーションに切り替える時は anchor をクリア
    if (isPagination) {
      window.sessionStorage.removeItem("home-works-anchorAt")
      persistedAnchorAt = null
    }
  }

  const key = `${props.timeRange}-${props.workType}-${props.sortType}-${props.isPagination}`

  return (
    <div className="space-y-4">
      {/* 切り替えUI */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant={props.isPagination ? "outline" : "default"}
            size="sm"
            onClick={() => handlePaginationModeChange(false)}
            className="flex items-center space-x-1"
          >
            <List className="h-4 w-4" />
            <span>無限スクロール</span>
          </Button>
          <Button
            variant={props.isPagination ? "default" : "outline"}
            size="sm"
            onClick={() => handlePaginationModeChange(true)}
            className="flex items-center space-x-1"
          >
            <Navigation className="h-4 w-4" />
            <span>ページネーション</span>
          </Button>
        </div>
      </div>

      {props.isPagination ? (
        <PaginationMode key={key} {...props} anchorAt={anchorAt} />
      ) : (
        <InfiniteMode key={key} {...props} anchorAt={anchorAt} />
      )}
    </div>
  )
}

/* ===========================================================
   Pagination Mode
   =========================================================== */
function PaginationMode({ anchorAt, ...rest }: PaginationModeProps) {
  const PER_PAGE = rest.workType === "VIDEO" ? PER_VID : PER_IMG
  const { isLoading: authLoading } = useContext(AuthContext)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const currentPage = rest.page ?? 0
  const setPage = rest.setPage ?? (() => {})

  /* ★ where は固定 (page 間で変えない) */
  const where = useMemo(() => makeWhere(rest, anchorAt), [rest, anchorAt])

  /* ★ always offset 0, limit (page+1)*PER_PAGE */
  const { data } = useQuery(WorksQuery, {
    skip: authLoading,
    variables: {
      offset: 0,
      limit: (currentPage + 1) * PER_PAGE,
      // @ts-ignore
      where,
    },
    fetchPolicy: "cache-and-network",
    errorPolicy: "ignore",
  })

  const worksAll = data?.works ?? []

  /* ページ分 slice するだけで OK */
  const displayedWorks = useMemo(() => {
    const start = currentPage * PER_PAGE
    return worksAll.slice(start, start + PER_PAGE)
  }, [worksAll, currentPage, PER_PAGE])

  /* --- URL 同期だけ残す --- */
  useEffect(() => {
    const urlPage = Number(searchParams.get("page") ?? "0")
    if (urlPage !== currentPage) {
      const newParams = new URLSearchParams(searchParams)
      newParams.set("page", currentPage.toString())
      navigate(`?${newParams.toString()}`, { replace: true })
    }
  }, [currentPage, searchParams, navigate])

  /* ハンドラでは refetch 不要。page だけ変えれば variables が再評価 */
  const handlePageChange = (page: number) => setPage(page)

  return (
    <div className="space-y-4">
      <RenderByType
        workType={rest.workType}
        works={displayedWorks}
        isCropped={rest.isCropped}
      />

      {worksAll.length > 0 && (
        <>
          <div className="h-8" />
          <div className="-translate-x-1/2 fixed bottom-0 left-1/2 z-10 w-full border-border/40 bg-background/95 p-2 backdrop-blur-sm supports-backdrop-filter:bg-background/80">
            <ResponsivePagination
              perPage={PER_PAGE}
              maxCount={1000}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      )}
    </div>
  )
}

/* ===========================================================
   Infinite Scroll Mode
   =========================================================== */
interface InfiniteModeProps extends Omit<HomeWorksProps, "page" | "setPage"> {
  anchorAt: string
}

function InfiniteMode({ anchorAt, ...rest }: InfiniteModeProps) {
  const client = useApolloClient()
  const PER_PAGE = rest.workType === "VIDEO" ? PER_VID : PER_IMG

  /* InfiniteMode */
  const where = useMemo(() => makeWhere(rest, anchorAt), [rest, anchorAt])

  const { isLoading: authLoading } = useContext(AuthContext)

  const initialPages = useMemo(() => {
    try {
      const cached = client.readQuery({
        query: WorksQuery,
        // @ts-ignore
        variables: { offset: 0, limit: PER_PAGE, where },
      }) as { works?: WorkItem[] } | null
      return cached?.works?.length ? chunkWorks(cached.works, PER_PAGE) : []
    } catch {
      return []
    }
  }, [client, PER_PAGE, where])

  const {
    data,
    fetchMore,
    loading: loadingFirst,
  } = useQuery(WorksQuery, {
    skip: authLoading,
    // @ts-ignore
    variables: { offset: 0, limit: PER_PAGE, where },
    fetchPolicy: "cache-first",
    nextFetchPolicy: "cache-first",
    errorPolicy: "ignore",
  })

  const { pages, replaceFirstPage, appendPage, appendPages, flat } =
    usePagedInfinite<WorkItem>(initialPages)

  useEffect(() => {
    if (!data?.works?.length) return
    const chunked = chunkWorks(data.works, PER_PAGE)
    if (chunked.length && chunked.length !== pages.length) {
      replaceFirstPage(chunked[0])
      if (chunked.length > 1) appendPages(chunked.slice(1))
    }
  }, [data?.works, pages.length, PER_PAGE, replaceFirstPage, appendPages])

  const ready = initialPages.length > 0 || !!data?.works?.length
  useScrollRestoration("home-works-infinite", ready)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const lastPage = pages[pages.length - 1] ?? []
  const hasNext = lastPage.length === PER_PAGE

  const loadMore = async () => {
    if (!hasNext || loadingFirst) return
    setIsLoadingMore(true)
    try {
      const result = await fetchMore({
        variables: { offset: flat.length, limit: PER_PAGE, where },
      })
      if (result.data?.works?.length) appendPage(result.data.works)
    } catch (e) {
      console.error("Failed to load more works:", e)
    } finally {
      setIsLoadingMore(false)
    }
  }

  const sentinelRef = useInfiniteScroll(loadMore, {
    hasNext,
    loading: loadingFirst,
  })

  return (
    <div className="space-y-8">
      {pages.map((page, idx) => (
        <RenderByType
          key={idx.toString()}
          workType={rest.workType}
          works={page}
          isCropped={rest.isCropped}
        />
      ))}

      {hasNext && (
        <div ref={sentinelRef} style={{ height: 1 } as CSSProperties} />
      )}

      {(loadingFirst || isLoadingMore) && (
        <div className="flex justify-center py-8">
          <Loader2Icon className="size-8 animate-spin text-border" />
        </div>
      )}
    </div>
  )
}

/* ===========================================================
   Render Helper
   =========================================================== */
interface RenderProps {
  workType: WorkType | null
  works: WorkItem[]
  isCropped?: boolean
}

function RenderByType({ workType, works, isCropped }: RenderProps) {
  if (workType === "NOVEL" || workType === "COLUMN") {
    return (
      <HomeNovelsWorksSection
        title=""
        works={works as FragmentOf<typeof HomeNovelsWorkListItemFragment>[]}
      />
    )
  }
  if (workType === "VIDEO") {
    return (
      <HomeVideosWorksSection
        title=""
        works={works as FragmentOf<typeof HomeVideosWorkListItemFragment>[]}
        isAutoPlay
      />
    )
  }
  return (
    <HomeWorkSection
      title=""
      works={works as FragmentOf<typeof HomeWorkFragment>[]}
      isCropped={isCropped}
      isShowProfile
    />
  )
}
