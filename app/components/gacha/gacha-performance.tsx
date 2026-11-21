import { useEffect, useMemo, useRef, useState } from "react"
import {
  type GachaDirection,
  type GachaItem,
  gachaRarityRank,
  planGachaDirection,
} from "~/components/gacha/gacha-direction"
import { GachaPerformance2D } from "~/components/gacha/gacha-performance-2d"
import {
  detectGachaQuality,
  type GachaQuality,
} from "~/components/gacha/gacha-quality"
import {
  renderGachaShareImage,
  shareGachaResult,
} from "~/components/gacha/gacha-share"
import type { GachaStage } from "~/components/gacha/gacha-stage.client"
import { cn } from "~/lib/utils"

const MODEL_URL: Record<Exclude<GachaQuality, "card">, string> = {
  full: "/images/pictor-chan/pictor-chan-gacha-3d-v1.glb",
  // テクスチャを 1024 にした軽いモデル（回線が遅いとき）
  lite: "/images/pictor-chan/pictor-chan-gacha-3d-v1.lite.glb",
}
/** 準備がこの時間を過ぎたら「軽い表示ですぐ見る」を出す */
const SHOW_LITE_BUTTON_MS = 5000
const LOADING_IMAGE_URL = "/images/pictor-chan/gacha-loading.webp"

