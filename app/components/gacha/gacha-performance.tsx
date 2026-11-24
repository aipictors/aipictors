import { useEffect, useMemo, useState } from "react"
import {
  type GachaDirection,
  type GachaItem,
  gachaRarityRank,
  planGachaDirection,
} from "~/components/gacha/gacha-direction"
import { GachaPerformance2D } from "~/components/gacha/gacha-performance-2d"
import {
  renderGachaShareImage,
  shareGachaResult,
} from "~/components/gacha/gacha-share"
import { gachaSound } from "~/components/gacha/gacha-sound"
import { cn } from "~/lib/utils"

type Props = {
  items: readonly GachaItem[]
  /** 渡さなければレア度から決める */
  direction?: GachaDirection
  onClose: () => void
  /** 結果の画面の「もう 1 回 / もう 10 連」。渡さなければ出さない */
  onDrawAgain?: (count: 1 | 10) => void
  /** 結果の画面でボタンの上に出すもの（天井のメーター・かけら・実績など） */
  resultExtra?: React.ReactNode
}

/**
 * ガチャ演出（全画面、2D）。景品の配列を渡すだけで、どのガチャにも使える。
 * 動きを減らす設定の人には、結果だけを出す
 */
export function GachaPerformance(props: Props): React.ReactNode {
  const direction = useMemo(
    () => props.direction ?? planGachaDirection(props.items),
    [props.direction, props.items],
  )
  const [state, setState] = useState<"playing" | "done" | "fallback">("playing")
  const [skipSignal, setSkipSignal] = useState(0)
  const [isMuted, setIsMuted] = useState(() => gachaSound.isMuted())

  useEffect(() => {
    setState(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "fallback"
        : "playing",
    )
  }, [props.items])

  const isDone = state === "done" || state === "fallback"

  return (
    <div className="fixed inset-0 z-[100] select-none overflow-hidden bg-black text-white">
      {state !== "fallback" && (
        <GachaPerformance2D
          items={props.items}
          direction={direction}
          skipSignal={skipSignal}
          bottomInset={props.resultExtra ? 260 : 176}
          onComplete={() => setState("done")}
        />
      )}
      {state === "fallback" && <GachaResultList items={props.items} />}
      <div className="absolute top-[max(12px,env(safe-area-inset-top))] right-3 flex gap-2">
        <button
          type="button"
          aria-label={isMuted ? "音を出す" : "音を消す"}
          className="rounded-full bg-black/40 px-3 py-1.5 font-bold text-sm backdrop-blur"
          onClick={() => {
            gachaSound.setMuted(!isMuted)
            setIsMuted(!isMuted)
          }}
        >
          {isMuted ? "🔇" : "🔊"}
        </button>
        {state === "playing" && (
          <button
            type="button"
            className="rounded-full bg-black/40 px-4 py-1.5 font-bold text-sm backdrop-blur"
            onClick={() => setSkipSignal((value) => value + 1)}
          >
            スキップ ≫
          </button>
        )}
      </div>
      {isDone && <GachaUniqueAnnouncement items={props.items} />}
      {isDone && (
        <GachaResultActions
          items={props.items}
          onClose={props.onClose}
          onDrawAgain={props.onDrawAgain}
          extra={props.resultExtra}
        />
      )}
    </div>
  )
}

const ACTION_STYLE = `
@keyframes gacha-actions-in { from { transform: translateY(110%) } to { transform: none } }
@keyframes gacha-again-pulse { 0%, 100% { transform: scale(1); box-shadow: 0 0 18px 4px rgba(255,190,60,.65), inset 0 -4px 0 rgba(0,0,0,.18) } 50% { transform: scale(1.04); box-shadow: 0 0 34px 10px rgba(255,120,200,.75), inset 0 -4px 0 rgba(0,0,0,.18) } }
@keyframes gacha-again-shine { from { transform: translateX(-120%) skewX(-20deg) } to { transform: translateX(320%) skewX(-20deg) } }
`

