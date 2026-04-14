import { useEffect, useRef } from "react"
import Hls from "hls.js"

type Props = {
  src: string
  className?: string
  style?: React.CSSProperties
  isActive: boolean
}

export function StreamPreviewVideo(props: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!videoRef.current) {
      return
    }

    const video = videoRef.current

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = props.src
      return
    }

    if (!Hls.isSupported()) {
      return
    }

    const hls = new Hls({
      autoStartLoad: true,
      enableWorker: true,
    })

    hls.loadSource(props.src)
    hls.attachMedia(video)

    return () => {
      hls.destroy()
    }
  }, [props.src])

  useEffect(() => {
    if (!videoRef.current) {
      return
    }

    if (props.isActive) {
      void videoRef.current.play()
      return
    }

    videoRef.current.pause()
  }, [props.isActive])

  return (
    <video
      ref={videoRef}
      className={props.className}
      style={props.style}
      muted
      autoPlay={props.isActive}
      loop
      playsInline
      preload="metadata"
    />
  )
}