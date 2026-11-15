import { CrownIcon } from "lucide-react"
import { cn } from "~/lib/utils"

/**
 * 1〜3 位の色（アプリの RankBadge と同じ金・銀・銅）
 */
export const RANK_MEDAL_STYLES = {
  1: {
    badge: "bg-gradient-to-br from-[#FFE08A] to-[#E2A21B] shadow-[#E2A21B]/50",
    crown: "fill-[#F5C542] text-[#C98A0C]",
    ring: "ring-[#E2A21B]",
    glow: "shadow-[0_10px_28px_-6px_rgba(226,162,27,0.55)]",
  },
  2: {
    badge: "bg-gradient-to-br from-[#F1F3F5] to-[#9AA5B1] shadow-[#9AA5B1]/50",
    crown: "fill-[#D5DBE1] text-[#8792A0]",
    ring: "ring-[#AAB4BF]",
    glow: "shadow-[0_8px_22px_-8px_rgba(110,120,135,0.5)]",
  },
  3: {
    badge: "bg-gradient-to-br from-[#F4C29A] to-[#B4693A] shadow-[#B4693A]/50",
    crown: "fill-[#E7A574] text-[#A35A2C]",
    ring: "ring-[#C98656]",
    glow: "shadow-[0_8px_22px_-8px_rgba(180,105,58,0.5)]",
  },
} as const

export const isMedalRank = (rank: number): rank is 1 | 2 | 3 =>
  rank === 1 || rank === 2 || rank === 3

/**
 * 王冠（1〜3 位だけ）
 */
export function RankCrown(props: { rank: number; className?: string }) {
  if (!isMedalRank(props.rank)) return null
  return (
    <CrownIcon
      aria-hidden
      strokeWidth={1.75}
      className={cn(
        "drop-shadow-sm",
        RANK_MEDAL_STYLES[props.rank].crown,
        props.className,
      )}
    />
  )
}

/**
 * 順位の丸いしるし（1〜3 位は金・銀・銅、4 位以下は黒の半透明）
 */
export function RankMedalBadge(props: { rank: number; className?: string }) {
  const isMedal = isMedalRank(props.rank)
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-black text-white tabular-nums leading-none",
        isMedal
          ? cn(
              "size-9 border-2 border-white text-base shadow-md [text-shadow:0_1px_2px_rgba(0,0,0,0.25)] dark:border-zinc-900",
              RANK_MEDAL_STYLES[props.rank as 1 | 2 | 3].badge,
            )
          : "h-7 min-w-7 bg-black/60 px-2 text-sm",
        props.className,
      )}
    >
      {props.rank}
    </span>
  )
}
