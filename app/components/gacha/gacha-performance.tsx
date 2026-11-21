import { useEffect, useMemo, useRef, useState } from "react"
import {
  type GachaDirection,
  type GachaItem,
  planGachaDirection,
} from "~/components/gacha/gacha-direction"
import type { GachaStage } from "~/components/gacha/gacha-stage.client"
import { cn } from "~/lib/utils"

const MODEL_URL = "/images/pictor-chan/pictor-chan-3d-v4.glb"

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
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stageRef = useRef<GachaStage | null>(null)
  const direction = useMemo(
    () => props.direction ?? planGachaDirection(props.items),
    [props.direction, props.items],
  )
  const [state, setState] = useState<
    "loading" | "playing" | "done" | "fallback"
  >("loading")

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setState("fallback")
      return
    }
    let cancelled = false
    void (async () => {
      try {
        const { createGachaStage } = await import(
          "~/components/gacha/gacha-stage.client"
        )
        const stage = await createGachaStage({
          canvas,
          modelUrl: MODEL_URL,
          items: props.items,
          direction,
          onComplete: () => setState("done"),
        })
        if (cancelled) {
          stage.dispose()
          return
        }
        stageRef.current = stage
        setState("playing")
      } catch {
        if (!cancelled) setState("fallback")
      }
    })()
    return () => {
      cancelled = true
      stageRef.current?.dispose()
      stageRef.current = null
    }
  }, [props.items, direction])

  return (
    <div className="fixed inset-0 z-[100] select-none bg-black text-white">
      <canvas
        ref={canvasRef}
        className={cn(
          "h-full w-full touch-none",
          state === "fallback" && "hidden",
        )}
        onPointerUp={() => stageRef.current?.tap()}
      />
      {state === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center text-sm opacity-80">
          準備しています…
        </div>
      )}
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
