import { memo } from "react"
import { OptimizedWorkGrid } from "~/components/optimized-work-grid"
import {
  ResponsivePhotoWorksAlbum,
  type PhotoAlbumWorkFragment,
} from "~/components/responsive-photo-works-album"
import type { FragmentOf } from "gql.tada"

type Work = {
  id: string
  title: string
  smallThumbnailImageURL: string
  smallThumbnailImageWidth: number
  smallThumbnailImageHeight: number
  user?: {
    id?: string
    name?: string
    iconUrl?: string
  } | null
}

type Props = {
  works: Work[]
  onSelect?: (workId: string) => void
  isCropped?: boolean
  loading?: boolean
}

/**
 * モバイル最適化された作品描画コンポーネント
 * - 小さい画面では OptimizedWorkGrid を使用
 * - 大きい画面では ResponsivePhotoWorksAlbum を使用
 */
export const MobileOptimizedWorksRenderer = memo((props: Props) => {
  const { works, onSelect, loading = false } = props

  // モバイル判定（SSR対応）
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="size-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
      </div>
    )
  }

  if (works.length === 0) {
    return null
  }

  // モバイルでは最適化グリッドを使用
  if (isMobile) {
    const optimizedWorks = works.map((work) => ({
      id: work.id,
      title: work.title,
      imageUrl: work.smallThumbnailImageURL,
      width: work.smallThumbnailImageWidth,
      height: work.smallThumbnailImageHeight,
      userId: work.user?.id,
      userName: work.user?.name,
      userIcon: work.user?.iconUrl,
    }))

    return (
      <OptimizedWorkGrid
        works={optimizedWorks}
        onWorkClick={onSelect}
        gridCols={3}
        itemHeight={180}
      />
    )
  }

  // デスクトップでは従来のコンポーネントを使用
  return (
    <ResponsivePhotoWorksAlbum
      works={works as unknown as FragmentOf<typeof PhotoAlbumWorkFragment>[]}
      isShowProfile
      onSelect={onSelect}
    />
  )
})

MobileOptimizedWorksRenderer.displayName = "MobileOptimizedWorksRenderer"

export { MobileOptimizedWorksRenderer as default }
