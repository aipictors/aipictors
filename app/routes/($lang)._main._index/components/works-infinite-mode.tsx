import { useApolloClient, useQuery } from "@apollo/client/index"
import type { FragmentOf } from "gql.tada"
import {
  type CSSProperties,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import type { PhotoAlbumWorkFragment } from "~/components/responsive-photo-works-album"
import { AuthContext } from "~/contexts/auth-context"
import { useViewerRatings } from "~/hooks/use-viewer-ratings"
import {
  originalOnlyWhere,
  useHomeOriginalOnly,
} from "~/routes/($lang)._main._index/hooks/use-original-only"
import { WorksQuery } from "~/routes/($lang)._main._index/components/works-pagination-mode"
import { useInfiniteScroll } from "~/routes/($lang)._main._index/hooks/use-infinite-scroll"
import { usePagedInfinite } from "../hooks/use-paged-infinite"
import { useScrollRestoration } from "../hooks/use-scroll-restoration"
import type {
  ImageStyle,
  WorkItem,
  WorkOrderBy,
  WorkType,
} from "../types/works"
import { chunkWorks, getPerPage, makeWhere } from "../utils/works-utils"
import { WorksLoadError } from "./works-load-error"
import { WorksLoading } from "./works-loading"
import { WorksRenderer } from "./works-renderer"

interface Props {
  anchorAt: string
  isCropped?: boolean
  workType: WorkType | null
  isPromptPublic: boolean | null
  sortType: WorkOrderBy | null
  timeRange?: string
  style?: ImageStyle
  autoPlayVideoPreview?: boolean
  onSelect?: (index: string) => void
  updateWorks?: (works: FragmentOf<typeof PhotoAlbumWorkFragment>[]) => void
}

export function WorksInfiniteMode({ anchorAt, ...rest }: Props) {
  const client = useApolloClient()
  const PER_PAGE = getPerPage(rest.workType)
  const { isLoading: authLoading } = useContext(AuthContext)
  const viewerRatings = useViewerRatings()

  const { isOriginalOnly } = useHomeOriginalOnly()

  const where = useMemo(
    () => ({
      ...makeWhere(rest, anchorAt, viewerRatings.normalRatings),
      ...originalOnlyWhere(isOriginalOnly),
    }),
    [rest, anchorAt, viewerRatings.normalRatings, isOriginalOnly],
  )
  const keyForStore = useMemo(() => JSON.stringify(where), [where])

  const initialPages = useMemo(() => {
    try {
      const cached = client.readQuery({
        query: WorksQuery,
        // @ts-ignore - GraphQL type mismatch
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
    error,
    refetch,
  } = useQuery(WorksQuery, {
    skip: authLoading || !viewerRatings.isReady,
    variables: {
      offset: 0,
      limit: PER_PAGE,
      // @ts-ignore - GraphQL type mismatch
      where,
    },
    fetchPolicy: "cache-first",
    nextFetchPolicy: "cache-first",
    errorPolicy: "all",
  })

  const { pages, appendPage, appendPages, replaceFirstPage, flat } =
    usePagedInfinite<WorkItem>(initialPages, keyForStore)

  const handleReplaceFirstPage = useCallback(replaceFirstPage, [
    replaceFirstPage,
  ])
  const handleAppendPages = useCallback(appendPages, [appendPages])

  useEffect(() => {
    if (!data?.works?.length) return

    const chunked = chunkWorks(data.works, PER_PAGE)
    if (chunked.length === 0) return

    if (pages.length === 0 || chunked[0].length !== pages[0]?.length) {
      handleReplaceFirstPage(chunked[0])
      if (chunked.length > 1) {
        handleAppendPages(chunked.slice(1))
      }
    }
  }, [
    data?.works,
    PER_PAGE,
    handleReplaceFirstPage,
    handleAppendPages,
    pages.length,
  ])

  const ready = initialPages.length > 0 || !!data?.works?.length
  useScrollRestoration("home-works-infinite", ready)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const lastPage = pages[pages.length - 1] ?? []
  const hasNext = lastPage.length >= PER_PAGE - 8

  const loadMore = useCallback(async () => {
    if (!hasNext || loadingFirst || isLoadingMore) return
    setIsLoadingMore(true)
    try {
      const result = await fetchMore({
        variables: {
          offset: flat.length,
          limit: PER_PAGE,
          // @ts-ignore - GraphQL type mismatch
          where,
        },
      })
      if (result.data?.works?.length) {
        appendPage(result.data.works)
      }
    } catch (e) {
      console.error("Failed to load more works:", e)
    } finally {
      setIsLoadingMore(false)
    }
  }, [
    hasNext,
    loadingFirst,
    isLoadingMore,
    fetchMore,
    flat.length,
    PER_PAGE,
    where,
    appendPage,
  ])

  const sentinelRef = useInfiniteScroll(loadMore, {
    hasNext,
    loading: loadingFirst,
  })

  // updateWorks
  useEffect(() => {
    if (rest.updateWorks) {
      rest.updateWorks(flat as FragmentOf<typeof PhotoAlbumWorkFragment>[])
    }
  }, [flat, rest.updateWorks])

  return (
    <div className="space-y-8">
      {pages.map((page, idx) => (
        <WorksRenderer
          key={idx.toString()}
          workType={rest.workType}
          works={page}
          isCropped={rest.isCropped}
          autoPlayVideoPreview={rest.autoPlayVideoPreview}
          onSelect={rest.onSelect}
        />
      ))}

      {hasNext && (
        <div ref={sentinelRef} style={{ height: 1 } as CSSProperties} />
      )}

      <WorksLoading
        loading={loadingFirst || isLoadingMore}
        hasWorks={flat.length > 0}
      />

      {error && !loadingFirst && flat.length === 0 && (
        <WorksLoadError onRetry={() => refetch()} />
      )}
    </div>
  )
}
