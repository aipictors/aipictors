import { graphql } from "gql.tada"
import { MasonryWorkGrid } from "~/components/masonry-work-grid"
import { usePagedInfinite } from "~/routes/($lang)._main._index/hooks/use-paged-infinite"
import { useInfiniteScroll } from "~/routes/($lang)._main._index/hooks/use-infinite-scroll"
import { useScrollRestoration } from "~/routes/($lang)._main._index/hooks/use-scroll-restoration"
import { useQuery } from "@apollo/client/index"
import { useTranslation } from "~/hooks/use-translation"
import { PhotoAlbumWorkFragment } from "~/components/responsive-photo-works-album"
import { useCallback, useState, useMemo, useEffect } from "react"

// ユーザー作品取得クエリ
const UserWorksQuery = graphql(
  `
  query UserWorks(
    $offset: Int!
    $limit: Int!
    $where: WorksWhereInput!
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
  userId: string
}

/**
 * ギャラリー内のユーザー専用ビュー（ピンタレスト風）
 */
export function UserGalleryView(props: Props) {
  const t = useTranslation()
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  console.log("UserGalleryView userId:", props.userId)

  // ユーザー作品のフィルター条件を構築
  const where = useMemo(() => {
    const userWhere = {
      userId: props.userId,
      ratings: ["G", "R15", "R18", "R18G"], // 全レーティングを含める
      orderBy: "DATE_CREATED", // 最新順で表示
      isNowCreatedAt: true,
    }

    console.log("User Gallery Query Where:", userWhere)
    return userWhere
  }, [props.userId])

  const PER_PAGE = 32

  // 初期クエリ
  const { data, fetchMore, loading, error } = useQuery(UserWorksQuery, {
    variables: {
      offset: 0,
      limit: PER_PAGE,
      where,
    },
    errorPolicy: "all",
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "network-only", // 画面更新時は必ずネットワークから取得
  })

  console.log("User Gallery GraphQL query result:", {
    data: data?.works?.length,
    loading,
    error,
  })

  // エラーをコンソールに出力
  if (error) {
    console.error("User Gallery GraphQL Error:", error)
  }

  // ページ管理
  const storeKey = useMemo(() => `user-gallery-${props.userId}`, [props.userId])

  const { pages, appendPage, flat, replaceFirstPage } = usePagedInfinite(
    data?.works ? [data.works] : [],
    storeKey,
  )

  // 初期データをページに設定
  useEffect(() => {
    if (data?.works && data.works.length > 0 && pages.length === 0) {
      console.log("Setting initial user gallery page data:", data.works.length)
      replaceFirstPage(data.works)
    }
  }, [data?.works, pages.length, replaceFirstPage])

  // 詳細ログ出力
  console.log("User Gallery state:", {
    hasData: !!data?.works,
    dataLength: data?.works?.length || 0,
    pagesLength: pages.length,
    flatLength: flat.length,
    loading,
  })

  // hasNextの計算：最後のページが満タンの場合、次のページがある可能性
  const hasNext = (pages.at(-1)?.length ?? 0) >= PER_PAGE - 8

  // スクロール位置復元
  const ready = pages.length > 0 || !!data?.works?.length
  useScrollRestoration(storeKey, ready)

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
      console.error("Failed to load more user works:", error)
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
        <MasonryWorkGrid works={[]} isLoadingMore={false} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 作品グリッド */}
      <MasonryWorkGrid works={works} isLoadingMore={isLoadingMore} />

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
                "このユーザーはまだ作品を投稿していません",
                "This user hasn't posted any artworks yet",
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
