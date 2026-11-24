import type { GachaPityProgress } from "~/components/gacha/gacha-lottery"
import { cn } from "~/lib/utils"

const STYLE = `
@keyframes gacha-pity-flow { from { background-position: 0 0 } to { background-position: 40px 0 } }
@keyframes gacha-pity-near { 0%, 100% { box-shadow: 0 0 0 0 rgba(255,140,200,.0) } 50% { box-shadow: 0 0 14px 3px rgba(255,140,200,.7) } }
`

/**
 * 天井（交換 pt）のメーター。「あと何回で好きな景品（UUR 以外）と交換できるか」をいちばん大きく出し、
 * しくみ（1 回で 1 pt・UR が出ても減らない）を 1 行で添える
 */
export function GachaPityMeter(props: {
  progress: GachaPityProgress
  /** 結果の画面など狭いところ用（説明の行を出さない） */
  compact?: boolean
  className?: string
}) {
  const { progress } = props
  if (progress.isOff) return null
  const isNear = progress.reachesInTen || progress.canExchange
  if (props.compact) {
    // 結果の画面用: 1 行の文字と細いバーだけ
    return (
      <div className={cn("text-white", props.className)}>
        <style>{STYLE}</style>
        <div className="flex items-baseline justify-between gap-2 text-xs">
          <span className="font-bold">
            {isNear ? (
              <span className="bg-gradient-to-r from-pink-300 via-amber-200 to-sky-300 bg-clip-text text-transparent">
                {progress.canExchange
                  ? "好きな景品（UUR 以外）と交換できます！"
                  : progress.remaining === 1
                    ? "次の 1 回で好きな景品（UUR 以外）と交換！"
                    : `あと ${progress.remaining} 回で好きな景品（UUR 以外）と交換！`}
              </span>
            ) : (
              <>
                好きな景品（UUR 以外）と交換まで あと{" "}
                <span className="font-black text-amber-200 text-sm tabular-nums">
                  {progress.remaining}
                </span>{" "}
                回
              </>
            )}
          </span>
          <span className="text-[10px] text-white/60 tabular-nums">
            {progress.count} / {progress.pityCount}
          </span>
        </div>
        <PityBar ratio={progress.ratio} className="mt-1 h-1.5" />
      </div>
    )
  }
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/15 bg-white/5 p-3 text-white",
        isNear && "border-pink-300/70",
        props.className,
      )}
      style={
        isNear ? { animation: "gacha-pity-near 1.6s infinite" } : undefined
      }
    >
      <style>{STYLE}</style>
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-bold text-sm">
          {isNear ? (
            <span className="bg-gradient-to-r from-pink-300 via-amber-200 to-sky-300 bg-clip-text text-transparent">
              {progress.canExchange
                ? "交換 pt がたまりました！好きな景品（UUR 以外。UR も）と交換できます"
                : progress.remaining === 1
                  ? "次の 1 回で好きな景品（UUR 以外）と交換できます！"
                  : `あと ${progress.remaining} 回で交換！次の 10 連で届きます`}
            </span>
          ) : (
            <>
              好きな景品（UUR 以外）と交換まで あと{" "}
              <span className="font-black text-amber-200 text-lg tabular-nums">
                {progress.remaining}
              </span>{" "}
              回
            </>
          )}
        </span>
        <span className="shrink-0 text-white/60 text-xs tabular-nums">
          {progress.count} / {progress.pityCount}
        </span>
      </div>
      <PityBar ratio={progress.ratio} className="mt-2 h-3" />
      <p className="mt-2 text-[11px] text-white/65 leading-relaxed">
        1 回引くごとに交換 pt が 1 たまり、{progress.pityCount} pt
        でラインナップの中から好きな景品（UUR 以外。UR も）を 1
        つ選んでもらえます。UR が出ても pt
        は減りません。フリーコインで引いた分も 10 連もたまります。
      </p>
    </div>
  )
}

function PityBar(props: { ratio: number; className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-full bg-white/10",
        props.className,
      )}
    >
      <div
        className="h-full rounded-full transition-[width] duration-700"
        style={{
          width: `${Math.max(2, props.ratio * 100)}%`,
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(255,255,255,.25) 0 10px, transparent 10px 20px), linear-gradient(90deg, #38bdf8, #a78bfa, #f472b6)",
          animation: "gacha-pity-flow 1s linear infinite",
        }}
      />
    </div>
  )
}
