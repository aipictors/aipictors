import { memo, useMemo } from "react"
import type { FragmentOf } from "gql.tada"
import { Link } from "@remix-run/react"
import { Heart, Eye, Images } from "lucide-react"
import { OptimizedImage } from "~/components/optimized-image"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { LikeButton } from "~/components/like-button"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"
import type { PhotoAlbumWorkFragment } from "~/components/responsive-photo-works-album"

type Props = {
  works: FragmentOf<typeof PhotoAlbumWorkFragment>[]
  loading?: boolean
}

type WorkItemProps = {
  work: FragmentOf<typeof PhotoAlbumWorkFragment>
}

/**
 * マソンリーグリッドのスケルトンローディング
 */
const MasonryGridSkeleton = () => {
  const skeletonItems = Array.from({ length: 20 }, (_, i) => ({
    id: `skeleton-${i}`,
    height: Math.floor(Math.random() * 200) + 200, // 200-400pxのランダムな高さ
  }))

  const columnKeys = Array.from(
    { length: 6 },
    (_, i) => `skeleton-column-${Date.now()}-${i}`,
  )

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {columnKeys.map((columnKey, columnIndex) => (
        <div key={columnKey} className="flex flex-col gap-3">
          {skeletonItems
            .filter((_, index) => index % 6 === columnIndex)
            .map((item) => (
              <div key={item.id} className="animate-pulse">
                <div
                  className="rounded-lg bg-muted"
                  style={{ height: `${item.height}px` }}
                />
                <div className="mt-2 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-muted" />
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-muted" />
                    <div className="h-3 w-16 rounded bg-muted" />
                  </div>
                </div>
              </div>
            ))}
        </div>
      ))}
    </div>
  )
}

/**
 * ピンタレスト風マソンリーグリッド
 */
export const MasonryGrid = memo<Props>(({ works, loading }) => {
  // レスポンシブなカラム数の設定
  const getColumnCount = () => {
    if (typeof window === "undefined") return 4
    const width = window.innerWidth
    if (width < 640) return 2 // sm未満: 2列
    if (width < 768) return 3 // md未満: 3列
    if (width < 1024) return 4 // lg未満: 4列
    if (width < 1280) return 5 // xl未満: 5列
    return 6 // xl以上: 6列
  }

  // 作品をカラムに分散配置
  const columns = useMemo(() => {
    const columnCount = getColumnCount()
    const cols: FragmentOf<typeof PhotoAlbumWorkFragment>[][] = Array.from(
      { length: columnCount },
      () => [],
    )

    works.forEach((work, index) => {
      const columnIndex = index % columnCount
      cols[columnIndex].push(work)
    })

    return cols
  }, [works])

  if (loading && works.length === 0) {
    return <MasonryGridSkeleton />
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {columns.map((column, columnIndex) => (
        <div
          key={`column-${columnIndex}-${works.length}`}
          className="flex flex-col gap-3"
        >
          {column.map((work) => (
            <WorkItem key={work.id} work={work} />
          ))}
        </div>
      ))}
    </div>
  )
})

/**
 * 個別の作品アイテム
 */
const WorkItem = memo<WorkItemProps>(({ work }) => {
  // アスペクト比を計算してカードの高さを決定
  const aspectRatio =
    work.smallThumbnailImageHeight / work.smallThumbnailImageWidth
  const imageHeight = Math.min(Math.max(aspectRatio * 240, 180), 400) // 最小180px、最大400px

  return (
    <Link
      to={`/posts/gallery/${work.id}`}
      className="group relative block overflow-hidden rounded-lg bg-card shadow-sm transition-all duration-200 hover:shadow-lg"
    >
      {/* メイン画像 */}
      <div className="relative overflow-hidden" style={{ height: imageHeight }}>
        <OptimizedImage
          src={work.smallThumbnailImageURL}
          alt={work.title}
          width={work.smallThumbnailImageWidth}
          height={work.smallThumbnailImageHeight}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* オーバーレイ */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

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
        <div className="absolute right-2 bottom-2 flex items-center gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
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
      </div>

      {/* 作品情報 - 余白を削除 */}
      <div className="p-2">
        {/* タイトル */}
        <h3 className="line-clamp-2 font-medium text-foreground text-sm leading-tight">
          {work.title}
        </h3>

        {/* ユーザー情報 */}
        {work.user && (
          <div className="mt-1 flex items-center gap-2">
            <Avatar className="size-5">
              <AvatarImage
                src={withIconUrlFallback(work.user.iconUrl)}
                alt={work.user.name}
                className="size-5"
              />
              <AvatarFallback className="size-5 text-xs">
                {work.user.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="truncate text-muted-foreground text-xs">
              {work.user.name}
            </span>
          </div>
        )}
      </div>
    </Link>
  )
})

MasonryGrid.displayName = "MasonryGrid"
WorkItem.displayName = "WorkItem"
