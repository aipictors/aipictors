import { useState, useRef, useEffect, useCallback } from "react"

type Props = {
  videoUrl: string
  mode?: "dialog" | "page"
}

export function WorkVideoView({ videoUrl, mode = "page" }: Props) {
  const [isVideoReady, setIsVideoReady] = useState(false)
  const [isVideoVisible, setIsVideoVisible] = useState(false)
  const [hasError, setHasError] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Intersection Observer での遅延読み込み
  const initializeObserver = useCallback(() => {
    if (observerRef.current || !videoRef.current) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVideoVisible(true)
            // 一度読み込みを開始したらオブザーバーを停止
            if (observerRef.current) {
              observerRef.current.disconnect()
            }
          }
        })
      },
      {
        // 要素が50%見えた時点で読み込み開始
        threshold: 0.5,
        // 少し早めに読み込み開始（100px手前から）
        rootMargin: "100px 0px",
      }
    )

    observerRef.current.observe(videoRef.current)
  }, [])

  useEffect(() => {
    // ダイアログモードでは即座に表示、ページモードでは遅延読み込み
    if (mode === "dialog") {
      setIsVideoVisible(true)
    } else {
      initializeObserver()
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [mode, initializeObserver])

  const handleLoadedMetadata = useCallback(() => {
    setIsVideoReady(true)
  }, [])

  const handleError = useCallback(() => {
    setHasError(true)
    console.error("動画の読み込みに失敗しました:", videoUrl)
  }, [videoUrl])

  const handleCanPlay = useCallback(() => {
    // ダイアログモードでは自動再生しない（ユーザー操作を尊重）
    if (mode === "page" && videoRef.current) {
      // ページモードでも初回は自動再生しない（パフォーマンス重視）
      // ユーザーがコントロールで再生開始する
    }
  }, [mode])

  // エラー時のフォールバック表示
  if (hasError) {
    return (
      <div className="relative m-0 bg-zinc-100 object-contain dark:bg-zinc-900">
        <div className="flex items-center justify-center min-h-[200px] text-muted-foreground">
          <p>動画の読み込みに失敗しました</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative m-0 bg-zinc-100 object-contain dark:bg-zinc-900">
      {/* ローディング表示 */}
      {isVideoVisible && !isVideoReady && (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="flex flex-col items-center space-y-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
            <span className="text-muted-foreground text-sm">動画を読み込み中...</span>
          </div>
        </div>
      )}

      {/* 動画要素 */}
      <video
        ref={videoRef}
        controls
        className="m-auto h-auto w-auto object-contain xl:max-h-[80vh]"
        style={{
          opacity: isVideoReady ? 1 : 0,
          transition: "opacity 0.3s ease-in-out",
        }}
        // 遅延読み込み：表示されるまでsrcを設定しない
        src={isVideoVisible ? videoUrl : undefined}
        // autoPlayを削除してパフォーマンス向上
        autoPlay={false}
        loop={true}
        muted={true}
        playsInline
        // 適応的なプリロード戦略
        preload={mode === "dialog" ? "metadata" : "none"}
        onLoadedMetadata={handleLoadedMetadata}
        onCanPlay={handleCanPlay}
        onError={handleError}
        // モバイル対応
        webkit-playsinline="true"
        x5-playsinline="true"
        x5-video-player-type="h5"
      >
        <track kind="captions" srcLang="en" label="English" />
      </video>

      {/* プレースホルダー（動画が見えるまで） */}
      {!isVideoVisible && (
        <div className="flex items-center justify-center min-h-[200px] bg-muted/50">
          <div className="text-muted-foreground text-sm">
            スクロールして動画を表示
          </div>
        </div>
      )}
    </div>
  )
}