type Props = {
  items: readonly GachaItem[]
  /** 渡さなければレア度から決める */
  direction?: GachaDirection
  onClose: () => void
  /** 結果の画面に出すボタン（もう一回引く など） */
  actions?: React.ReactNode
  /** auto: 回線に合わせる（遅ければ 2D）。3d / 2d: 決め打ち（管理ページの確認用） */
  mode?: "auto" | "3d" | "2d"
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
    "loading" | "playing" | "done" | "fallback" | "playing2d" | "done2d"
  >("loading")
  const [skipSignal, setSkipSignal] = useState(0)
  const [progress, setProgress] = useState(0)
  const [quality, setQuality] = useState<GachaQuality | null>(null)
  const [canSkipLoading, setCanSkipLoading] = useState(false)
  /** 準備の途中で 2D に切り替えた */
  const switchedToCardsRef = useRef(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const mode = props.mode ?? "auto"
    const picked: GachaQuality =
      mode === "2d" ? "card" : mode === "3d" ? "full" : detectGachaQuality()
    setQuality(picked)
    switchedToCardsRef.current = false
    setCanSkipLoading(false)
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setState("fallback")
      return
    }
    if (picked === "card") {
      setState("playing2d")
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
      if (!cancelled) setState("playing2d")
    })
    container.appendChild(canvas)
    setState("loading")
    setProgress(0)
    // 読み込みが終わらないときも結果だけ出す
    const timeout = window.setTimeout(() => {
      if (!cancelled && !stageRef.current) setState("playing2d")
    }, 30_000)
    const skipButtonTimer = window.setTimeout(() => {
      if (!cancelled) setCanSkipLoading(true)
    }, SHOW_LITE_BUTTON_MS)
    void (async () => {
      try {
        const { createGachaStage } = await import(
          "~/components/gacha/gacha-stage.client"
        )
        if (cancelled) return
        setProgress(0.15)
        const stage = await createGachaStage({
          canvas,
          modelUrl: MODEL_URL[picked],
          items: props.items,
          direction,
          onProgress: (ratio) => {
            if (!cancelled) setProgress(0.15 + ratio * 0.8)
          },
          onComplete: () => setState("done"),
        })
        if (cancelled || switchedToCardsRef.current) {
          stage.dispose()
          return
        }
        stageRef.current = stage
        setProgress(1)
        setState("playing")
      } catch {
        if (!cancelled) setState("playing2d")
      }
    })()
    return () => {
      cancelled = true
      window.clearTimeout(timeout)
      window.clearTimeout(skipButtonTimer)
      stageRef.current?.dispose()
      stageRef.current = null
      canvas.remove()
    }
  }, [props.items, direction, props.mode])

  return (
    <div className="fixed inset-0 z-[100] select-none bg-black text-white">
      <div
        ref={containerRef}
        className={cn(
          "h-full w-full",
          (state === "fallback" ||
            state === "playing2d" ||
            state === "done2d") &&
            "hidden",
        )}
      />
      {state === "loading" && (
        <GachaLoading
          progress={progress}
          isLite={quality === "lite"}
          onSkip={
            canSkipLoading
              ? () => {
                  switchedToCardsRef.current = true
                  setState("playing2d")
                }
              : undefined
          }
        />
      )}
      {(state === "playing2d" || state === "done2d") && (
        <GachaPerformance2D
          items={props.items}
          direction={direction}
          skipSignal={skipSignal}
          onComplete={() => setState("done2d")}
        />
      )}
      {(state === "playing" || state === "playing2d") && (
        <button
          type="button"
          className="absolute top-[max(12px,env(safe-area-inset-top))] right-3 rounded-full bg-white/15 px-4 py-1.5 font-bold text-sm backdrop-blur"
          onClick={() =>
            state === "playing2d"
              ? setSkipSignal((value) => value + 1)
              : stageRef.current?.skip()
          }
        >
          スキップ ≫
        </button>
      )}
      {state === "fallback" && <GachaResultList items={props.items} />}
      {(state === "done" || state === "fallback" || state === "done2d") && (
        <div className="absolute inset-x-0 bottom-[max(16px,env(safe-area-inset-bottom))] flex flex-wrap justify-center gap-3 px-4">
          <GachaShareButton items={props.items} />
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

/** 結果を画像にして共有する。画像は出た時点で作っておく（押した瞬間に共有シートを開くため） */
function GachaShareButton(props: { items: readonly GachaItem[] }) {
  const [image, setImage] = useState<Blob | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setIsReady(false)
    renderGachaShareImage(props.items)
      .catch(() => null)
      .then((blob) => {
        if (cancelled) return
        setImage(blob)
        setIsReady(true)
      })
    return () => {
      cancelled = true
    }
  }, [props.items])

  return (
    <button
      type="button"
      disabled={!isReady}
      className="rounded-full bg-gradient-to-r from-pink-500 to-violet-500 px-5 py-2.5 font-bold text-sm text-white shadow-[0_0_16px_rgba(236,72,153,.6)] disabled:opacity-50"
      onClick={async () => {
        const result = await shareGachaResult(props.items, image)
        if (result === "fallback" && image) {
          setNotice("画像を保存しました")
          window.setTimeout(() => setNotice(null), 2500)
        }
      }}
    >
      {notice ?? (isReady ? "結果をシェア" : "画像を準備中…")}
    </button>
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
function GachaLoading(props: {
  progress: number
  isLite: boolean
  onSkip?: () => void
}) {
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
      {props.isLite && (
        <div className="mt-3 text-slate-500 text-xs">
          回線にあわせて軽い表示にしています
        </div>
      )}
      {props.onSkip && (
        <button
          type="button"
          onClick={props.onSkip}
          className="mt-5 rounded-full bg-white/80 px-5 py-2 font-bold text-slate-700 text-sm shadow"
        >
          軽い表示ですぐ見る
        </button>
      )}
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

const CARD_STYLE = `
@keyframes gacha-card-in { 0% { opacity: 0; transform: translateY(18px) rotateY(90deg) scale(.9) } 60% { opacity: 1; transform: translateY(0) rotateY(-8deg) scale(1.03) } 100% { opacity: 1; transform: none } }
@keyframes gacha-card-glow { 0%, 100% { box-shadow: 0 0 10px 2px var(--glow) } 50% { box-shadow: 0 0 22px 6px var(--glow) } }
`

const GLOW: Partial<Record<GachaItem["rarity"], string>> = {
  SR: "rgba(167,139,250,.45)",
  SSR: "rgba(251,191,36,.7)",
  UR: "rgba(244,114,182,.8)",
}

/** カードを 1 枚ずつめくって並べる（3D を使わない軽い演出。読み込みは景品の絵だけ） */
function GachaResultList(props: { items: readonly GachaItem[] }) {
  // 低いレア度から順に出して、SSR・UR は最後に少し間をあける
  const order = props.items
    .map((item, index) => ({ item, index }))
    .sort(
      (a, b) =>
        gachaRarityRank(a.item.rarity) - gachaRarityRank(b.item.rarity) ||
        a.index - b.index,
    )
  const delayOf = new Map<string, number>()
  let delay = 0.2
  for (const { item } of order) {
    const rank = gachaRarityRank(item.rarity)
    delay += rank >= 3 ? 0.6 : 0.12
    delayOf.set(item.id, delay)
  }
  return (
    <div className="absolute inset-0 overflow-y-auto bg-gradient-to-b from-indigo-950 via-violet-950 to-slate-950 px-4 pt-12 pb-24">
      <style>{CARD_STYLE}</style>
      <div
        className="mx-auto grid max-w-xl grid-cols-3 gap-3 sm:grid-cols-5"
        style={{ perspective: "800px" }}
      >
        {props.items.map((item) => (
          <div
            key={item.id}
            className="rounded-xl bg-white/10 p-2 text-center"
            style={
              {
                opacity: 0,
                "--glow": GLOW[item.rarity] ?? "transparent",
                animation: `gacha-card-in .5s ${delayOf.get(item.id) ?? 0}s ease-out forwards${GLOW[item.rarity] && gachaRarityRank(item.rarity) >= 3 ? `, gacha-card-glow 1.6s ${(delayOf.get(item.id) ?? 0) + 0.5}s ease-in-out infinite` : ""}`,
              } as React.CSSProperties
            }
          >
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
