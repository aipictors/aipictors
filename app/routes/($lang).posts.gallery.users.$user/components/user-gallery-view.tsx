import { graphql } from "gql.tada"
import { MasonryWorkGrid } from "~/components/masonry-work-grid"
import { usePagedInfinite } from "~/routes/($lang)._main._index/hooks/use-paged-infinite"
import { useInfiniteScroll } from "~/routes/($lang)._main._index/hooks/use-infinite-scroll"
import { useScrollRestoration } from "~/routes/($lang)._main._index/hooks/use-scroll-restoration"
import { useQuery } from "@apollo/client/index"
import { useTranslation } from "~/hooks/use-translation"
import { PhotoAlbumWorkFragment } from "~/components/responsive-photo-works-album"
import { useCallback, useState, useMemo, useEffect } from "react"
import { useSearchParams } from "@remix-run/react"

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
  const [searchParams] = useSearchParams()

  console.log("UserGalleryView userId:", props.userId)

  // 詳細検索フィルターの値を取得
  const searchText = searchParams.get("q") ?? ""
  const promptText = searchParams.get("prompt") ?? ""
  const workTypeParam = searchParams.get("workType") as
    | "WORK"
    | "NOVEL"
    | "VIDEO"
    | "COLUMN"
    | null
  const sortParam = searchParams.get("sort") as
    | "DATE_CREATED"
    | "LIKES_COUNT"
    | "VIEWS_COUNT"
    | "COMMENTS_COUNT"
    | null
  const ratingsParam = searchParams.get("ratings")
  const hasPrompt = searchParams.get("hasPrompt") === "true"
  const hasEmbedding = searchParams.get("hasEmbedding") === "true"
  const isAnimation = searchParams.get("isAnimation") === "true"
  const isFanbox = searchParams.get("isFanbox") === "true"

  // レーティングを配列に変換（デフォルトは全レーティング）
  const ratings: ("G" | "R15" | "R18" | "R18G")[] = ratingsParam
    ? ratingsParam
        .split(",")
        .filter((r): r is "G" | "R15" | "R18" | "R18G" =>
          ["G", "R15", "R18", "R18G"].includes(
            r as "G" | "R15" | "R18" | "R18G",
          ),
        )
    : ["G", "R15", "R18", "R18G"]

  // ユーザー作品のフィルター条件を構築
  const where = useMemo(() => {
    const userWhere = {
      userId: props.userId,
      ratings,
      ...(workTypeParam && { workType: workTypeParam }),
      // 検索テキストが存在する場合のみsearchフィールドを追加
      ...(searchText.trim() && { search: searchText.trim() }),
      // プロンプト検索が存在する場合のみpromptフィールドを追加
      ...(promptText.trim() && { prompt: promptText.trim() }),
      // 詳細オプション
      ...(hasPrompt && { hasPrompt: true }),
      ...(hasEmbedding && { hasEmbedding: true }),
      ...(isAnimation && { isAnimationWork: true }),
      ...(isFanbox && { isPublicFanbox: true }),
      orderBy: sortParam || "DATE_CREATED",
      isNowCreatedAt: true,
    }

    console.log("User Gallery Query Where:", userWhere)
    return userWhere
  }, [
    props.userId,
    ratings,
    workTypeParam,
    searchText,
    promptText,
    hasPrompt,
    hasEmbedding,
    isAnimation,
    isFanbox,
    sortParam,
  ])

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
  const storeKey = useMemo(
    () =>
      JSON.stringify({
        userId: props.userId,
        ratings,
        workType: workTypeParam,
        sort: sortParam,
        searchText,
        promptText,
        hasPrompt,
        hasEmbedding,
        isAnimation,
        isFanbox,
      }),
    [
      props.userId,
      ratings,
      workTypeParam,
      sortParam,
      searchText,
      promptText,
      hasPrompt,
      hasEmbedding,
      isAnimation,
      isFanbox,
    ],
  )

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
