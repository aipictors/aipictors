import { useEffect, useState } from "react"
import { GACHA_PRICES } from "~/components/gacha/gacha-rules"

const STYLE = `
@keyframes special-gacha-shine { 0% { transform: translateX(-120%) skewX(-20deg) } 60%, 100% { transform: translateX(260%) skewX(-20deg) } }
@keyframes special-gacha-float { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-4px) } }
`

/** 日本時間の次の 0:00 まで（ms） */
const toMsUntilJstMidnight = (now: number) => {
  const jst = now + 9 * 60 * 60 * 1000
  const day = 24 * 60 * 60 * 1000
  return day - (jst % day)
}

const formatCountdown = (ms: number) => {
  const total = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

/**
 * ガチャの看板（バナー画像の右の余白にタイトルと今日のお得を重ねる）。
 * お得な回が残っているときは、日付が変わるまでの残り時間を出す
 */
export function SpecialGachaHero(props: {
  isPremiumDealAvailable: boolean
  isFreeFirstAvailable: boolean
}) {
  const [remaining, setRemaining] = useState<number | null>(null)
  useEffect(() => {
    const tick = () => setRemaining(toMsUntilJstMidnight(Date.now()))
    tick()
    const timer = window.setInterval(tick, 1000)
    return () => window.clearInterval(timer)
  }, [])
  const hasDeal = props.isPremiumDealAvailable || props.isFreeFirstAvailable

  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#2a0f4f] shadow-[0_10px_40px_-10px_rgba(168,85,247,.7)]">
      <style>{STYLE}</style>
      <picture>
        <source
          media="(max-width: 640px)"
          srcSet="/images/gacha/special-gacha-banner.sm.webp"
        />
        <img
          src="/images/gacha/special-gacha-banner.webp"
          alt="スペシャル枠ガチャ"
          width={1584}
          height={672}
          className="aspect-[1584/672] w-full object-cover object-left"
        />
      </picture>
      {/* 光が走る */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-transparent via-white/40 to-transparent"
        style={{ animation: "special-gacha-shine 4.5s ease-in-out infinite" }}
      />
      <div className="flex flex-col gap-2 p-4 max-sm:items-start sm:absolute sm:inset-y-0 sm:right-0 sm:w-[46%] sm:items-end sm:justify-center sm:p-6 sm:text-right">
        <p className="font-bold text-[11px] text-fuchsia-700 tracking-[.2em] max-sm:text-fuchsia-200 sm:text-xs">
          SPECIAL FRAME GACHA
        </p>
        <h1 className="bg-gradient-to-r from-fuchsia-600 via-violet-600 to-sky-500 bg-clip-text font-black text-2xl text-transparent leading-tight max-sm:from-pink-200 max-sm:via-amber-100 max-sm:to-sky-200 sm:text-4xl">
          スペシャル枠ガチャ
        </h1>
        <p className="font-bold text-slate-700 text-xs max-sm:text-white/85 sm:text-sm">
          ここでしか手に入らないアイコン枠・ヘッダー枠
        </p>
        <div className="flex flex-wrap justify-end gap-1.5 max-sm:justify-start">
          <span
            className="rounded-full bg-gradient-to-r from-pink-500 to-orange-400 px-3 py-1 font-black text-white text-xs shadow-md"
            style={{
              animation: "special-gacha-float 2.4s ease-in-out infinite",
            }}
          >
            10 連は SR 以上 1 枠確定
          </span>
          <span className="rounded-full bg-white/90 px-3 py-1 font-black text-violet-700 text-xs shadow-md">
            200 回で好きな枠と交換
          </span>
        </div>
        {hasDeal && (
          <div className="rounded-2xl bg-white/90 px-3 py-2 text-left shadow-md">
            <p className="font-black text-pink-600 text-xs">
              🎁 今日のお得
              {remaining !== null && (
                <span className="ml-1 font-bold text-slate-500 tabular-nums">
                  残り {formatCountdown(remaining)}
                </span>
              )}
            </p>
            <ul className="mt-0.5 space-y-0.5 font-bold text-[11px] text-slate-700">
              {props.isPremiumDealAvailable && (
                <li>
                  10 連が半額 {GACHA_PRICES.premiumDailyTen.toLocaleString()}
                  <span className="ml-1 text-slate-400 line-through">
                    {GACHA_PRICES.premiumTen.toLocaleString()}
                  </span>
                </li>
              )}
              {props.isFreeFirstAvailable && (
                <li>フリーコイン {GACHA_PRICES.freeFirst} 枚で 1 回</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
