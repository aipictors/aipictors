import { CrownIcon } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Progress } from "~/components/ui/progress"
import { Link } from "~/lib/app/locale-router"
import { USER_MODEL_PLAN_LIMITS } from "~/lib/user-models/constants"
import {
  formatModelQuotaBytes,
  formatModelQuotaReset,
} from "~/lib/user-models/types"
import { cn } from "~/lib/utils"

type Props = {
  /** 今月登録したファイルの合計サイズ（バイト） */
  used: number
  /** 今月登録できる合計サイズ（バイト） */
  limit: number
  /** 選んでいるファイルのサイズ（バイト）。残りより大きいと上限の案内を出す */
  fileBytes?: number
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
 * 今月の登録容量 / 上限 と、上限に達したとき（選んだファイルが残りに収まらないとき）のプラン案内
 */
export function UserModelLimitCard(props: Props) {
  const remaining = Math.max(0, props.limit - props.used)
  const isFull =
    props.limit > 0 &&
    (props.used >= props.limit ||
      (props.fileBytes !== undefined && props.fileBytes > remaining))
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
        <p className="font-semibold text-sm">今月の登録容量</p>
        <p className="text-sm tabular-nums">
          <span className="font-bold text-lg">
            {formatModelQuotaBytes(props.used)}
          </span>
          <span className="text-muted-foreground">
            {" "}
            / {formatModelQuotaBytes(props.limit)}
          </span>
        </p>
      </div>
      <Progress value={ratio} className="mt-2 h-1.5" />
      <p className="mt-2 text-muted-foreground text-xs">
        {planLabel(props.planType)}は毎月合計{" "}
        {formatModelQuotaBytes(props.limit)}{" "}
        まで登録できます（個数は無制限・残り {formatModelQuotaBytes(remaining)}
        ）。枠は {formatModelQuotaReset(props.resetsAt)}{" "}
        に戻ります。登録したモデルは削除できません
      </p>
      {isFull && (
        <div className="mt-3 space-y-2">
          <p className="text-sm">
            {props.used < props.limit && props.fileBytes !== undefined
              ? `このファイル（${formatModelQuotaBytes(props.fileBytes)}）は今月の残り容量に収まりません。`
              : "今月の上限に達しています。"}
            {formatModelQuotaReset(props.resetsAt)}{" "}
            に枠が戻るか、プランを変更すると追加できます。
          </p>
          <p className="text-muted-foreground text-xs">
            {`1か月に登録できる容量：無料 ${USER_MODEL_PLAN_LIMITS.FREE}GB・ライト ${USER_MODEL_PLAN_LIMITS.LITE}GB・スタンダード ${USER_MODEL_PLAN_LIMITS.STANDARD}GB・プレミアム ${USER_MODEL_PLAN_LIMITS.PREMIUM}GB`}
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
