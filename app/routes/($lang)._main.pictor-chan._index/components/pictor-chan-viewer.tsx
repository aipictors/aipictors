import { useEffect, useRef, useState } from "react"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import type {
  PictorChanMotion,
  PictorChanViewer as Viewer,
} from "~/routes/($lang)._main.pictor-chan._index/components/pictor-chan-viewer.client"

const MODEL_URL = "/images/pictor-chan/pictor-chan-3d-v3.glb"

/**
 * 動く 3D のぴくたーちゃん。読み込むまで（と、通信量を節約する設定のとき）は絵を出す
 */
export function PictorChanViewer(): React.ReactNode {
  const t = useTranslation()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const viewerRef = useRef<Viewer | null>(null)
  const [state, setState] = useState<"image" | "loading" | "ready">("image")
  const [motion, setMotion] = useState<PictorChanMotion>("idle")
  /** 自動では読み込まない（通信量の節約・動きを減らす設定） */
  const [isManual, setIsManual] = useState(false)
  const [isWanted, setIsWanted] = useState(false)

  useEffect(() => {
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection
    if (
      connection?.saveData ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setIsManual(true)
      return
    }
    // ページの表示を先に済ませてから読み込む
    const timer = window.setTimeout(() => setIsWanted(true), 900)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!isWanted || !canvas) return
    let cancelled = false
    setState("loading")
    void (async () => {
      try {
        const { createPictorChanViewer } = await import(
          "~/routes/($lang)._main.pictor-chan._index/components/pictor-chan-viewer.client"
        )
        if (cancelled) return
        const viewer = await createPictorChanViewer(
          canvas,
          MODEL_URL,
          setMotion,
        )
        if (cancelled) {
          viewer.dispose()
          return
        }
        viewerRef.current = viewer
        setState("ready")
      } catch {
        // 3D が出せない端末では、絵のままにする
        if (!cancelled) setState("image")
      }
    })()
    return () => {
      cancelled = true
      viewerRef.current?.dispose()
      viewerRef.current = null
    }
  }, [isWanted])

  const motions: { value: PictorChanMotion; label: string }[] = [
    { value: "idle", label: t("まつ", "Idle") },
    { value: "run", label: t("はしる", "Run") },
    { value: "jump", label: t("ジャンプ", "Jump") },
    { value: "fall", label: t("ころぶ", "Fall") },
  ]

  return (
    <div className="relative flex h-full w-full flex-col items-center">
      <div className="relative min-h-0 w-full flex-1">
        <img
          src="/images/pictor-chan/pictor-chan-3d-preview.webp"
          alt={t("ぴくたーちゃんの3Dモデル", "The Pictor-chan 3D model")}
          width={477}
          height={900}
          fetchPriority="high"
          decoding="async"
          className={cn(
            "pkc-float absolute inset-0 m-auto h-full w-auto object-contain drop-shadow-[0_18px_30px_rgba(10,20,80,0.45)] transition-opacity duration-500",
            state === "ready" && "opacity-0",
          )}
        />
        <canvas
          ref={canvasRef}
          aria-label={t(
            "3D のぴくたーちゃん。ドラッグで回せます",
            "3D Pictor-chan. Drag to rotate",
          )}
          className={cn(
            "absolute inset-0 h-full w-full cursor-grab touch-pan-y transition-opacity duration-500 active:cursor-grabbing",
            state === "ready" ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        />
      </div>
      <div className="mt-2 flex min-h-9 flex-wrap items-center justify-center gap-1.5">
        {state === "ready" &&
          motions.map((item) => (
            <button
              key={item.value}
              type="button"
              aria-pressed={motion === item.value}
              onClick={() => viewerRef.current?.setMotion(item.value)}
              className={cn(
                "h-8 cursor-pointer rounded-full px-3.5 font-bold text-xs backdrop-blur-sm transition-colors",
                motion === item.value
                  ? "bg-white text-slate-900"
                  : "bg-white/20 text-white hover:bg-white/35",
              )}
            >
              {item.label}
            </button>
          ))}
        {state === "loading" && (
          <p className="animate-pulse rounded-full bg-white/20 px-4 py-1.5 font-bold text-white text-xs backdrop-blur-sm">
            {t("3D を読み込み中…", "Loading 3D…")}
          </p>
        )}
        {state === "image" && isManual && (
          <button
            type="button"
            onClick={() => setIsWanted(true)}
            className="h-8 cursor-pointer rounded-full bg-white px-4 font-bold text-slate-900 text-xs"
          >
            {t("3D で動かす", "View in 3D")}
          </button>
        )}
      </div>
      {state === "ready" && (
        <p className="mt-1 text-[11px] text-white/80">
          {t(
            "ドラッグで回せます・タップでジャンプ",
            "Drag to rotate, tap to jump",
          )}
        </p>
      )}
    </div>
  )
}
