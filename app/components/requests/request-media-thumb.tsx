import { Play } from "lucide-react"
import { useState } from "react"

/**
 * リクエストの画像・動画の小さな表示。
 * 納品の動画も画像と同じ置き場の URL（拡張子なし）なので、画像として読めなかったら動画として出す
 */
export function RequestMediaThumb(props: { url: string; lazy?: boolean }) {
  const [isVideo, setIsVideo] = useState(false)
  if (isVideo) {
    return (
      <span className="relative block size-full">
        <video
          src={props.url}
          muted
          playsInline
          preload="metadata"
          className="size-full object-cover"
        />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex size-8 items-center justify-center rounded-full bg-black/60 text-white">
            <Play className="size-4 fill-current" />
          </span>
        </span>
      </span>
    )
  }
  return (
    <img
      src={props.url}
      alt=""
      loading={props.lazy ? "lazy" : undefined}
      className="size-full object-cover"
      onError={() => setIsVideo(true)}
    />
  )
}
