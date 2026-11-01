import { LockIcon } from "lucide-react"
import { useRef } from "react"
import { toAchievementBadgeUrl } from "~/lib/achievements/achievement-ui"
import { cn } from "~/lib/utils"

type Props = {
  achievementKey: string
  name: string
  tier: number
  isHidden: boolean
  isUnlocked: boolean
  /** 表示の大きさ（px） */
  size?: number
  /** マウスに合わせて傾け、光を動かす（詳細の大きな表示など） */
  isInteractive?: boolean
  className?: string
}

/**
 * 実績のバッジ
 * 未達成は色を抜いて鍵を付ける。レジェンドは虹色の光をかぶせる
 */
export function AchievementBadge(props: Props) {
  const size = props.size ?? 64
  const ref = useRef<HTMLDivElement>(null)

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!props.isInteractive || ref.current === null) return
    const rect = ref.current.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width
    const y = (event.clientY - rect.top) / rect.height
    ref.current.style.setProperty("--badge-rx", `${(0.5 - y) * 22}deg`)
    ref.current.style.setProperty("--badge-ry", `${(x - 0.5) * 22}deg`)
    ref.current.style.setProperty("--badge-gx", `${x * 100}%`)
    ref.current.style.setProperty("--badge-gy", `${y * 100}%`)
  }

  const onPointerLeave = () => {
    if (ref.current === null) return
    ref.current.style.setProperty("--badge-rx", "0deg")
    ref.current.style.setProperty("--badge-ry", "0deg")
  }

  const isLegend = props.tier >= 6 && props.isUnlocked

  return (
    <div
      ref={ref}
      className={cn(
        "achievement-badge relative inline-block shrink-0",
        props.isInteractive && "achievement-badge-interactive",
        props.className,
      )}
      style={{ width: size, height: size }}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <div className="achievement-badge-inner relative h-full w-full">
        <img
          src={toAchievementBadgeUrl({
            key: props.achievementKey,
            isHidden: props.isHidden,
            isUnlocked: props.isUnlocked,
          })}
          alt={props.name}
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          draggable={false}
          className={cn(
            "h-full w-full select-none",
            !props.isUnlocked &&
              !props.isHidden &&
              "opacity-45 brightness-95 grayscale",
            props.isUnlocked && "drop-shadow-md",
          )}
        />
        {props.isUnlocked && props.isInteractive && (
          <div
            aria-hidden
            className="achievement-badge-glare pointer-events-none absolute inset-[8%] rounded-full"
          />
        )}
        {isLegend && (
          <div
            aria-hidden
            className="achievement-badge-holo pointer-events-none absolute inset-[10%] rounded-full"
          />
        )}
      </div>
      {!props.isUnlocked && !props.isHidden && size >= 40 && (
        <span
          aria-hidden
          className="absolute right-[6%] bottom-[6%] flex items-center justify-center rounded-full bg-background/90 p-[3px] shadow ring-1 ring-border"
        >
          <LockIcon
            className="text-muted-foreground"
            style={{ width: size * 0.16, height: size * 0.16 }}
          />
        </span>
      )}
    </div>
  )
}
