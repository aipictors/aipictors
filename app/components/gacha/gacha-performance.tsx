import { useEffect, useMemo, useRef, useState } from "react"
import {
  type GachaDirection,
  type GachaItem,
  planGachaDirection,
} from "~/components/gacha/gacha-direction"
import type { GachaStage } from "~/components/gacha/gacha-stage.client"
import { cn } from "~/lib/utils"

const MODEL_URL = "/images/pictor-chan/pictor-chan-gacha-3d-v1.glb"
const LOADING_IMAGE_URL = "/images/pictor-chan/gacha-loading.webp"

type Props = {
  items: readonly GachaItem[]
  /** 渡さなければレア度から決める */
  direction?: GachaDirection
  onClose: () => void
  /** 結果の画面に出すボタン（もう一回引く など） */
  actions?: React.ReactNode
}

/**
 * ガチャ演出（全画面）。景品の配列を渡すだけで、どのガチャにも使える。
 * 3D が出せない端末・動きを減らす設定の人には、結果だけを出す
 */
export function GachaPerformance(props: Props): React.ReactNode {
  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<GachaStage | null>(null)
  const direction = useMemo(
    () => props.direction ?? planGachaDirection(props.items),
    [props.direction, props.items],
  )
  const [state, setState] = useState<
    "loading" | "playing" | "done" | "fallback"
  >("loading")
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setState("fallback")
      return
    }
    let cancelled = false
    // 演出ごとに新しいキャンバスを作る。前の演出の後片付け（WebGL の文脈を捨てる）が
    // 同じキャンバスを使う次の演出まで真っ黒にしないように
    const canvas = document.createElement("canvas")
    canvas.className = "h-full w-full touch-none"
    canvas.addEventListener("pointerup", () => stageRef.current?.tap())
    // 端末の都合で 3D が描けなくなったら、真っ黒のままにせず結果だけ出す
    canvas.addEventListener("webglcontextlost", () => {
      if (!cancelled) setState("fallback")
    })
    container.appendChild(canvas)
    setState("loading")
    setProgress(0)
    // 読み込みが終わらないときも結果だけ出す
    const timeout = window.setTimeout(() => {
      if (!cancelled && !stageRef.current) setState("fallback")
    }, 30_000)
    void (async () => {
      try {
        const { createGachaStage } = await import(
          "~/components/gacha/gacha-stage.client"
        )
        if (cancelled) return
        setProgress(0.15)
        const stage = await createGachaStage({
          canvas,
          modelUrl: MODEL_URL,
          items: props.items,
          direction,
          onProgress: (ratio) => {
            if (!cancelled) setProgress(0.15 + ratio * 0.8)
          },
          onComplete: () => setState("done"),
        })
        if (cancelled) {
          stage.dispose()
          return
        }
        stageRef.current = stage
        setProgress(1)
        setState("playing")
      } catch {
        if (!cancelled) setState("fallback")
      }
    })()
    return () => {
      cancelled = true
      window.clearTimeout(timeout)
      stageRef.current?.dispose()
      stageRef.current = null
      canvas.remove()
    }
  }, [props.items, direction])

  return (
    <div className="fixed inset-0 z-[100] select-none bg-black text-white">
      <div
        ref={containerRef}
        className={cn("h-full w-full", state === "fallback" && "hidden")}
      />
      {state === "loading" && <GachaLoading progress={progress} />}
      {state === "playing" && (
        <button
          type="button"
          className="absolute top-[max(12px,env(safe-area-inset-top))] right-3 rounded-full bg-white/15 px-4 py-1.5 font-bold text-sm backdrop-blur"
          onClick={() => stageRef.current?.skip()}
        >
          スキップ ≫
        </button>
      )}
      {state === "fallback" && <GachaResultList items={props.items} />}
      {(state === "done" || state === "fallback") && (
        <div className="absolute inset-x-0 bottom-[max(16px,env(safe-area-inset-bottom))] flex justify-center gap-3 px-4">
          {props.actions}
          <button
            type="button"
            className="rounded-full bg-white px-6 py-2.5 font-bold text-black text-sm"
            onClick={props.onClose}
          >
            閉じる
          </button>
        </div>
      )}
    </div>
  )
}

