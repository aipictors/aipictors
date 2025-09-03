import { useMemo, useState, useEffect } from "react"
import type { FragmentOf } from "gql.tada"
import { Link } from "@remix-run/react"
import { Heart, Eye, Images } from "lucide-react"
import { OptimizedImage } from "~/components/optimized-image"
import { Skeleton } from "~/components/ui/skeleton"
import { LikeButton } from "~/components/like-button"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"
import type { PhotoAlbumWorkFragment } from "~/components/responsive-photo-works-album"

type Props = {
  works: FragmentOf<typeof PhotoAlbumWorkFragment>[]
  isLoadingMore?: boolean
}

type WorkItemProps = {
  work: FragmentOf<typeof PhotoAlbumWorkFragment>
}

/**
 * マソンリーグリッドのスケルトンローディング
 */
const MasonryGridSkeleton = ({
  showFullGrid = true,
}: {
  showFullGrid?: boolean
}) => {
  // サーバーサイドでもクライアントサイドでも一貫したカラム数を使用
  const columnCount = 6 // 最大カラム数に合わせる
  const itemCount = showFullGrid ? 36 : columnCount * 3 // フルグリッドまたは部分的なスケルトン

  const skeletonItems = Array.from({ length: itemCount }, (_, i) => ({
    id: `skeleton-${i}`,
    height: 200 + (i % 3) * 100, // 200px, 300px, 400pxの高さをローテーション
    columnIndex: i % columnCount,
  }))

  // カラムごとにスケルトンアイテムを分散
  const columns = Array.from({ length: columnCount }, (_, columnIndex) =>
    skeletonItems.filter((item) => item.columnIndex === columnIndex),
  )

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-0 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {columns.map((column) => {
        // スケルトンカラムの一意のキーを生成
        const firstItemId =
          column.length > 0
            ? column[0]?.id
            : `empty-${Math.random().toString(36).substr(2, 9)}`
        const columnKey = `skeleton-column-${firstItemId}-${column.length}`

        return (
          <div key={columnKey} className="flex flex-col gap-0">
            {column.map((item) => (
              <div key={item.id} className="overflow-hidden bg-card">
                {/* 画像スケルトンのみ - テキスト情報は削除 */}
                <Skeleton
                  className="w-full bg-muted/20"
                  style={{ height: `${item.height}px` }}
                />
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

/**
 * ピンタレスト風マソンリーグリッド（改良版）
 */
export function MasonryGrid(props: Props) {
  const { works, isLoadingMore } = props
  const [columnCount, setColumnCount] = useState(6)

  // デバッグログ
  console.log("MasonryGrid - received works:", works.length, works)

  // レスポンシブなカラム数を設定
  useEffect(() => {
    const updateColumnCount = () => {
      const width = window.innerWidth
      if (width < 640)
        setColumnCount(2) // sm未満
      else if (width < 768)
        setColumnCount(3) // md未満
      else if (width < 1024)
        setColumnCount(4) // lg未満
      else if (width < 1280)
        setColumnCount(5) // xl未満
      else setColumnCount(6) // xl以上
    }

    updateColumnCount()
    window.addEventListener("resize", updateColumnCount)
    return () => window.removeEventListener("resize", updateColumnCount)
  }, [])

  // 作品をカラムに分散配置（高さを考慮した最適化）
  const columns = useMemo(() => {
    const cols: Array<{
      works: FragmentOf<typeof PhotoAlbumWorkFragment>[]
      totalHeight: number
    }> = Array.from({ length: columnCount }, () => ({
      works: [],
      totalHeight: 0,
    }))

    // 各作品を最も短いカラムに配置
    for (const work of works) {
      const aspectRatio =
        work.smallThumbnailImageHeight / work.smallThumbnailImageWidth
      const itemHeight = Math.min(Math.max(aspectRatio * 240, 180), 400)

      // 最も短いカラムを見つける
      const shortestColumn = cols.reduce((prev, current, index) => {
        return current.totalHeight < cols[prev].totalHeight ? index : prev
      }, 0)

      cols[shortestColumn].works.push(work)
      cols[shortestColumn].totalHeight += itemHeight
    }

    return cols
  }, [works, columnCount])

  // 初期ロード時またはworksが空の場合はスケルトンを表示
  if (works.length === 0) {
    return <MasonryGridSkeleton showFullGrid />
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-x-4 gap-y-0 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {columns.map((column, columnIndex) => (
          <div
            key={`column-${columnIndex}-${column.works.length}`}
            className="flex flex-col gap-0"
          >
            {column.works.map((work) => (
              <WorkItem key={work.id} work={work} />
            ))}
          </div>
        ))}
      </div>

      {/* 追加読み込み中のスケルトン */}
      {isLoadingMore && <MasonryGridSkeleton showFullGrid={false} />}
    </div>
  )
}

/**
 * 個別の作品アイテム（背景画像版）
 */
/**
 * 個別の作品アイテム（<img>版）
 */
function WorkItem({ work }: WorkItemProps) {
  // アスペクト比を計算してカードの高さを決定
  const aspectRatio =
    work.smallThumbnailImageHeight / work.smallThumbnailImageWidth
  const imageHeight = Math.min(Math.max(aspectRatio * 240, 180), 400) // 最小180px、最大400px

  return (
    <Link
      to={`/posts/gallery/${work.id}`}
      className="group relative block overflow-hidden rounded-lg shadow-sm transition-all duration-200 hover:shadow-lg"
      style={{ height: imageHeight }}
    >
      {/* サムネイル画像 */}
      <img
        src={work.smallThumbnailImageURL}
        alt={work.title}
        className="h-full w-full object-cover"
        loading="lazy"
      />

      {/* オーバーレイ - 常に表示して可読性を確保 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* ホバー時のオーバーレイ強化 */}
      <div className="absolute inset-0 bg-black/0 transition-all duration-200 group-hover:bg-black/20" />

      {/* サブ作品数バッジ */}
      {work.subWorksCount > 0 && (
        <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-white text-xs backdrop-blur-sm">
          <Images className="size-3" />
          <span>{work.subWorksCount + 1}</span>
        </div>
      )}

      {/* いいねボタン */}
      <div className="absolute top-2 left-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <LikeButton
          size={32}
          targetWorkId={work.id}
          targetWorkOwnerUserId={work.user?.id ?? ""}
          defaultLiked={work.isLiked}
          defaultLikedCount={work.likesCount}
          isBackgroundNone={false}
          strokeWidth={2}
        />
      </div>

      {/* 統計情報 */}
      <div className="absolute right-2 bottom-14 flex items-center gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <div className="flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-white text-xs backdrop-blur-sm">
          <Heart className="size-3" />
          <span>{work.likesCount}</span>
        </div>
        {work.commentsCount > 0 && (
          <div className="flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-white text-xs backdrop-blur-sm">
            <Eye className="size-3" />
            <span>{work.commentsCount}</span>
          </div>
        )}
      </div>

      {/* 作品情報 - 底部に固定、背景を半透明に */}
      <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/90 to-transparent p-3">
        {/* タイトル */}
        <h3 className="mb-1 line-clamp-2 font-medium text-sm text-white leading-tight">
          {work.title}
        </h3>

        {/* ユーザー情報 */}
        {work.user && (
          <div className="flex items-center gap-2">
            <div className="flex size-6 overflow-hidden rounded-full">
              <OptimizedImage
                src={withIconUrlFallback(work.user.iconUrl)}
                alt={work.user.name}
                width={24}
                height={24}
                className="size-full object-cover"
                loading="lazy"
              />
            </div>
            <span className="truncate text-white/90 text-xs">
              {work.user.name}
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}
