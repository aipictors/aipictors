// 改良版の作品無限スクロールコンポーネント
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
import { useImprovedInfiniteScroll } from "~/routes/($lang)._main._index/hooks/use-improved-infinite-scroll"
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

interface Props {
  anchorAt: string
  isCropped?: boolean
  workType: WorkType | null
  isPromptPublic: boolean | null
  sortType: WorkOrderBy | null
  timeRange?: string
  style?: ImageStyle
  onSelect?: (index: number) => void
  onWorksLoaded?: (works: WorkItem[]) => void
  initialWorks?: WorkItem[] // SSRで取得した初期データ
}

export function ImprovedWorksInfiniteMode({ anchorAt, ...rest }: Props) {
  const client = useApolloClient()
  const PER_PAGE = getPerPage(rest.workType)
  const { isLoading: authLoading } = useContext(AuthContext)
  const where = useMemo(() => makeWhere(rest, anchorAt), [rest, anchorAt])
  const keyForStore = useMemo(() => JSON.stringify(where), [where])

  // SSR/初期データを必ず最初のページとしてセット
  const initialPages = useMemo(() => {
    if (rest.initialWorks && rest.initialWorks.length > 0) {
      return chunkWorks(rest.initialWorks, PER_PAGE)
    }
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
  }, [client, PER_PAGE, where, rest.initialWorks])

  // ページデータ管理
  const { pages, appendPage, appendPages, replaceFirstPage, flat, clearAll } =
    usePagedInfinite<WorkItem>(initialPages, keyForStore)

  // SSR初期化済みか
  const [isInitialDataSet, setIsInitialDataSet] = useState(false)
  // 初期化完了フラグ
  const [isInitialized, setIsInitialized] = useState(false)
  // 追加ロード状態
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  // 次ページ有無
  const [hasNextPage, setHasNextPage] = useState(true)

  // GraphQLクエリ
  const {
    data,
    fetchMore,
    loading: loadingFirst,
    error,
  } = useQuery(WorksQuery, {
    skip: authLoading || (rest.initialWorks && rest.initialWorks.length > 0),
    variables: {
      offset: 0,
      limit: PER_PAGE,
      // @ts-ignore
      where,
    },
    fetchPolicy: "cache-first",
    nextFetchPolicy: "cache-first",
    errorPolicy: "ignore",
    notifyOnNetworkStatusChange: true,
  })

  // 初期化: SSR/初期データを必ずセット
  useEffect(() => {
    if (!isInitialDataSet && initialPages.length > 0) {
      replaceFirstPage(initialPages[0])
      setHasNextPage(initialPages[0].length === PER_PAGE)
      setIsInitialDataSet(true)
      setIsInitialized(true)
    }
  }, [initialPages, isInitialDataSet, replaceFirstPage, PER_PAGE])

  // データ取得時のページ追加
  useEffect(() => {
    if (!isInitialized) return
    if (!data?.works?.length) return
    const chunked = chunkWorks(data.works, PER_PAGE)
    if (chunked.length === 0) return
    // 既存ページと異なる場合のみ更新
    if (pages.length === 0 || chunked[0].length !== pages[0]?.length) {
      replaceFirstPage(chunked[0])
      if (chunked.length > 1) {
        appendPages(chunked.slice(1))
      }
      setHasNextPage(chunked[0].length === PER_PAGE)
    }
    if (rest.onWorksLoaded && data.works) {
      rest.onWorksLoaded(data.works)
    }
  }, [
    data?.works,
    PER_PAGE,
    replaceFirstPage,
    appendPages,
    pages,
    rest.onWorksLoaded,
    isInitialized,
  ])

  // ソート・フィルタ・タブ切り替え時リセット
  useEffect(() => {
    setIsInitialDataSet(false)
    setIsInitialized(false)
    clearAll()
    setHasNextPage(true)
  }, [keyForStore, clearAll])

  // 追加ロード
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasNextPage || !isInitialized) return
    setIsLoadingMore(true)
    try {
      const result = await fetchMore({
        variables: {
          offset: flat.length,
          limit: PER_PAGE,
          // @ts-ignore
          where,
        },
      })
      if (result.data?.works?.length) {
        appendPage(result.data.works)
        setHasNextPage(result.data.works.length === PER_PAGE)
        if (rest.onWorksLoaded) {
          rest.onWorksLoaded(result.data.works)
        }
      } else {
        setHasNextPage(false)
      }
    } catch {
      setHasNextPage(false)
    } finally {
      setIsLoadingMore(false)
    }
  }, [
    isLoadingMore,
    hasNextPage,
    isInitialized,
    fetchMore,
    flat.length,
    PER_PAGE,
    where,
    appendPage,
    rest.onWorksLoaded,
  ])

  // センチネル監視
  const sentinelRef = useImprovedInfiniteScroll(loadMore, {
    hasNext: hasNextPage,
    loading: loadingFirst || isLoadingMore,
    threshold: 0.1,
    rootMargin: "500px",
  })

  // エラー表示
  if (error && !loadingFirst && pages.length === 0) {
    return (
      <div className="my-8 flex flex-col items-center justify-center gap-4 text-center">
        <p className="text-muted-foreground text-sm">
          データの読み込み中にエラーが発生しました。
        </p>
        <button
          type="button"
          className="cursor-pointer rounded-md bg-primary px-4 py-2 text-primary-foreground text-sm"
          onClick={() => window.location.reload()}
        >
          ページを再読み込み
        </button>
      </div>
    )
  }

  // レンダリング
  return (
    <div className="space-y-8">
      {/* 作品リスト */}
      {pages.map((page, idx) => (
        <WorksRenderer
          key={idx.toString()}
          workType={rest.workType}
          works={page}
          isCropped={rest.isCropped}
          onSelect={rest.onSelect}
        />
      ))}
      {/* センチネル＋ボタン */}
      {hasNextPage && (
        <div
          ref={sentinelRef}
          style={
            {
              height: 100,
              marginTop: 40,
              marginBottom: 40,
              width: "100%",
              background: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            } as CSSProperties
          }
          data-testid="infinite-scroll-sentinel"
          className="flex items-center justify-center"
          tabIndex={0}
          // biome-ignore lint/a11y/useSemanticElements: <explanation>
          role="button"
          onClick={() => {
            if (!isLoadingMore && hasNextPage) {
              loadMore()
            }
          }}
          onKeyDown={(event) => {
            if (
              (event.key === "Enter" || event.key === " ") &&
              !isLoadingMore &&
              hasNextPage
            ) {
              loadMore()
            }
          }}
        >
          {isLoadingMore ? (
            <div className="rounded-md bg-muted/20 px-4 py-2 text-muted-foreground text-sm">
              読み込み中...
            </div>
          ) : hasNextPage ? (
            <button
              type="button"
              className="cursor-pointer rounded-md bg-muted/10 px-4 py-2 text-muted-foreground text-sm transition-colors hover:bg-muted/20"
              onClick={() => {
                if (!isLoadingMore && hasNextPage) {
                  loadMore()
                }
              }}
            >
              続きを読み込む
            </button>
          ) : null}
        </div>
      )}
      {/* ローディング表示 */}
      <WorksLoading
        loading={loadingFirst || isLoadingMore}
        hasWorks={flat.length > 0}
      />
    </div>
  )
}
