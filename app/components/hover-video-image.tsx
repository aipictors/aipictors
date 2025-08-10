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
 * スマホの場合は自動再生を行う
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

  // スマホの場合の自動再生効果
  useEffect(() => {
    if (isMobile && props.videoUrl && videoRef.current) {
      const video = videoRef.current
      video.currentTime = 0
      video.play().catch(() => {
        // 自動再生に失敗した場合は何もしない
      })
    }
  }, [isMobile, props.videoUrl])

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true)
    if (!isMobile && props.videoUrl && videoRef.current) {
      videoRef.current.currentTime = 0 // 最初から再生
      videoRef.current.play()
    }
  }, [props.videoUrl, isMobile])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
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

      {props.videoUrl && (
        <video
          ref={videoRef}
          src={props.videoUrl}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-300",
            // スマホの場合は常に表示、PCの場合はホバー時のみ表示
            isMobile || isHovered ? "opacity-100" : "opacity-0",
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
