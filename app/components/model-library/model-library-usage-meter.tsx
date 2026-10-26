import { Link } from "@remix-run/react"
import { cn } from "~/lib/utils"

const planName = (planType: string | null): string => {
  if (planType === "LITE") return "ライト"
  if (planType === "STANDARD") return "スタンダード"
  if (planType === "PREMIUM") return "プレミアム"
  return "無料プラン"
}

type Props = {
  used: number
  limit: number
  planType: string | null
  /**
   * サイドバー用の小さい表示
   */
  compact?: boolean
  linkTarget?: string
  className?: string
}

/**
 * 登録数の使用量（ドライブの容量表示のようなメーター）
 */
export function ModelLibraryUsageMeter(props: Props) {
  const ratio =
    props.limit > 0
      ? Math.min(1, props.used / props.limit)
      : props.used > 0
        ? 1
        : 0
  const isFull = props.limit > 0 && props.used >= props.limit
  const isNearFull = !isFull && props.limit > 0 && props.limit - props.used <= 1
  const canUpgrade = props.planType !== "PREMIUM"

  return (
    <div className={cn("space-y-2", props.className)}>
      <div
        className={cn(
          "h-1.5 overflow-hidden rounded-full bg-muted",
          props.compact ? "" : "h-2",
        )}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={props.limit}
        aria-valuenow={props.used}
        aria-label="モデルの登録数"
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width]",
            isFull
              ? "bg-destructive"
              : isNearFull
                ? "bg-amber-500"
                : "bg-primary",
          )}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <p
          className={cn(
            "text-muted-foreground tabular-nums",
            props.compact ? "text-xs" : "text-sm",
          )}
        >
          <span className="font-medium text-foreground">
            {props.used} / {props.limit} モデル
          </span>
          （{planName(props.planType)}）
        </p>
        {canUpgrade && (isFull || isNearFull) && (
          <Link
            to="/plus"
            target={props.linkTarget}
            className={cn(
              "font-medium text-xs hover:underline",
              isFull ? "text-destructive" : "text-primary",
            )}
          >
            プランを見る
          </Link>
        )}
      </div>
      {isFull && !props.compact && (
        <p className="text-muted-foreground text-xs">
          上限に達しています。使っていないモデルを削除するか、プランを変えると追加できます。
        </p>
      )}
    </div>
  )
}
