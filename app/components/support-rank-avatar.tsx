/**
 * 推し・貢献度ランキング用アバター
 * - 1〜3位: 指定のフレーム画像をアバター上に重ねる
 * - 4位以降: グレー丸バッジ（白数字）をアバター左下に表示
 */

import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

const RANK_FRAME_URLS: Record<1 | 2 | 3, string> = {
  1: "https://assets.aipictors.com/1st-frame.png",
  2: "https://assets.aipictors.com/2st-frame.png",
  3: "https://assets.aipictors.com/3st-frame.png",
}

type Size = "sm" | "md" | "lg"

type Props = {
  rank: number
  iconUrl?: string | null
  name?: string
  size?: Size
}

const SIZE_CLASS: Record<Size, string> = {
  sm: "h-10 w-10",
  md: "h-14 w-14",
  lg: "h-20 w-20",
}

const SIZE_PX: Record<Size, number> = {
  sm: 40,
  md: 56,
  lg: 80,
}

const BADGE_SIZE_CLASS: Record<Size, string> = {
  sm: "h-4 w-4 text-[10px]",
  md: "h-5 w-5 text-xs",
  lg: "h-6 w-6 text-xs",
}

export function SupportRankAvatar({
  rank,
  iconUrl,
  name = "",
  size = "md",
}: Props) {
  const frameUrl =
    rank >= 1 && rank <= 3 ? RANK_FRAME_URLS[rank as 1 | 2 | 3] : null
  const px = SIZE_PX[size]

  return (
    <div className="relative inline-block">
      {/* アバター本体 */}
      <div className={`${SIZE_CLASS[size]} relative shrink-0`}>
        <img
          src={withIconUrlFallback(iconUrl)}
          alt={name || `rank-${rank}`}
          width={px}
          height={px}
          loading="lazy"
          decoding="async"
          className="h-full w-full rounded-full object-cover"
        />
        {/* 1〜3位フレーム */}
        {frameUrl && (
          <img
            src={frameUrl}
            alt={`${rank}位フレーム`}
            width={px}
            height={px}
            loading="eager"
            decoding="async"
            className="pointer-events-none absolute inset-0 h-full w-full object-contain"
          />
        )}
      </div>

      {/* 4位以降の順位バッジ（アバター左下） */}
      {rank > 3 && (
        <span
          className={`absolute bottom-0 left-0 flex items-center justify-center rounded-full bg-gray-500 font-bold text-white ${BADGE_SIZE_CLASS[size]}`}
        >
          {rank}
        </span>
      )}
    </div>
  )
}
