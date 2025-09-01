import { graphql } from "gql.tada"
import { MasonryGrid } from "./masonry-grid"
import { usePagedInfinite } from "~/routes/($lang)._main._index/hooks/use-paged-infinite"
import { useInfiniteScroll } from "~/routes/($lang)._main._index/hooks/use-infinite-scroll"
import { useScrollRestoration } from "~/routes/($lang)._main._index/hooks/use-scroll-restoration"
import { useQuery } from "@apollo/client/index"
import { useTranslation } from "~/hooks/use-translation"
import { PhotoAlbumWorkFragment } from "~/components/responsive-photo-works-album"
import { useCallback, useState, useMemo } from "react"

// フラグメントをクエリに追加
const WorksQuery = graphql(
  `
  query Works(
    $offset: Int!
    $limit: Int!
    $where: WorksWhereInput
  ) {
    works(
      offset: $offset
      limit: $limit
      where: $where
    ) {
      ...PhotoAlbumWork
    }
  }
`,
  [PhotoAlbumWorkFragment],
)

type Props = {
  rating: "G" | "R15" | "R18" | "R18G"
  workType: "WORK" | "NOVEL" | "VIDEO" | "COLUMN" | null
  sort: "DATE_CREATED" | "LIKES_COUNT" | "VIEWS_COUNT" | "COMMENTS_COUNT"
  style: "ILLUSTRATION" | "PHOTO" | "SEMI_REAL" | null
  isSensitive: boolean
}

/**
 * ピンタレスト風ギャラリービュー
 */
export function GalleryView(props: Props) {
  const t = useTranslation()
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // フィルター条件を構築（型を修正）
  const where = useMemo(() => {
    const baseWhere = {
      ratings: [props.rating],
      ...(props.workType && { workType: props.workType }),
      ...(props.isSensitive && { isSensitive: props.isSensitive }),
      orderBy: props.sort,
    }

    // styleを正しい型にマッピング
    if (props.style) {
      const mappedStyle =
        props.style === "PHOTO"
          ? "REAL"
          : (props.style as "ILLUSTRATION" | "SEMI_REAL" | "REAL")
      return { ...baseWhere, style: mappedStyle }
    }

    console.log("Gallery Query Where:", baseWhere)
    return baseWhere
  }, [props.rating, props.workType, props.style, props.isSensitive, props.sort])

  const PER_PAGE = 32

  // 初期クエリ
  const { data, fetchMore, loading, error } = useQuery(WorksQuery, {
    variables: {
      offset: 0,
      limit: PER_PAGE,
      where,
    },
    errorPolicy: "all",
  })

  // エラーをコンソールに出力
  if (error) {
    console.error("Gallery GraphQL Error:", error)
  }

  // ページ管理
  const storeKey = useMemo(
    () =>
      JSON.stringify({
        rating: props.rating,
        workType: props.workType,
        sort: props.sort,
        style: props.style,
        isSensitive: props.isSensitive,
      }),
    [props],
  )

  const { pages, appendPage, flat } = usePagedInfinite(
    data?.works ? [data.works] : [],
    `gallery-${storeKey}`,
  )

  // hasNextの計算を修正：最後のページが満タンの場合、次のページがある可能性
  // 他の実装に合わせて PER_PAGE - 8 の閾値を使用
  const hasNext = (pages.at(-1)?.length ?? 0) >= PER_PAGE - 8

  // スクロール位置復元
  const ready = pages.length > 0 || !!data?.works?.length
  useScrollRestoration(`gallery-${storeKey}`, ready)

  const loadMore = useCallback(async () => {
    if (!hasNext || isLoadingMore) return

    setIsLoadingMore(true)
    try {
      const result = await fetchMore({
        variables: {
          offset: flat.length,
          limit: PER_PAGE,
          where,
        },
      })
      if (result.data?.works?.length) {
        appendPage(result.data.works)
      }
    } catch (error) {
      console.error("Failed to load more works:", error)
    } finally {
      setIsLoadingMore(false)
    }
  }, [hasNext, isLoadingMore, fetchMore, flat.length, where, appendPage])

  const sentinelRef = useInfiniteScroll(loadMore, {
    hasNext,
    loading: isLoadingMore,
  })

  const works = flat

  // 初期ローディング中の場合
  if (loading && works.length === 0) {
    return (
      <div className="space-y-6">
        <MasonryGrid works={[]} isLoadingMore={false} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 作品グリッド */}
      <MasonryGrid works={works} isLoadingMore={isLoadingMore} />

      {/* 無限スクロール用のセンチネル */}
      {hasNext && (
        <div
          ref={sentinelRef}
          className="h-1 w-full"
          style={{ marginTop: "24px" }}
        />
      )}

      {/* ローディング表示 */}
      {isLoadingMore && (
        <div className="flex justify-center py-8">
          <div className="flex items-center gap-2">
            <div className="size-5 animate-spin rounded-full border-2 border-muted border-t-primary" />
            <span className="text-muted-foreground text-sm">
              {t("作品を読み込み中...", "Loading more artworks...")}
            </span>
          </div>
        </div>
      )}

      {/* 終了メッセージ */}
      {!hasNext && works.length > 0 && (
        <div className="py-8 text-center">
          <p className="text-muted-foreground text-sm">
            {t("すべての作品を表示しました", "All artworks loaded")}
          </p>
        </div>
      )}

      {/* 空の状態 */}
      {works.length === 0 && !isLoadingMore && !loading && (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <p className="text-lg text-muted-foreground">
              {t("作品が見つかりませんでした", "No artworks found")}
            </p>
            <p className="text-muted-foreground text-sm">
              {t(
                "フィルター条件を変更してみてください",
                "Try changing the filter conditions",
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