const LOADING_STYLE = `
@keyframes gacha-loading-hop { 0%, 100% { transform: translateY(0) rotate(-2deg) } 50% { transform: translateY(-14px) rotate(2deg) } }
@keyframes gacha-loading-shadow { 0%, 100% { transform: scaleX(1); opacity: .35 } 50% { transform: scaleX(.7); opacity: .18 } }
@keyframes gacha-loading-dot { 0%, 80%, 100% { opacity: .25; transform: translateY(0) } 40% { opacity: 1; transform: translateY(-4px) } }
@keyframes gacha-loading-twinkle { 0%, 100% { opacity: 0; transform: scale(.4) rotate(0) } 50% { opacity: 1; transform: scale(1) rotate(45deg) } }
`

const TWINKLES = [
  { left: "18%", top: "22%", delay: "0s", size: 18 },
  { left: "78%", top: "18%", delay: ".6s", size: 14 },
  { left: "84%", top: "52%", delay: "1.1s", size: 20 },
  { left: "12%", top: "58%", delay: "1.6s", size: 12 },
  { left: "50%", top: "12%", delay: ".3s", size: 10 },
]

/** 演出の準備中（ぴくたーちゃんが跳ねて待つ）。progress は 0〜1 */
function GachaLoading(props: { progress: number }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-sky-200 via-pink-100 to-violet-200 text-slate-700">
      <style>{LOADING_STYLE}</style>
      {TWINKLES.map((twinkle) => (
        <svg
          key={twinkle.left + twinkle.top}
          viewBox="-10 -10 20 20"
          width={twinkle.size}
          height={twinkle.size}
          className="absolute"
          style={{
            left: twinkle.left,
            top: twinkle.top,
            animation: `gacha-loading-twinkle 2.2s ${twinkle.delay} ease-in-out infinite`,
          }}
          aria-hidden="true"
        >
          <path
            d="M0-10C1.2-2.2 2.2-1.2 10 0 2.2 1.2 1.2 2.2 0 10-1.2 2.2-2.2 1.2-10 0-2.2-1.2-1.2-2.2 0-10Z"
            fill="#fff"
          />
        </svg>
      ))}
      <div className="relative flex flex-col items-center">
        <img
          src={LOADING_IMAGE_URL}
          alt=""
          width={150}
          height={221}
          className="relative z-10 h-[200px] w-auto drop-shadow-[0_6px_12px_rgba(120,80,160,.25)]"
          style={{ animation: "gacha-loading-hop 1s ease-in-out infinite" }}
        />
        <div
          className="-mt-3 h-4 w-28 rounded-[50%] bg-violet-900/40"
          style={{ animation: "gacha-loading-shadow 1s ease-in-out infinite" }}
        />
      </div>
      <div className="mt-6 flex items-center font-bold text-base">
        ぴくたーちゃんが準備中
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className="inline-block"
            style={{
              animation: `gacha-loading-dot 1.2s ${index * 0.18}s ease-in-out infinite`,
            }}
          >
            .
          </span>
        ))}
      </div>
      <div className="mt-4 h-2.5 w-56 overflow-hidden rounded-full bg-white/70 shadow-inner">
        <div
          className="h-full rounded-full bg-gradient-to-r from-pink-400 via-amber-300 to-sky-400 transition-[width] duration-300"
          style={{
            width: `${Math.round(Math.max(0.04, props.progress) * 100)}%`,
          }}
        />
      </div>
    </div>
  )
}

const RARITY_CLASS: Record<GachaItem["rarity"], string> = {
  N: "bg-zinc-500",
  R: "bg-gradient-to-r from-blue-500 to-blue-700",
  SR: "bg-gradient-to-r from-violet-400 to-violet-700",
  SSR: "bg-gradient-to-r from-amber-300 to-orange-500",
  UR: "bg-gradient-to-r from-pink-400 via-yellow-300 to-sky-400",
}

/** 演出なしで結果だけ並べる */
function GachaResultList(props: { items: readonly GachaItem[] }) {
  return (
    <div className="absolute inset-0 overflow-y-auto px-4 pt-12 pb-24">
      <div className="mx-auto grid max-w-xl grid-cols-3 gap-3 sm:grid-cols-5">
        {props.items.map((item) => (
          <div key={item.id} className="rounded-xl bg-white/10 p-2 text-center">
            <span
              className={cn(
                "inline-block rounded-full px-2 font-black text-[11px]",
                RARITY_CLASS[item.rarity],
              )}
            >
              {item.rarity}
            </span>
            <img
              src={item.imageUrl}
              alt=""
              className="mx-auto aspect-square w-full object-contain"
            />
            <div className="truncate font-bold text-xs">{item.name}</div>
            {item.isNew && (
              <div className="font-black text-[10px] text-pink-300">NEW</div>
            )}
            {item.note && (
              <div className="text-[10px] opacity-70">{item.note}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
