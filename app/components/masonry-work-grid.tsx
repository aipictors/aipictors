import type { FragmentOf } from "gql.tada"
import { Eye, Heart, Images } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { LikeButton } from "~/components/like-button"
import { OptimizedImage } from "~/components/optimized-image"
import type { PhotoAlbumWorkFragment } from "~/components/responsive-photo-works-album"
import { Skeleton } from "~/components/ui/skeleton"
import { useTranslation } from "~/hooks/use-translation"
import { useViewerHiddenUserIds } from "~/hooks/use-viewer-hidden-user-ids"
import { Link } from "~/lib/app/locale-router"
import { filterWorksByHiddenUsers } from "~/utils/hidden-user-works"
import { splitMasonryBlocks } from "~/utils/split-masonry-columns"

type Props = {
  works: FragmentOf<typeof PhotoAlbumWorkFragment>[]
  isLoadingMore?: boolean
  baseUrl?: string // "posts/gallery" or "gallery" など
  /**
   * ブロックした人・ミュートした人の作品も出す（その人のプロフィールの一覧など、作者を決めて見る一覧）。
   * 省略時はログイン中の人の設定で外す
   */
  isShowingHiddenUsersWorks?: boolean
}

type WorkItemProps = {
  work: FragmentOf<typeof PhotoAlbumWorkFragment>
  baseUrl?: string
  /** 2 列ぶち抜きの横長の作品は、高さを固定せずこの縦横比（幅 / 高さ）の枠にする */
  wideAspectRatio?: number
}

/** 列の幅（約 240px）に対する画像の縦横比。WorkItem の高さ 180〜400px に合わせ、横長は 2 列ぶち抜き用に 1.78 まで */
const toGridAspectRatio = (work: FragmentOf<typeof PhotoAlbumWorkFragment>) => {
  const width = work.smallThumbnailImageWidth
  const height = work.smallThumbnailImageHeight
  if (!(width > 0) || !(height > 0)) return 1
  return Math.min(Math.max(width / height, 0.6), 1.78)
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
export function MasonryWorkGrid(props: Props): React.ReactNode {
  const { isLoadingMore, baseUrl = "posts/gallery" } = props
  const hiddenUserIds = useViewerHiddenUserIds()
  const works = props.isShowingHiddenUsersWorks
    ? props.works
    : filterWorksByHiddenUsers(props.works, hiddenUserIds)
  const [columnCount, setColumnCount] = useState(6)

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

  // 作品をカラムに分散配置（いちばん短い列に足す）。横長の作品は 2 列ぶち抜きの行にして、縦長ばかり大きく見えないようにする
  // 画像の下の作品情報（gap 12px + 約 80px）は列の幅 240px に対する割合で足す
  const blocks = useMemo(
    () => splitMasonryBlocks(works, columnCount, toGridAspectRatio, 92 / 240),
    [works, columnCount],
  )
  // 最後の列のかたまりは、読み込み中のスケルトンを列ごとに足すので別に描く
  const lastBlock = blocks[blocks.length - 1]
  const columns: FragmentOf<typeof PhotoAlbumWorkFragment>[][] = Array.from(
    { length: columnCount },
    (_, index) =>
      lastBlock?.kind === "columns"
        ? (lastBlock.columns[index] ?? []).map((v) => v.item)
        : [],
  )
  const leadingBlocks =
    lastBlock?.kind === "columns" ? blocks.slice(0, -1) : blocks
  const perRow = Math.max(1, Math.floor(columnCount / 2))

  // 初期読み込み中（作品がない場合）はフルスケルトンを表示
  if (works.length === 0) {
    return <MasonryGridSkeleton showFullGrid={true} />
  }

  return (
    <div className="flex flex-col gap-3">
      {leadingBlocks.map((block) =>
        block.kind === "wide" ? (
          <div key={`wide-${block.items[0]?.item.id}`} className="flex gap-3">
            {block.items.map(({ item }) => (
              <div
                key={item.id}
                className="min-w-0 flex-1"
                // 1 行に入りきらないときも、2 列分より広げない
                style={
                  block.items.length < perRow
                    ? {
                        maxWidth: `calc((100% - ${(columnCount - 1) * 12}px) * ${2 / columnCount} + 12px)`,
                      }
                    : undefined
                }
              >
                <WorkItem
                  work={item}
                  baseUrl={baseUrl}
                  wideAspectRatio={toGridAspectRatio(item)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div
            key={`columns-${block.columns[0]?.[0]?.item.id}`}
            className="grid grid-cols-2 items-start gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
          >
            {block.columns.map((column, columnIndex) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: 列の位置そのものが key
              <div key={columnIndex} className="flex flex-col gap-3">
                {column.map(({ item }) => (
                  <WorkItem key={item.id} work={item} baseUrl={baseUrl} />
                ))}
              </div>
            ))}
          </div>
        ),
      )}
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
  const t = useTranslation()
  const { work, baseUrl = "posts/gallery", wideAspectRatio } = props

  const aspectRatio =
    work.smallThumbnailImageHeight / work.smallThumbnailImageWidth
  const imageHeight = Math.min(Math.max(aspectRatio * 240, 180), 400)

  return (
    <Link
      to={`/${baseUrl}/${work.id}`}
      className="group relative block overflow-hidden rounded-lg bg-card leading-none shadow-sm transition-all duration-200 hover:shadow-lg hover:shadow-primary/20"
    >
      {/* 画像コンテナ */}
      <div
        className="relative"
        style={
          wideAspectRatio !== undefined
            ? { aspectRatio: `${wideAspectRatio}` }
            : { height: imageHeight }
        }
      >
        {/* ここが重要：block + absolute inset-0 で下余白を完全排除 */}
        <OptimizedImage
          src={work.smallThumbnailImageURL}
          alt={t.workTitle(work.title, work.enTitle)}
          width={work.smallThumbnailImageWidth}
          height={work.smallThumbnailImageHeight}
          className="absolute inset-0 block h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* オーバーレイ */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

        {/* サブ作品数バッジ */}
        {work.subWorksCount > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-neutral-200/70 px-2 py-1 text-neutral-800 text-xs backdrop-blur-sm dark:bg-white/10 dark:text-white">
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
        <div className="absolute right-2 bottom-2 flex items-center gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div
            data-list-like-count
            className="flex items-center gap-1 rounded-full bg-neutral-200/70 px-2 py-1 text-neutral-800 text-xs backdrop-blur-sm dark:bg-white/10 dark:text-white"
          >
            <Heart className="size-3" />
            <span>{work.likesCount}</span>
          </div>
          {work.commentsCount > 0 && (
            <div className="flex items-center gap-1 rounded-full bg-neutral-200/70 px-2 py-1 text-neutral-800 text-xs backdrop-blur-sm dark:bg-white/10 dark:text-white">
              <Eye className="size-3" />
              <span>{work.commentsCount}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
