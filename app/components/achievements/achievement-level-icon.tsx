import { useId } from "react"
import type { AchievementLevelTier } from "~/lib/achievements/achievement-level-tier"

type Props = {
  tier: AchievementLevelTier
  size?: number
  className?: string
}

/**
 * 実績レベルの段階の印（若葉 → 盾 → 宝石 → 王冠。色で同じ形の中の段階を分ける）
 */
export function AchievementLevelIcon(props: Props) {
  const id = useId()
  const size = props.size ?? 18
  const [top, bottom] = props.tier.colors
  const fill = `url(#${id}-fill)`
  const outline = "rgba(0,0,0,0.28)"

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      aria-hidden="true"
      className={props.className}
    >
      <defs>
        <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={top} />
          <stop offset="100%" stopColor={bottom} />
        </linearGradient>
      </defs>
      {props.tier.shape === "sprout" && (
        <>
          <path
            d="M10 18V10"
            stroke={bottom}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M10 11C10 6.5 6.5 4 2.5 4.5C2.5 9 5.5 11.5 10 11Z"
            fill={fill}
            stroke={outline}
            strokeWidth="0.6"
          />
          <path
            d="M10 9.5C10 5.5 13 2.5 17.5 2.5C17.5 7 14.5 9.8 10 9.5Z"
            fill={fill}
            stroke={outline}
            strokeWidth="0.6"
          />
        </>
      )}
      {props.tier.shape === "shield" && (
        <>
          <path
            d="M10 1.5L17 4.2V9.5C17 14 13.8 17 10 18.5C6.2 17 3 14 3 9.5V4.2L10 1.5Z"
            fill={fill}
            stroke={outline}
            strokeWidth="0.7"
          />
          <path
            d="M10 5.5L11.2 8.3L14.2 8.5L11.9 10.4L12.6 13.3L10 11.7L7.4 13.3L8.1 10.4L5.8 8.5L8.8 8.3Z"
            fill="#fff"
            fillOpacity="0.9"
          />
        </>
      )}
      {props.tier.shape === "gem" && (
        <>
          <path
            d="M5.5 3H14.5L18.5 7.5L10 18L1.5 7.5L5.5 3Z"
            fill={fill}
            stroke={outline}
            strokeWidth="0.7"
          />
          <path
            d="M1.5 7.5H18.5M5.5 3L7.5 7.5L10 18M14.5 3L12.5 7.5L10 18M7.5 7.5L10 3L12.5 7.5"
            fill="none"
            stroke="#fff"
            strokeOpacity="0.6"
            strokeWidth="0.7"
          />
          <path d="M5.5 3H10L7.5 7.5H1.5Z" fill="#fff" fillOpacity="0.35" />
        </>
      )}
      {props.tier.shape === "crown" && (
        <>
          <path
            d="M2 6L6 9.5L10 3L14 9.5L18 6L16.5 15H3.5L2 6Z"
            fill={fill}
            stroke={outline}
            strokeWidth="0.7"
            strokeLinejoin="round"
          />
          <rect
            x="3.5"
            y="15.5"
            width="13"
            height="2.5"
            rx="0.8"
            fill={fill}
            stroke={outline}
            strokeWidth="0.6"
          />
          <circle cx="10" cy="11.2" r="1.6" fill="#fff" fillOpacity="0.9" />
          <circle cx="2" cy="6" r="1.1" fill={top} />
          <circle cx="10" cy="3" r="1.1" fill={top} />
          <circle cx="18" cy="6" r="1.1" fill={top} />
        </>
      )}
    </svg>
  )
}
