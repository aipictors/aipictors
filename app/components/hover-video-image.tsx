import { Link } from "@remix-run/react"
import { useState, useRef, useCallback } from "react"
import { OptimizedImage } from "~/components/optimized-image"
import { cn } from "~/lib/utils"

type Props = {
  workId: string
  imageUrl: string
  videoUrl?: string | null
  alt: string
  className?: string
  to?: string
  onClick?: () => void
  width?: number
  height?: number
  loading?: "lazy" | "eager"
}

/**
 * ホバー時に動画を再生する画像コンポーネント
 * PC: ホバー時のみ動画再生
 * スマホ: サムネイル内での動画再生（全画面表示は防ぐ）
 */
export function HoverVideoImage(props: Props) {
  const [isHovered, setIsHovered] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true)
    // 動画再生（スマホでも再生するが全画面表示は防ぐ）
    if (props.videoUrl && videoRef.current) {
      videoRef.current.currentTime = 0 // 最初から再生
      videoRef.current.play()
    }
  }, [props.videoUrl])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
    // 動画停止
    if (videoRef.current) {
      videoRef.current.pause()
    }
  }, [])

  const imageContent = (
    <>
      <OptimizedImage
        src={props.imageUrl}
        alt={props.alt}
        width={props.width}
        height={props.height}
        loading={props.loading}
        className="h-full w-full transition-transform duration-300 ease-in-out hover:scale-105"
      />

      {/* 動画表示（スマホでは全画面表示を防ぐためplaysInlineを強制適用） */}
      {props.videoUrl && (
        <video
          ref={videoRef}
          src={props.videoUrl}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-300",
            isHovered ? "opacity-100" : "opacity-0",
          )}
          muted
          loop
          playsInline
          preload="metadata"
          // スマホでの全画面表示を完全に防ぐ
          webkit-playsinline="true"
          x5-playsinline="true"
          x5-video-player-type="h5"
          x5-video-player-fullscreen="false"
        />
      )}
    </>
  )

  if (props.onClick) {
    return (
      <button
        type="button"
        onClick={props.onClick}
        className={cn("relative overflow-hidden", props.className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
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
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {imageContent}
      </Link>
    )
  }

  return (
    <div
      className={cn("relative overflow-hidden", props.className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="img"
      aria-label={props.alt}
    >
      {imageContent}
    </div>
  )
}
