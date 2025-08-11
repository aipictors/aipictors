import { Link } from "@remix-run/react"
import { useState, useRef, useCallback, useEffect } from "react"
import { OptimizedImage } from "~/components/optimized-image"
import { cn } from "~/lib/utils"
import { isMobileDevice } from "~/utils/mobile-performance"

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
 * スマホ: 静止画のサムネイルのみ表示（動画自動再生なし）
 */
export function HoverVideoImage(props: Props) {
  const [isHovered, setIsHovered] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // モバイルデバイスの判定
  useEffect(() => {
    const checkMobile = () => {
      if (typeof window === "undefined") return false
      return (
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent,
        ) || window.innerWidth < 768
      )
    }
    setIsMobile(checkMobile())
  }, [])

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true)
    // PCでのみ動画再生（スマホでは動画再生しない）
    if (!isMobile && props.videoUrl && videoRef.current) {
      videoRef.current.currentTime = 0 // 最初から再生
      videoRef.current.play()
    }
  }, [props.videoUrl, isMobile])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
    // PCでのみ動画停止
    if (!isMobile && videoRef.current) {
      videoRef.current.pause()
    }
  }, [isMobile])

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

      {/* 動画はPCでホバー時のみ表示、スマホでは表示しない */}
      {props.videoUrl && !isMobile && (
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
