import { Link } from "~/lib/app/locale-router"
import {
  formatModelQuotaBytes,
  formatModelQuotaReset,
} from "~/lib/user-models/types"
import { cn } from "~/lib/utils"

const planName = (planType: string | null): string => {
  if (planType === "LITE") return "ライト"
  if (planType === "STANDARD") return "スタンダード"
  if (planType === "PREMIUM") return "プレミアム"
  return "無料プラン"
}

type Props = {
  /** 今月登録したファイルの合計サイズ（バイト） */
  used: number
  /** 今月登録できる合計サイズ（バイト） */
  limit: number
  /** 枠が戻る日時（UNIX 秒） */
  resetsAt?: number
  planType: string | null
  /**
   * サイドバー用の小さい表示
   */
  compact?: boolean
  linkTarget?: string
  className?: string
}

/**
 * 今月登録したモデルの合計サイズ（ドライブの容量表示のようなメーター）。枠は毎月 1 日に戻る
 */
export function ModelLibraryUsageMeter(props: Props) {
  const ratio =
    props.limit > 0
      ? Math.min(1, props.used / props.limit)
      : props.used > 0
        ? 1
        : 0
  const isFull = props.limit > 0 && props.used >= props.limit
  // 残りが 1 割を切ったら知らせる
  const isNearFull = !isFull && props.limit > 0 && ratio >= 0.9
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
        aria-label="今月のモデルの登録容量"
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
            今月 {formatModelQuotaBytes(props.used)} /{" "}
            {formatModelQuotaBytes(props.limit)}
          </span>
          （{planName(props.planType)}・{formatModelQuotaReset(props.resetsAt)}
          にリセット）
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
          今月の上限に達しています。{formatModelQuotaReset(props.resetsAt)}{" "}
          に枠が戻るか、プランを変えると追加できます。登録したモデルは削除できません。
        </p>
      )}
    </div>
  )
}
