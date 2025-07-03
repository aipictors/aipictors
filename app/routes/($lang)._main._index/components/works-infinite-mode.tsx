import {
  type CSSProperties,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react"
import { useApolloClient, useQuery } from "@apollo/client/index"
import { AuthContext } from "~/contexts/auth-context"
import { useInfiniteScroll } from "~/routes/($lang)._main._index/hooks/use-infinite-scroll"
import { useScrollRestoration } from "../hooks/use-scroll-restoration"
import { usePagedInfinite } from "../hooks/use-paged-infinite"
import { makeWhere, getPerPage, chunkWorks } from "../utils/works-utils"
import { WorksRenderer } from "./works-renderer"
import { WorksLoading } from "./works-loading"
import type {
  WorkType,
  WorkOrderBy,
  ImageStyle,
  WorkItem,
} from "../types/works"
import { WorksQuery } from "~/routes/($lang)._main._index/components/works-pagination-mode"
import type { PhotoAlbumWorkFragment } from "~/components/responsive-photo-works-album"
import type { FragmentOf } from "gql.tada"

interface Props {
  anchorAt: string
  isCropped?: boolean
  workType: WorkType | null
  isPromptPublic: boolean | null
  sortType: WorkOrderBy | null
  timeRange?: string
  style?: ImageStyle
  onSelect?: (index: number) => void
  updateWorks?: (works: FragmentOf<typeof PhotoAlbumWorkFragment>[]) => void
}

export function WorksInfiniteMode({ anchorAt, ...rest }: Props) {
  const client = useApolloClient()
  const PER_PAGE = getPerPage(rest.workType)
  const { isLoading: authLoading } = useContext(AuthContext)

  const where = useMemo(() => makeWhere(rest, anchorAt), [rest, anchorAt])
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
  } = useQuery(WorksQuery, {
    skip: authLoading,
    variables: {
      offset: 0,
      limit: PER_PAGE,
      // @ts-ignore - GraphQL type mismatch
      where,
    },
    fetchPolicy: "cache-first",
    nextFetchPolicy: "cache-first",
    errorPolicy: "ignore",
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
  const hasNext = lastPage.length === PER_PAGE

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
    </div>
  )
}
