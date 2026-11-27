/**
 * クリエイター側の画面で、受け取った推しの報酬（円）を出す部品
 * 推す側の画面では使わない（推す側は「コインで応援」まで。円は受け取る側の報酬としてだけ出す）
 */
import { BanknoteIcon } from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { type CreatorRewardEarning, formatYen } from "~/lib/creator-rewards"
import { cn } from "~/lib/utils"

export function CreatorRewardBadge(props: {
  earning: CreatorRewardEarning
  className?: string
}) {
  const t = useTranslation()
  const label: Record<CreatorRewardEarning["status"], string> = {
    HOLDING: t("保留中", "on hold"),
    HELD: t("換金できる", "available"),
    IN_PAYOUT: t("手続き中", "processing"),
    PAID: t("振込済み", "paid"),
    REVERSED: t("取り消し", "reversed"),
  }
  const isReversed = props.earning.status === "REVERSED"
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-bold text-xs",
        isReversed
          ? "bg-muted text-muted-foreground line-through"
          : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
        props.className,
      )}
    >
      <BanknoteIcon className="size-3.5" />
      {t(
        `報酬 ${formatYen(props.earning.amountYen)}（${label[props.earning.status]}）`,
        `Reward ¥${Math.floor(props.earning.amountYen).toLocaleString()} (${label[props.earning.status]})`,
      )}
    </span>
  )
}

/** 報酬に参加していない人への案内（1 行） */
export function CreatorRewardsJoinHint(props: { className?: string }) {
  const t = useTranslation()
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl bg-emerald-500/10 px-3 py-2 text-sm ring-1 ring-emerald-500/30",
        props.className,
      )}
    >
      <BanknoteIcon className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
      <span className="min-w-0 flex-1">
        {t(
          "あなたへの推しのうち購入したプレミアムコインの分は、クリエイター報酬に参加すると銀行振込の報酬になります（R18・R18G の作品を公開していない人）。",
          "Join Creator Rewards to turn the purchased Premium Coin support you receive into bank-paid rewards (if you don't publish R18 / R18G works).",
        )}
      </span>
      <Link
        to="/settings/creator-rewards"
        className="shrink-0 font-bold text-emerald-700 underline underline-offset-2 dark:text-emerald-300"
      >
        {t("参加する", "Join")}
      </Link>
    </div>
  )
}
