import { useQuery } from "@apollo/client/index"
import { graphql, type FragmentOf } from "gql.tada"
import { useCallback, useState, useMemo, useEffect } from "react"
import { useInfiniteScroll } from "~/routes/($lang)._main._index/hooks/use-infinite-scroll"
import { usePagedInfinite } from "~/routes/($lang)._main._index/hooks/use-paged-infinite"
import { MasonryGrid } from "./masonry-grid"
import { Loader2Icon } from "lucide-react"
import { WorkDetailDialog } from "./work-detail-dialog"

type Props = {
  rating: "G" | "R15" | "R18" | "R18G"
  workType: "WORK" | "NOVEL" | "VIDEO" | "COLUMN" | null
  sort: "DATE_CREATED" | "LIKES_COUNT" | "VIEWS_COUNT" | "COMMENTS_COUNT"
  style: "ILLUSTRATION" | "PHOTO" | "SEMI_REAL" | null
  isSensitive: boolean
  selectedWorkId?: string | null
  onWorkSelect?: (workId: string | null) => void
}

const PER_PAGE = 40

/**
 * PhotoAlbumWorkフラグメント
 */
const PhotoAlbumWorkFragment = graphql(
  `fragment PhotoAlbumWork on WorkNode @_unmask {
    id
    title
    smallThumbnailImageURL
    smallThumbnailImageWidth
    smallThumbnailImageHeight
    largeThumbnailImageURL
    largeThumbnailImageWidth
    largeThumbnailImageHeight
    thumbnailImagePosition
    subWorksCount
    likesCount
    viewsCount
    commentsCount
    isLiked
    user {
      id
      name
      iconUrl
    }
  }`,
)

/**
 * Works取得クエリ
 */
const WorksQuery = graphql(
  `query GalleryWorks($offset: Int!, $limit: Int!, $where: WorksWhereInput!) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...PhotoAlbumWork
    }
  }`,
  [PhotoAlbumWorkFragment],
)

/**
 * ピンタレスト風ギャラリービュー
 */
export function GalleryView (props: Props) {
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // GraphQLクエリの条件を構築
  const where = useMemo(() => {
    const conditions: Record<string, unknown> = {
      ratings: props.isSensitive ? ["R18", "R18G"] : ["G", "R15"],
      orderBy: props.sort,
      isNowCreatedAt: true,
    }

    if (props.workType) {
      conditions.workType = props.workType
    }

    if (props.style) {
      conditions.style = props.style
    }

    return conditions
  }, [props.rating, props.workType, props.sort, props.style, props.isSensitive])

  // 無限スクロール用のページ管理
  const { pages, appendPage, replaceFirstPage, flat } = usePagedInfinite<
    FragmentOf<typeof PhotoAlbumWorkFragment>
  >([], `gallery-${JSON.stringify(where)}`)

  // GraphQLクエリ
  const { data, fetchMore, loading } = useQuery(WorksQuery, {
    variables: {
      offset: 0,
      limit: PER_PAGE,
      where,
    },
    fetchPolicy: "cache-first",
    errorPolicy: "ignore",
  })

  // 初期データの設定
  useEffect(() => {
    if (data?.works?.length) {
      replaceFirstPage(
        data.works as FragmentOf<typeof PhotoAlbumWorkFragment>[],
      )
    }
  }, [data?.works, replaceFirstPage])

  // 無限スクロールのロードモア関数
  const loadMore = useCallback(async () => {
    if (!hasNext || loading || isLoadingMore) return
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
        appendPage(
          result.data.works as FragmentOf<typeof PhotoAlbumWorkFragment>[],
        )
      }
    } catch (error) {
      console.error("Failed to load more works:", error)
    } finally {
      setIsLoadingMore(false)
    }
  }, [flat.length, where, fetchMore, appendPage, isLoadingMore])

  // hasNextの計算
  const lastPage = pages[pages.length - 1] ?? []
  const hasNext = lastPage.length >= PER_PAGE - 8

  // 無限スクロールのセンチネル
  const sentinelRef = useInfiniteScroll(loadMore, {
    hasNext,
    loading: loading || isLoadingMore,
  })

  // 作品選択のハンドラー
  const handleWorkClick = useCallback(
    (workId: string) => {
      props.onWorkSelect?.(workId)
    },
    [props.onWorkSelect],
  )

  const handleCloseDialog = useCallback(() => {
    props.onWorkSelect?.(null)
  }, [props.onWorkSelect])

  // 選択された作品の詳細を取得
  const selectedWork = useMemo(() => {
    if (!props.selectedWorkId) return null
    return flat.find((work) => work.id === props.selectedWorkId) || null
  }, [props.selectedWorkId, flat])

  if (loading && flat.length === 0) {
    return (
      <div className="flex justify-center py-16">
        <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* マソンリーグリッド */}
        <MasonryGrid
          works={flat}
          onWorkClick={handleWorkClick}
          loading={loading}
        />

        {/* ローディング表示 */}
        {isLoadingMore && (
          <div className="flex justify-center py-8">
            <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* 無限スクロールのセンチネル */}
        {hasNext && (
          <div ref={sentinelRef} className="h-1" style={{ height: 1 }} />
        )}

        {/* データがない場合のメッセージ */}
        {!loading && flat.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-muted-foreground">
              条件に一致する作品が見つかりませんでした
            </p>
          </div>
        )}
      </div>

      {/* 作品詳細ダイアログ */}
      {selectedWork && (
        <WorkDetailDialog
          work={selectedWork}
          open={!!props.selectedWorkId}
          onClose={handleCloseDialog}
        />
      )}
    </>
  )
}
