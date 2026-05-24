import { Link } from "@remix-run/react"
import { OptimizedImage } from "~/components/optimized-image"
import { SensitiveThumbnailOverlay } from "~/components/sensitive/sensitive-thumbnail-overlay"
import { cn } from "~/lib/utils"

type Props = {
  workId: string
  imageUrl: string
  videoUrl?: string | null
  streamUid?: string | null
  alt: string
  className?: string
  fetchPriority?: "high" | "low" | "auto"
  to?: string
  onClick?: () => void
  width?: number
  height?: number
  loading?: "lazy" | "eager"
  isAutoPlay?: boolean
  shouldMaskSensitive?: boolean
}

/**
 * ホバー時に動画を再生する画像コンポーネント
 * PC: ホバー時のみ動画再生
 * スマホ: サムネイル内での動画再生（全画面表示は防ぐ）
 * Safari対応：特定の表示問題を修正
 */
export function HoverVideoImage(props: Props): React.ReactNode {
  const imageContent = (
    <>
      <OptimizedImage
        src={props.imageUrl}
        alt={props.alt}
        width={props.width}
        height={props.height}
        fetchPriority={props.fetchPriority}
        loading={props.loading}
        className="h-full w-full transition-transform duration-300 ease-in-out hover:scale-105"
        style={{
          // Safari対応：画像表示を強制
          WebkitBackfaceVisibility: "hidden",
          transform: "translateZ(0)",
          minWidth: "100%",
          minHeight: "100%",
        }}
      />

      <SensitiveThumbnailOverlay
        imageUrl={props.imageUrl}
        imageWidth={props.width}
        imageHeight={props.height}
        isHidden={props.shouldMaskSensitive === true}
      />
    </>
  )

  if (props.onClick) {
    return (
      <button
        type="button"
        onClick={props.onClick}
        className={cn("relative overflow-hidden", props.className)}
      >
        {imageContent}
      </button>
    )
  }

  if (props.to) {
    return (
      <Link
        to={props.to}
        className={cn("relative overflow-hidden", props.className)}
      >
        {imageContent}
      </Link>
    )
  }

  return (
    <div
      className={cn("relative overflow-hidden", props.className)}
      role="img"
      aria-label={props.alt}
    >
      {imageContent}
    </div>
  )
}
