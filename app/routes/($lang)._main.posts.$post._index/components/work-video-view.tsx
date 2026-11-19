import {
  Loader2,
  type LucideIcon,
  Play,
  PlayCircle,
  Repeat,
  ScrollText,
  Volume2,
} from "lucide-react"
import {
  type ReactNode,
  type SyntheticEvent,
  useEffect,
  useRef,
  useState,
} from "react"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import {
  getCloudflareStreamUid,
  isCloudflareStreamUrl,
  toCloudflareStreamHlsUrlFromUid,
} from "~/utils/cloudflare-stream"
import {
  DEFAULT_VIDEO_AUTO_PLAY,
  DEFAULT_VIDEO_LOOP,
  readVideoAutoPlay,
  readVideoLoop,
  readViewerCaptionShown,
  saveVideoAutoPlay,
  saveVideoLoop,
  saveViewerCaptionShown,
} from "~/utils/video-playback-preference"

type Props = {
  videoUrl: string
  posterUrl?: string | null
  title?: string
  /** 動画の下に並べて読めるようにするキャプション（空なら切り替えも出さない） */
  caption?: ReactNode
}

const STREAM_READY_CACHE_TTL_MS = 1000 * 60 * 60 * 6
const STREAM_READY_RETRY_MS = 60_000

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

/** 動きを減らす設定・通信量を減らす設定の人と、自動再生をオフにした人には自動で再生しない（押したら再生） */
function canAutoPlay() {
  if (typeof window === "undefined") return false
  if (!readVideoAutoPlay()) return false
  if (!("IntersectionObserver" in window)) return false
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
    return false
  }
  const connection = (
    navigator as Navigator & {
      connection?: { saveData?: boolean }
    }
  ).connection
  return connection?.saveData !== true
}