/** 結果の画面の下のボタン。暗い帯の上に大きく出して、背景の演出に埋もれないようにする */
function GachaResultActions(props: {
  items: readonly GachaItem[]
  onClose: () => void
  onDrawAgain?: (count: 1 | 10) => void
  extra?: React.ReactNode
}) {
  return (
    <div
      className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/85 to-transparent px-4 pt-10 pb-[max(16px,env(safe-area-inset-bottom))]"
      style={{
        animation: "gacha-actions-in .35s cubic-bezier(.2,1.2,.4,1) both",
      }}
    >
      <style>{ACTION_STYLE}</style>
      <div className="mx-auto flex max-w-md flex-col gap-2.5">
        {props.extra}
        {props.onDrawAgain && (
          <div className="flex gap-2.5">
            <button
              type="button"
              className="flex-1 rounded-2xl border-2 border-white bg-white py-3.5 font-black text-base text-violet-700 shadow-[inset_0_-4px_0_rgba(0,0,0,.12)] active:translate-y-0.5"
              onClick={() => props.onDrawAgain?.(1)}
            >
              もう 1 回
            </button>
            <button
              type="button"
              className="relative flex-[1.6] overflow-hidden rounded-2xl border-2 border-yellow-100 bg-gradient-to-r from-amber-300 via-orange-400 to-pink-500 py-3.5 font-black text-lg text-white active:translate-y-0.5"
              style={{
                animation: "gacha-again-pulse 1.2s ease-in-out infinite",
                textShadow: "0 2px 0 rgba(150,40,0,.55)",
              }}
              onClick={() => props.onDrawAgain?.(10)}
            >
              <span
                className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-white/45"
                style={{
                  animation: "gacha-again-shine 1.8s ease-in-out infinite",
                }}
              />
              <span className="relative">もう 10 連！</span>
            </button>
          </div>
        )}
        <div className="flex gap-2.5">
          <GachaShareButton items={props.items} />
          <button
            type="button"
            className="flex-1 rounded-2xl border-2 border-white/60 bg-white/10 py-3 font-bold text-base text-white"
            onClick={props.onClose}
          >
            閉じる
          </button>
        </div>
      </div>
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
      className="flex-1 rounded-2xl border-2 border-pink-200 bg-gradient-to-r from-pink-500 to-violet-500 py-3 font-bold text-base text-white disabled:opacity-60"
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

const RARITY_CLASS: Record<GachaItem["rarity"], string> = {
  N: "bg-zinc-500",
  R: "bg-gradient-to-r from-blue-500 to-blue-700",
  SR: "bg-gradient-to-r from-violet-400 to-violet-700",
  SSR: "bg-gradient-to-r from-amber-300 to-orange-500",
  UR: "bg-gradient-to-r from-pink-400 via-yellow-300 to-sky-400",
  UUR: "bg-gradient-to-r from-zinc-950 via-amber-700 to-zinc-950 text-amber-50 ring-1 ring-amber-200",
}

const CARD_STYLE = `
@keyframes gacha-card-in { 0% { opacity: 0; transform: translateY(18px) rotateY(90deg) scale(.9) } 60% { opacity: 1; transform: translateY(0) rotateY(-8deg) scale(1.03) } 100% { opacity: 1; transform: none } }
@keyframes gacha-card-glow { 0%, 100% { box-shadow: 0 0 10px 2px var(--glow) } 50% { box-shadow: 0 0 22px 6px var(--glow) } }
`

const GLOW: Partial<Record<GachaItem["rarity"], string>> = {
  SR: "rgba(167,139,250,.45)",
  SSR: "rgba(251,191,36,.7)",
  UR: "rgba(244,114,182,.8)",
  UUR: "rgba(255,244,208,.95)",
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

const ANNOUNCE_STYLE = `
@keyframes gacha-announce-in { 0% { transform: translateY(-120%) } 70% { transform: translateY(6%) } 100% { transform: none } }
@keyframes gacha-announce-sheen { from { background-position: 0% 50% } to { background-position: 200% 50% } }
@keyframes gacha-announce-ticker { from { transform: translateX(0) } to { transform: translateX(-50%) } }
`

/**
 * UUR を当てたときの全体告知風の帯（結果の画面の上、7 秒で引っ込む）。
 * 世界でひとりだけの枠なので、ガチャのページに名前が載ることもここで伝える
 */
function GachaUniqueAnnouncement(props: { items: readonly GachaItem[] }) {
  const won = props.items.filter((item) => item.rarity === "UUR")
  const [isOpen, setIsOpen] = useState(true)
  // カードの上に重なるので、しばらくしたら引っ込める（押しても閉じる）
  useEffect(() => {
    const timer = window.setTimeout(() => setIsOpen(false), 7000)
    return () => window.clearTimeout(timer)
  }, [])
  if (won.length === 0 || !isOpen) return null
  const names = won.map((item) => `「${item.name}」`).join("")
  const ticker = `世界でひとりだけの UUR ${names} を獲得しました　★　`
  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: 押すと閉じる（閉じなくても結果の操作はできる）
    // biome-ignore lint/a11y/noStaticElementInteractions: 同上
    <div
      className="absolute inset-x-0 top-0 z-[5] px-3 pt-[max(52px,calc(env(safe-area-inset-top)+44px))]"
      style={{
        animation: "gacha-announce-in .7s cubic-bezier(.2,1.3,.4,1) both",
      }}
      onClick={() => setIsOpen(false)}
    >
      <style>{ANNOUNCE_STYLE}</style>
      <div
        className="mx-auto max-w-xl overflow-hidden rounded-2xl p-[2px] shadow-[0_0_40px_rgba(253,230,138,.55)]"
        style={{
          background:
            "linear-gradient(110deg,#f8e7a8,#ffffff,#a5f3fc,#f0abfc,#f8e7a8)",
          backgroundSize: "200% 100%",
          animation: "gacha-announce-sheen 3s linear infinite",
        }}
      >
        <div className="rounded-[14px] bg-[#07060d]/95 px-4 py-3 text-center">
          <div className="flex items-center justify-center gap-2 font-black text-[11px] text-amber-200 tracking-widest">
            <span aria-hidden>📣</span>
            全体のお知らせ
          </div>
          <p className="mt-1 font-black text-base leading-snug sm:text-lg">
            世界でひとりだけの UUR
            <br />
            <span className="bg-gradient-to-r from-amber-100 via-white to-amber-200 bg-clip-text text-transparent">
              {names}
            </span>
            があなたのものになりました
          </p>
          <p className="mt-1 text-[11px] text-white/70">
            ガチャのページに獲得者として名前が載ります
          </p>
          <div className="mt-2 overflow-hidden whitespace-nowrap border-amber-200/30 border-t pt-1.5 font-bold text-[11px] text-amber-100/80">
            <div
              className="inline-block"
              style={{ animation: "gacha-announce-ticker 9s linear infinite" }}
            >
              {ticker.repeat(4)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
