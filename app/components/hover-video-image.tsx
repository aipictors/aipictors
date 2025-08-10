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
 */
export function HoverVideoImage(props: Props) {
  const [isHovered, setIsHovered] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true)
    if (props.videoUrl && videoRef.current) {
      videoRef.current.currentTime = 0 // 最初から再生
      videoRef.current.play()
    }
  }, [props.videoUrl])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
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
