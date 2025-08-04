import { memo, useMemo } from "react"
import { LazyLoadComponent } from "~/components/lazy-load-component"
import { OptimizedImage } from "~/components/optimized-image"
import { Link } from "@remix-run/react"
import { cn } from "~/lib/utils"
import { debounce } from "~/utils/mobile-performance"

type Work = {
  id: string
  title: string
  imageUrl: string
  width: number
  height: number
  userId?: string
  userName?: string
  userIcon?: string
}

type Props = {
  works: Work[]
  loading?: boolean
  onWorkClick?: (workId: string) => void
  gridCols?: 2 | 3 | 4 | 5
  itemHeight?: number
}

/**
 * モバイルパフォーマンス最適化された作品グリッドコンポーネント
 * - Intersection Observer による段階的読み込み
 * - debounced スクロールイベント
 * - optimized image loading
 */
export const OptimizedWorkGrid = memo((props: Props) => {
  const {
    works,
    loading = false,
    gridCols = 3,
    itemHeight = 200,
    onWorkClick,
  } = props

  // グリッドをチャンクに分割して段階的に読み込み
  const chunkedWorks = useMemo(() => {
    const chunkSize = 6 // 一度に読み込む作品数
    const chunks: Work[][] = []
    for (let i = 0; i < works.length; i += chunkSize) {
      chunks.push(works.slice(i, i + chunkSize))
    }
    return chunks
  }, [works])

  // debounced click handler
  const debouncedClick = useMemo(
    () =>
      debounce((workId: string) => {
        onWorkClick?.(workId)
      }, 300),
    [onWorkClick],
  )

  const gridClass = cn("grid gap-2 md:gap-3", {
    "grid-cols-2": gridCols === 2,
    "grid-cols-3": gridCols === 3,
    "grid-cols-4": gridCols === 4,
    "grid-cols-5": gridCols === 5,
  })

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="size-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {chunkedWorks.map((chunk, chunkIndex) => (
        <LazyLoadComponent
          key={chunkIndex}
          threshold={0.1}
          rootMargin="200px"
          disableOnServer={true} // SSR対応でチカチカ防止
          fallback={null} // fallbackは表示せずチカチカを防ぐ
        >
          <div className={gridClass}>
            {chunk.map((work) => (
              <WorkItem
                key={work.id}
                work={work}
                itemHeight={itemHeight}
                onClick={() => debouncedClick(work.id)}
              />
            ))}
          </div>
        </LazyLoadComponent>
      ))}
    </div>
  )
})

const WorkItem = memo(
  ({
    work,
    itemHeight,
    onClick,
  }: {
    work: Work
    itemHeight: number
    onClick: () => void
  }) => {
    return (
      <button
        type="button"
        className="group relative overflow-hidden rounded-lg transition-transform duration-200 hover:scale-105"
        onClick={onClick}
        style={{ height: itemHeight }}
      >
        <OptimizedImage
          src={work.imageUrl}
          alt={work.title}
          width={work.width}
          height={work.height}
          loading="lazy"
          className="h-full w-full object-cover"
        />

        {/* オーバーレイ */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

        {/* タイトル */}
        <div className="absolute bottom-2 left-2 right-2 translate-y-full transform transition-transform duration-200 group-hover:translate-y-0">
          <p className="truncate text-sm font-medium text-white">
            {work.title}
          </p>
          {work.userName && (
            <p className="truncate text-xs text-white/80">{work.userName}</p>
          )}
        </div>
      </button>
    )
  },
)

OptimizedWorkGrid.displayName = "OptimizedWorkGrid"
WorkItem.displayName = "WorkItem"
