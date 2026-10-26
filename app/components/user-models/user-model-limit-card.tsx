import { Link } from "@remix-run/react"
import { CrownIcon } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Progress } from "~/components/ui/progress"
import { USER_MODEL_PLAN_LIMITS } from "~/lib/user-models/constants"
import { cn } from "~/lib/utils"

type Props = {
  used: number
  limit: number
  planType: string | null
  className?: string
}

const planLabel = (planType: string | null): string => {
  if (planType === "LITE") return "LITE"
  if (planType === "STANDARD") return "STANDARD"
  if (planType === "PREMIUM") return "PREMIUM"
  return "無料プラン"
}

/**
 * 登録数 / 上限 と、上限に達したときのプラン案内
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
        <p className="font-semibold text-sm">登録数</p>
        <p className="text-sm tabular-nums">
          <span className="font-bold text-lg">{props.used}</span>
          <span className="text-muted-foreground"> / {props.limit}</span>
        </p>
      </div>
      <Progress value={ratio} className="mt-2 h-1.5" />
      <p className="mt-2 text-muted-foreground text-xs">
        {planLabel(props.planType)}の上限は {props.limit} 個です
      </p>
      {isFull && (
        <div className="mt-3 space-y-2">
          <p className="text-sm">
            上限に達しています。不要なモデルを削除するか、プランを変更すると追加できます。
          </p>
          <p className="text-muted-foreground text-xs">
            無料 {USER_MODEL_PLAN_LIMITS.FREE} / LITE{" "}
            {USER_MODEL_PLAN_LIMITS.LITE} / STANDARD{" "}
            {USER_MODEL_PLAN_LIMITS.STANDARD} / PREMIUM{" "}
            {USER_MODEL_PLAN_LIMITS.PREMIUM}
          </p>
          <div className="flex gap-2">
            {canUpgrade && (
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
              <Link to="/settings/models">自分のモデルを整理</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
