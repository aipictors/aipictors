import type { GachaRarity } from "~/components/gacha/gacha-direction"
import type { GachaPrize } from "~/components/gacha/gacha-prizes"

/** レア度の札の色 */
export const RARITY_BADGE: Record<GachaRarity, string> = {
  UR: "bg-gradient-to-r from-pink-400 via-amber-300 to-sky-400 text-slate-900",
  SSR: "bg-amber-400 text-slate-900",
  SR: "bg-violet-400 text-slate-900",
  R: "bg-sky-400 text-slate-900",
  N: "bg-slate-400 text-slate-900",
}

export const PRIZE_KIND_LABEL: Record<GachaPrize["kind"], string> = {
  ICON_FRAME: "アイコン枠",
  HEADER_FRAME: "ヘッダー枠",
}

export function RarityBadge(props: { rarity: GachaRarity }) {
  return (
    <span
      className={`inline-flex min-w-10 justify-center rounded-full px-2 py-0.5 font-bold text-xs ${RARITY_BADGE[props.rarity]}`}
    >
      {props.rarity}
    </span>
  )
}

/** 景品の絵。アイコン枠は丸いアイコンに重ね、ヘッダー枠は横長の台に重ねる */
export function PrizeThumbnail(props: {
  prize: GachaPrize
  size?: "sm" | "md"
}) {
  const isSmall = props.size === "sm"
  if (props.prize.kind === "HEADER_FRAME") {
    return (
      <div
        className={`relative shrink-0 overflow-hidden rounded-md bg-gradient-to-br from-slate-500 to-slate-700 ${isSmall ? "h-8 w-24" : "h-[68px] w-[204px]"}`}
      >
        <img
          src={props.prize.imageUrl}
          alt={props.prize.name}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    )
  }
  return (
    <div className={`relative shrink-0 ${isSmall ? "h-10 w-10" : "h-20 w-20"}`}>
      <div className="absolute inset-[17%] rounded-full bg-gradient-to-br from-slate-400 to-slate-600" />
      <img
        src={props.prize.imageUrl}
        alt={props.prize.name}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-contain"
      />
    </div>
  )
}

export const formatPercent = (value: number) => {
  if (value === 0) return "0%"
  if (value < 0.01) return `${value.toFixed(4)}%`
  if (value < 1) return `${value.toFixed(3)}%`
  return `${value.toFixed(2)}%`
}
