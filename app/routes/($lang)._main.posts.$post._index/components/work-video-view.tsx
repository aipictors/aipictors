import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import {
  getCloudflareStreamUid,
  isCloudflareStreamUrl,
  toCloudflareStreamEmbedUrl,
} from "~/utils/cloudflare-stream"

type Props = {
  videoUrl: string
}

export function WorkVideoView ({ videoUrl }: Props) {
  const isStream = isCloudflareStreamUrl(videoUrl)
  const embedUrl = toCloudflareStreamEmbedUrl(videoUrl)
  const uid = getCloudflareStreamUid(videoUrl)
  const embedAutoplayUrl = embedUrl
    ? `${embedUrl}?autoplay=true&muted=true&loop=true&preload=auto`
    : null

  // null = checking, true = ready, false = not ready yet
  const [streamReady, setStreamReady] = useState<boolean | null>(
    isStream ? null : true,
  )

  useEffect(() => {
    if (!isStream || !uid) {
      setStreamReady(true)
      return
    }

    let cancelled = false
    let timerId: ReturnType<typeof setTimeout> | null = null

    const check = async () => {
      try {
        const resp = await fetch(`/api/stream-video-ready?uid=${uid}`)
        if (cancelled) return
        if (!resp.ok) {
          setStreamReady(true)
          return
        }
        const data = (await resp.json()) as { ready: boolean }
        if (cancelled) return
        if (data.ready) {
          setStreamReady(true)
        } else {
          setStreamReady(false)
          timerId = setTimeout(check, 10_000)
        }
      } catch {
        if (!cancelled) setStreamReady(true)
      }
    }

    check()

    return () => {
      cancelled = true
      if (timerId !== null) clearTimeout(timerId)
    }
  }, [isStream, uid])

  if (isStream && embedUrl) {
    if (streamReady === null) {
      return (
        <div className="relative m-0 bg-zinc-100 dark:bg-zinc-900">
          <div className="mx-auto flex aspect-video w-full max-w-[1280px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
          </div>
        </div>
      )
    }

    if (!streamReady) {
      return (
        <div className="relative m-0 bg-zinc-100 dark:bg-zinc-900">
          <div className="mx-auto flex aspect-video w-full max-w-[1280px] flex-col items-center justify-center gap-3 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-zinc-400" />
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              動画の準備中です
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-500">
              しばらくしてから画面を更新してください
            </p>
          </div>
        </div>
      )
    }

    return (
      <div className="relative m-0 bg-zinc-100 object-contain dark:bg-zinc-900">
        <div className="mx-auto aspect-video w-full max-w-[1280px]">
          <iframe
            src={embedAutoplayUrl ?? embedUrl}
            title="Cloudflare Stream Video"
            className="h-full w-full"
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    )
  }

  return (
    <div className="relative m-0 bg-zinc-100 object-contain dark:bg-zinc-900">
      <video
        controls
        className="m-auto h-auto w-auto object-contain xl:max-h-[80vh]"
        src={videoUrl}
        autoPlay={true}
        loop={true}
        muted={true}
        playsInline
      >
        <track kind="captions" srcLang="en" label="English" />
      </video>
    </div>
  )
}
