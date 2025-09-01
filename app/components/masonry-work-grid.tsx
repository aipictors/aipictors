import { useMemo, useState, useEffect } from "react"
import type { FragmentOf } from "gql.tada"
import { Link } from "@remix-run/react"
import { Heart, Eye, Images } from "lucide-react"
import { OptimizedImage } from "~/components/optimized-image"
import { Skeleton } from "~/components/ui/skeleton"
import { LikeButton } from "~/components/like-button"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"
import type { PhotoAlbumWorkFragment } from "~/components/responsive-photo-works-album"
import { GalleryTagList } from "~/components/tag/gallery-tag"

type Props = {
  works: FragmentOf<typeof PhotoAlbumWorkFragment>[]
  isLoadingMore?: boolean
  baseUrl?: string // "posts/gallery" or "gallery" など
}

type WorkItemProps = {
  work: FragmentOf<typeof PhotoAlbumWorkFragment>
  baseUrl?: string
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
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {columns.map((column) => {
        // スケルトンカラムの一意のキーを生成
        const firstItemId =
          column.length > 0
            ? column[0]?.id
            : `empty-${Math.random().toString(36).substr(2, 9)}`
        const columnKey = `skeleton-column-${firstItemId}-${column.length}`

        return (
          <div key={columnKey} className="flex flex-col gap-3">
            {column.map((item) => (
              <div key={item.id} className="overflow-hidden rounded-lg bg-card">
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
 * 共通のマソンリーグリッド
 */
export function MasonryWorkGrid(props: Props) {
  const { works, isLoadingMore, baseUrl = "posts/gallery" } = props
  const [columnCount, setColumnCount] = useState(6)

  // デバッグログ
  console.log("MasonryWorkGrid - received props:", {
    worksLength: works.length,
    isLoadingMore,
    baseUrl,
    works: works.slice(0, 3), // 最初の3件のみログ出力
  })

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
    const cols: FragmentOf<typeof PhotoAlbumWorkFragment>[][] = Array.from(
      { length: columnCount },
      () => [],
    )

    // カラムの現在の高さを追跡（推定値）
    const columnHeights = Array.from({ length: columnCount }, () => 0)

    works.forEach((work) => {
      // 最も高さの低いカラムを選択
      const shortestColumnIndex = columnHeights.indexOf(
        Math.min(...columnHeights),
      )
      cols[shortestColumnIndex].push(work)

      // 作品の高さを推定してカラムの高さを更新
      const aspectRatio =
        work.smallThumbnailImageHeight / work.smallThumbnailImageWidth
      const estimatedImageHeight = Math.min(
        Math.max(aspectRatio * 240, 180),
        400,
      )
      // 画像 + gap-3（12px） + 作品情報部分（タイトル + ユーザ情報で約80px）
      const totalItemHeight = estimatedImageHeight + 12 + 80
      columnHeights[shortestColumnIndex] += totalItemHeight
    })

    return cols
  }, [works, columnCount])

  // 初期読み込み中（作品がない場合）はフルスケルトンを表示
  if (works.length === 0) {
    return <MasonryGridSkeleton showFullGrid={true} />
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {columns.map((column) => {
        // カラムの一意のキーを生成（カラム内の作品IDから）
        const columnKey =
          column.length > 0
            ? `col-${column[0]?.id}-${column.length}`
            : `empty-col-${Math.random().toString(36).substr(2, 9)}`

        return (
          <div key={columnKey} className="flex flex-col gap-3">
            {/* 既存の作品 */}
            {column.map((work) => (
              <WorkItem key={work.id} work={work} baseUrl={baseUrl} />
            ))}

            {/* ローディング中のスケルトンタイル（カラムあたり1個ずつ） */}
            {isLoadingMore && (
              <div
                key={`loading-skeleton-${columnKey}`}
                className="overflow-hidden rounded-lg bg-card"
              >
                <Skeleton
                  className="w-full bg-muted/20"
                  style={{
                    height: `${200 + (columns.indexOf(column) % 3) * 100}px`,
                  }}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
/**
 * 個別の作品アイテム（余白ゼロ対策版）
 * ポイント:
 * - 画像に `block` を必ず付けてインライン隙間を消す
 * - 画像を `absolute inset-0` で親の高さにピッタリ合わせる
 * - 親Linkに `leading-none` を入れて行高由来の隙間も予防
 */
function WorkItem(props: WorkItemProps) {
  const { work, baseUrl = "posts/gallery" } = props

  const aspectRatio =
    work.smallThumbnailImageHeight / work.smallThumbnailImageWidth
  const imageHeight = Math.min(Math.max(aspectRatio * 240, 180), 400)

  return (
    <Link
      to={`/${baseUrl}/${work.id}`}
      className="group relative block overflow-hidden rounded-lg bg-card shadow-sm transition-all duration-200 hover:shadow-lg hover:shadow-primary/20 leading-none"
    >
      {/* 画像コンテナ */}
      <div className="relative" style={{ height: imageHeight }}>
        {/* ここが重要：block + absolute inset-0 で下余白を完全排除 */}
        <OptimizedImage
          src={work.smallThumbnailImageURL}
          alt={work.title}
          width={work.smallThumbnailImageWidth}
          height={work.smallThumbnailImageHeight}
          className="block absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
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

        {/* いいねボタン（クリックをLinkに伝播させない） */}
        <button
          type="button"
          className="absolute top-2 left-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              e.stopPropagation()
            }
          }}
        >
          <LikeButton
            size={32}
            targetWorkId={work.id}
            targetWorkOwnerUserId={work.user?.id ?? ""}
            defaultLiked={work.isLiked}
            defaultLikedCount={work.likesCount}
            isBackgroundNone={false}
            strokeWidth={2}
          />
        </button>

        {/* 統計情報 */}
        <div className="absolute bottom-2 right-2 flex items-center gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div className="flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs text-white backdrop-blur-sm">
            <Heart className="size-3" />
            <span>{work.likesCount}</span>
          </div>
          {work.commentsCount > 0 && (
            <div className="flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs text-white backdrop-blur-sm">
              <Eye className="size-3" />
              <span>{work.commentsCount}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