/** 動画の下の切り替え（自動再生・ループ・キャプション） */
function VideoToggleButton(props: {
  icon: LucideIcon
  label: string
  isOn: boolean
  onLabel: string
  offLabel: string
  onClick: () => void
}) {
  const Icon = props.icon
  return (
    <button
      type="button"
      aria-pressed={props.isOn}
      onClick={props.onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors",
        props.isOn
          ? "border-transparent bg-foreground/10 text-foreground"
          : "border-border text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className="size-3.5" />
      {props.label}
      <span className="font-medium">
        {props.isOn ? props.onLabel : props.offLabel}
      </span>
    </button>
  )
}

export function WorkVideoView({ videoUrl, posterUrl, title, caption }: Props) {
  const t = useTranslation()
  const isStream = isCloudflareStreamUrl(videoUrl)
  const uid = getCloudflareStreamUid(videoUrl)
  const hlsUrl = toCloudflareStreamHlsUrlFromUid(uid)
  const [hasRequestedPlayback, setHasRequestedPlayback] = useState(false)
  const [streamCheckVersion, setStreamCheckVersion] = useState(0)
  const streamVideoRef = useRef<HTMLVideoElement>(null)
  const fileVideoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  // 画面に入ったら音なしで自動再生してループする（Discord の要望）。押して始めたときは音ありで再生する
  const [isAutoPlayback, setIsAutoPlayback] = useState(false)
  // 自動再生のあと音を出したら、最初から音ありで見られるようにする（ミュート解除とシーク戻しの 2 手間にしない）
  const [hasStartedWithSound, setHasStartedWithSound] = useState(false)
  // 自動再生するか・この動画をループするか・キャプションを並べるかは、その場で切り替えて端末に覚える（Discord の要望）
  const videoKey = uid ?? videoUrl
  const [isAutoPlayEnabled, setIsAutoPlayEnabled] = useState(
    DEFAULT_VIDEO_AUTO_PLAY,
  )
  const [isLoop, setIsLoop] = useState(DEFAULT_VIDEO_LOOP)
  const [isCaptionShown, setIsCaptionShown] = useState(false)
  const hasCaption = caption !== undefined && caption !== null && caption !== ""

  useEffect(() => {
    setIsAutoPlayEnabled(readVideoAutoPlay())
    setIsCaptionShown(readViewerCaptionShown())
  }, [])

  useEffect(() => {
    setIsLoop(readVideoLoop(videoKey))
  }, [videoKey])

  // null = checking, true = ready, false = not ready yet
  const [streamReady, setStreamReady] = useState<boolean | null>(
    isStream ? null : true,
  )

  useEffect(() => {
    setHasRequestedPlayback(false)
    setIsAutoPlayback(false)
    setHasStartedWithSound(false)
    setStreamReady(isStream ? null : true)
    setStreamCheckVersion(0)
  }, [isStream, videoUrl])

  // 動画が半分ほど見えたら読み込みを始める（見えるまでは読み込まない）
  useEffect(() => {
    const container = containerRef.current
    if (hasRequestedPlayback || !container || !canAutoPlay()) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        observer.disconnect()
        setIsAutoPlayback(true)
        setHasRequestedPlayback(true)
      },
      { threshold: 0.5 },
    )
    observer.observe(container)
    return () => observer.disconnect()
  }, [hasRequestedPlayback, videoUrl])

  // 自動再生のときは画面の外で止め、戻ったら続きから再生する
  useEffect(() => {
    const container = containerRef.current
    if (!isAutoPlayback || !hasRequestedPlayback || !container) return
    const observer = new IntersectionObserver(
      (entries) => {
        const video = streamVideoRef.current ?? fileVideoRef.current
        if (!video) return
        const isVisible = entries.some((entry) => entry.isIntersecting)
        if (!isVisible && !video.paused) {
          video.pause()
          video.dataset.autoPaused = "1"
        } else if (isVisible && video.dataset.autoPaused === "1") {
          delete video.dataset.autoPaused
          void video.play().catch(() => {})
        }
      },
      { threshold: 0.1 },
    )
    observer.observe(container)
    return () => observer.disconnect()
  }, [hasRequestedPlayback, isAutoPlayback, streamReady])

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
          timerId = setTimeout(check, STREAM_READY_RETRY_MS)
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

  useEffect(() => {
    if (
      !hasRequestedPlayback ||
      !isStream ||
      !hlsUrl ||
      !streamVideoRef.current
    ) {
      return
    }

    const video = streamVideoRef.current
    video.muted = isAutoPlayback

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = hlsUrl
      void video.play().catch(() => {})
      return
    }

    let cancelled = false
    let hls: import("hls.js").default | null = null

    // hls.js は大きいので、再生を開始したときにだけ読み込む
    import("hls.js").then(({ default: Hls }) => {
      if (cancelled) return

      if (!Hls.isSupported()) {
        video.src = hlsUrl
        void video.play().catch(() => {})
        return
      }

      hls = new Hls({
        autoStartLoad: true,
        enableWorker: true,
      })

      hls.loadSource(hlsUrl)
      hls.attachMedia(video)
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        void video.play().catch(() => {})
      })
    })

    return () => {
      cancelled = true
      if (hls === null) return
      hls.destroy()
      video.removeAttribute("src")
      video.load()
    }
  }, [hasRequestedPlayback, hlsUrl, isStream, isAutoPlayback, streamReady])

  const toggleAutoPlay = () => {
    const next = !isAutoPlayEnabled
    setIsAutoPlayEnabled(next)
    saveVideoAutoPlay(next)
    // 音なしで自動再生している途中なら、先の場面を見せないように再生ボタンの画面に戻す
    if (!next && isAutoPlayback && !hasStartedWithSound) {
      setIsAutoPlayback(false)
      setHasRequestedPlayback(false)
    }
  }

  const toggleLoop = () => {
    const next = !isLoop
    setIsLoop(next)
    saveVideoLoop(videoKey, next)
  }

  const toggleCaption = () => {
    const next = !isCaptionShown
    setIsCaptionShown(next)
    saveViewerCaptionShown(next)
  }

  const playFromStartWithSound = () => {
    const video = streamVideoRef.current ?? fileVideoRef.current
    if (!video) return
    setHasStartedWithSound(true)
    video.currentTime = 0
    video.muted = false
    void video.play().catch(() => {})
  }

  // コントロールでミュートを外したときも、1 回目は最初から再生し直す
  const onVolumeChange = (event: SyntheticEvent<HTMLVideoElement>) => {
    if (!isAutoPlayback || hasStartedWithSound) return
    const video = event.currentTarget
    if (video.muted || video.volume === 0) return
    setHasStartedWithSound(true)
    video.currentTime = 0
    void video.play().catch(() => {})
  }

  const soundButton =
    isAutoPlayback && !hasStartedWithSound ? (
      <button
        type="button"
        onClick={playFromStartWithSound}
        className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-full bg-black/65 px-3 py-1.5 font-medium text-sm text-white shadow hover:bg-black/80"
      >
        <Volume2 className="size-4" />
        {t("音ありで最初から再生", "Play from start with sound")}
      </button>
    ) : null

  const posterView = (
    <button
      type="button"
      onClick={() => setHasRequestedPlayback(true)}
      className="group relative mx-auto aspect-video w-full max-w-[1280px] overflow-hidden bg-zinc-100 dark:bg-zinc-900"
      aria-label={
        title
          ? t(`${title} を再生`, `Play ${title}`)
          : t("動画を再生", "Play video")
      }
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
            {t("再生するまで読み込みません", "Not loaded until you play")}
          </div>
        </div>
      </div>
    </button>
  )

  const renderPlayer = () => {
    if (isStream && hlsUrl) {
      if (!hasRequestedPlayback) {
        return (
          <div
            ref={containerRef}
            className="relative m-0 bg-zinc-100 object-contain dark:bg-zinc-900"
          >
            {posterView}
          </div>
        )
      }

      if (streamReady === null) {
        return (
          <div
            ref={containerRef}
            className="relative m-0 bg-zinc-100 dark:bg-zinc-900"
          >
            <div className="mx-auto flex aspect-video w-full max-w-[1280px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            </div>
          </div>
        )
      }

      if (!streamReady) {
        return (
          <div
            ref={containerRef}
            className="relative m-0 bg-zinc-100 dark:bg-zinc-900"
          >
            <div className="mx-auto flex aspect-video w-full max-w-[1280px] flex-col items-center justify-center gap-3 text-center">
              <Loader2 className="h-10 w-10 animate-spin text-zinc-400" />
              <p className="font-medium text-sm text-zinc-600 dark:text-zinc-400">
                {t("動画の準備中です", "Preparing the video")}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-500">
                {t(
                  "再生準備ができるまで 60 秒ごとに確認しています",
                  "Checking every 60 seconds until it is ready",
                )}
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setStreamReady(null)
                  setStreamCheckVersion((current) => current + 1)
                }}
              >
                {t("再確認する", "Check again")}
              </Button>
            </div>
          </div>
        )
      }

      return (
        <div
          ref={containerRef}
          className="relative m-0 bg-zinc-100 object-contain dark:bg-zinc-900"
        >
          <div className="mx-auto aspect-video w-full max-w-[1280px]">
            <video
              ref={streamVideoRef}
              poster={posterUrl ?? undefined}
              controls
              className="h-full w-full"
              autoPlay
              muted={isAutoPlayback}
              loop={isLoop}
              playsInline
              preload="metadata"
              onVolumeChange={onVolumeChange}
            >
              <track kind="captions" srcLang="en" label="English" />
            </video>
          </div>
          {soundButton}
        </div>
      )
    }

    if (!hasRequestedPlayback) {
      return (
        <div
          ref={containerRef}
          className="relative m-0 bg-zinc-100 object-contain dark:bg-zinc-900"
        >
          {posterView}
        </div>
      )
    }

    return (
      <div
        ref={containerRef}
        className="relative m-0 bg-zinc-100 object-contain dark:bg-zinc-900"
      >
        <video
          ref={fileVideoRef}
          controls
          className="m-auto h-auto w-auto object-contain xl:max-h-[80vh]"
          src={videoUrl}
          autoPlay
          muted={isAutoPlayback}
          loop={isLoop}
          playsInline
          preload="metadata"
          onVolumeChange={onVolumeChange}
        >
          <track kind="captions" srcLang="en" label="English" />
        </video>
        {soundButton}
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {renderPlayer()}
      <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
        <VideoToggleButton
          icon={PlayCircle}
          label={t("自動再生", "Autoplay")}
          isOn={isAutoPlayEnabled}
          onLabel={t("オン", "On")}
          offLabel={t("オフ", "Off")}
          onClick={toggleAutoPlay}
        />
        <VideoToggleButton
          icon={Repeat}
          label={t("ループ", "Loop")}
          isOn={isLoop}
          onLabel={t("オン", "On")}
          offLabel={t("オフ", "Off")}
          onClick={toggleLoop}
        />
        {hasCaption && (
          <VideoToggleButton
            icon={ScrollText}
            label={t("キャプション", "Caption")}
            isOn={isCaptionShown}
            onLabel={t("表示", "Shown")}
            offLabel={t("非表示", "Hidden")}
            onClick={toggleCaption}
          />
        )}
      </div>
      {hasCaption && isCaptionShown && (
        <div className="mt-2 max-h-48 overflow-y-auto whitespace-pre-wrap break-words rounded-lg bg-muted px-3 py-2.5 text-sm leading-relaxed">
          {caption}
        </div>
      )}
    </div>
  )
}
