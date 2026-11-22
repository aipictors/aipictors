import { CrownIcon } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Progress } from "~/components/ui/progress"
import { Link } from "~/lib/app/locale-router"
import { USER_MODEL_PLAN_LIMITS } from "~/lib/user-models/constants"
import { formatModelQuotaReset } from "~/lib/user-models/types"
import { cn } from "~/lib/utils"

type Props = {
  /** 今月登録した数 */
  used: number
  limit: number
  /** 枠が戻る日時（UNIX 秒） */
  resetsAt?: number
  planType: string | null
  /** 渡すと「プランを見る」で /plus に移らず、プランの案内（そのまま決済へ進める）を開く */
  onUpgrade?(): void
  className?: string
}

const planLabel = (planType: string | null): string => {
  if (planType === "LITE") return "LITE"
  if (planType === "STANDARD") return "STANDARD"
  if (planType === "PREMIUM") return "PREMIUM"
  return "無料プラン"
}

/**
 * 今月の登録数 / 上限 と、上限に達したときのプラン案内
 */
export function UserModelLimitCard(props: Props) {
  const isFull = props.limit > 0 && props.used >= props.limit
  const ratio =
    props.limit > 0 ? Math.min(100, (props.used / props.limit) * 100) : 0
  const canUpgrade = props.planType !== "PREMIUM"

  return (
    <div
      className={cn(
        "rounded-2xl border p-4",
        isFull && "border-amber-500/50 bg-amber-500/5",
        props.className,
      )}
    >
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-semibold text-sm">今月の登録数</p>
        <p className="text-sm tabular-nums">
          <span className="font-bold text-lg">{props.used}</span>
          <span className="text-muted-foreground"> / {props.limit}</span>
        </p>
      </div>
      <Progress value={ratio} className="mt-2 h-1.5" />
      <p className="mt-2 text-muted-foreground text-xs">
        {planLabel(props.planType)}は毎月 {props.limit} 個まで登録できます。枠は{" "}
        {formatModelQuotaReset(props.resetsAt)}{" "}
        に戻ります。登録したモデルは削除できません
      </p>
      {isFull && (
        <div className="mt-3 space-y-2">
          <p className="text-sm">
            今月の上限に達しています。{formatModelQuotaReset(props.resetsAt)}{" "}
            に枠が戻るか、プランを変更すると追加できます。
          </p>
          <p className="text-muted-foreground text-xs">
            {`1か月に登録できる数：無料 ${USER_MODEL_PLAN_LIMITS.FREE}個・ライト ${USER_MODEL_PLAN_LIMITS.LITE}個・スタンダード ${USER_MODEL_PLAN_LIMITS.STANDARD}個・プレミアム ${USER_MODEL_PLAN_LIMITS.PREMIUM}個`}
          </p>
          <div className="flex gap-2">
            {canUpgrade && props.onUpgrade && (
              <Button
                size="sm"
                className="rounded-full"
                onClick={props.onUpgrade}
              >
                <CrownIcon className="mr-1 size-4" />
                プランを上げて続ける
              </Button>
            )}
            {canUpgrade && !props.onUpgrade && (
              <Button asChild size="sm" className="rounded-full">
                <Link to="/plus">
                  <CrownIcon className="mr-1 size-4" />
                  プランを見る
                </Link>
              </Button>
            )}
            <Button
              asChild
              size="sm"
              variant="outline"
              className="rounded-full"
            >
              <Link to="/models/library?section=mine">自分のモデルを見る</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
