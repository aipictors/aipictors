import { Loader2, Play } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "~/components/ui/button"
import {
  getCloudflareStreamUid,
  isCloudflareStreamUrl,
  toCloudflareStreamEmbedUrl,
} from "~/utils/cloudflare-stream"

type Props = {
  videoUrl: string
  posterUrl?: string | null
  title?: string
}

const STREAM_READY_CACHE_TTL_MS = 1000 * 60 * 60 * 6

type StreamReadyCacheValue = {
  ready: boolean
  expiresAt: number
}

function getStreamReadyCacheKey(uid: string) {
  return `stream-ready:${uid}`
}

function readCachedStreamReady(uid: string): boolean {
  if (typeof window === "undefined") {
    return false
  }

  try {
    const raw = window.localStorage.getItem(getStreamReadyCacheKey(uid))

    if (!raw) {
      return false
    }

    const parsed = JSON.parse(raw) as StreamReadyCacheValue

    if (parsed.ready !== true || parsed.expiresAt <= Date.now()) {
      window.localStorage.removeItem(getStreamReadyCacheKey(uid))
      return false
    }

    return true
  } catch {
    return false
  }
}

function writeCachedStreamReady(uid: string) {
  if (typeof window === "undefined") {
    return
  }

  try {
    const value: StreamReadyCacheValue = {
      ready: true,
      expiresAt: Date.now() + STREAM_READY_CACHE_TTL_MS,
    }

    window.localStorage.setItem(
      getStreamReadyCacheKey(uid),
      JSON.stringify(value),
    )
  } catch {
    // localStorage が使えなくても再生自体は継続する
  }
}

export function WorkVideoView({ videoUrl, posterUrl, title }: Props) {
  const isStream = isCloudflareStreamUrl(videoUrl)
  const embedUrl = toCloudflareStreamEmbedUrl(videoUrl)
  const uid = getCloudflareStreamUid(videoUrl)
  const embedPlaybackUrl = embedUrl ? `${embedUrl}?autoplay=true` : null
  const [hasRequestedPlayback, setHasRequestedPlayback] = useState(false)
  const [streamCheckVersion, setStreamCheckVersion] = useState(0)

  // null = checking, true = ready, false = not ready yet
  const [streamReady, setStreamReady] = useState<boolean | null>(
    isStream ? null : true,
  )

  useEffect(() => {
    setHasRequestedPlayback(false)
    setStreamReady(isStream ? null : true)
    setStreamCheckVersion(0)
  }, [isStream, videoUrl])

  useEffect(() => {
    if (!isStream || !uid) {
      setStreamReady(true)
      return
    }

    if (!hasRequestedPlayback) {
      return
    }

    if (readCachedStreamReady(uid)) {
      setStreamReady(true)
      return
    }

    setStreamReady(null)

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
          writeCachedStreamReady(uid)
          setStreamReady(true)
        } else {
          setStreamReady(false)
          timerId = setTimeout(check, 30_000)
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
  }, [hasRequestedPlayback, isStream, streamCheckVersion, uid])

  const posterView = (
    <button
      type="button"
      onClick={() => setHasRequestedPlayback(true)}
      className="group relative mx-auto aspect-video w-full max-w-[1280px] overflow-hidden bg-zinc-100 dark:bg-zinc-900"
      aria-label={title ? `${title} を再生` : "動画を再生"}
    >
      {posterUrl ? (
        <img
          src={posterUrl}
          alt={title ?? "Video thumbnail"}
          className="h-full w-full object-contain"
        />
      ) : (
        <div className="h-full w-full bg-zinc-200 dark:bg-zinc-800" />
      )}
      <div className="absolute inset-0 bg-black/25 transition-colors group-hover:bg-black/35" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex size-16 items-center justify-center rounded-full bg-white/90 text-zinc-900 shadow-lg">
            <Play className="ml-1 size-8 fill-current" />
          </div>
          <div className="rounded-full bg-black/65 px-4 py-1.5 font-medium text-sm text-white">
            再生するまで読み込みません
          </div>
        </div>
      </div>
    </button>
  )

  if (isStream && embedUrl) {
    if (!hasRequestedPlayback) {
      return (
        <div className="relative m-0 bg-zinc-100 object-contain dark:bg-zinc-900">
          {posterView}
        </div>
      )
    }

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
            <p className="font-medium text-sm text-zinc-600 dark:text-zinc-400">
              動画の準備中です
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-500">
              再生準備ができるまで 30 秒ごとに確認しています
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setStreamReady(null)
                setStreamCheckVersion((current) => current + 1)
              }}
            >
              再確認する
            </Button>
          </div>
        </div>
      )
    }

    return (
      <div className="relative m-0 bg-zinc-100 object-contain dark:bg-zinc-900">
        <div className="mx-auto aspect-video w-full max-w-[1280px]">
          <iframe
            src={embedPlaybackUrl ?? embedUrl}
            title="Cloudflare Stream Video"
            className="h-full w-full"
            loading="lazy"
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    )
  }

  if (!hasRequestedPlayback) {
    return (
      <div className="relative m-0 bg-zinc-100 object-contain dark:bg-zinc-900">
        {posterView}
      </div>
    )
  }

  return (
    <div className="relative m-0 bg-zinc-100 object-contain dark:bg-zinc-900">
      <video
        controls
        className="m-auto h-auto w-auto object-contain xl:max-h-[80vh]"
        src={videoUrl}
        autoPlay
        playsInline
        preload="metadata"
      >
        <track kind="captions" srcLang="en" label="English" />
      </video>
    </div>
  )
}
