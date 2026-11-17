import { ClockIcon, CrownIcon, LockIcon } from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"
import {
  type RetentionPlan,
  toRetentionPeriodLabel,
  toRetentionPlanLabel,
} from "~/routes/($lang).generation._index/utils/generation-retention"
import { trackGrowthEvent } from "~/utils/track-growth-event"

/**
 * 保存期限が近い画像の右上に出す「あと◯日」（左上は保存、左下は評価・投稿済みの印）
 */
export function GenerationRetentionExpiringChip(props: {
  daysLeft: number
  isCompact: boolean
}) {
  const t = useTranslation()
  return (
    <Link
      to="/plus"
      onClick={() => trackGrowthEvent("retention_click", "expiring")}
      title={t(
        "保存期限が近づいています。プランに入ると保存期間が延びます",
        "This image is nearing its storage limit. A plan keeps it longer",
      )}
      className={cn(
        "absolute top-1 right-1 z-10 flex items-center gap-0.5 rounded-full bg-amber-500/90 font-bold text-white shadow-sm backdrop-blur-sm",
        props.isCompact
          ? "px-1 py-0.5 text-[9px]"
          : "px-1.5 py-0.5 text-[10px]",
      )}
    >
      <ClockIcon className={props.isCompact ? "size-2.5" : "size-3"} />
      {t(`あと${props.daysLeft}日`, `${props.daysLeft}d left`)}
    </Link>
  )
}

/**
 * 保存期限を過ぎた画像に重ねる表示。画像はグレーにして、プランで戻せることを案内する
 */
export function GenerationRetentionExpiredOverlay(props: {
  /** 画像を消すまでの日数（0 はもう消す時期を過ぎている） */
  daysLeft: number
  restorePlan: RetentionPlan | null
  isCompact: boolean
  /** 下の履歴を押せるようにする（選択中や、プランで戻せないもの）。このときは案内だけ出す */
  isEditMode: boolean
}) {
  const t = useTranslation()
  const plan = props.restorePlan
  const planLabel = plan ? toRetentionPlanLabel(plan, t.isEnglish) : null

  return (
    <div
      className={cn(
        "absolute inset-0 z-10 flex flex-col items-center justify-center gap-1 rounded-md bg-black/45 p-1.5 text-center text-white",
        props.isEditMode && "pointer-events-none",
      )}
    >
      <span className="flex items-center gap-1 font-bold text-[11px] leading-tight">
        <LockIcon className="size-3.5 shrink-0" />
        {t("保存期限切れ", "Expired")}
      </span>
      {!props.isCompact && (
        <span className="text-[10px] leading-tight opacity-90">
          {props.daysLeft > 0
            ? t(
                `あと${props.daysLeft}日で画像を削除`,
                `Deleted in ${props.daysLeft} days`,
              )
            : t("まもなく画像を削除", "Will be deleted soon")}
        </span>
      )}
      {!props.isEditMode && plan && planLabel && (
        <Link
          to="/plus"
          onClick={() => trackGrowthEvent("retention_click", "expired")}
          title={t(
            `${planLabel}プラン（保存${toRetentionPeriodLabel(plan, false)}）に入ると、この画像が戻ります`,
            `Join ${planLabel} (kept for ${toRetentionPeriodLabel(plan, true)}) to bring this image back`,
          )}
          className={cn(
            "mt-0.5 flex items-center gap-1 rounded-full bg-linear-to-r from-amber-400 to-pink-500 font-bold text-white shadow-md transition-transform active:scale-95",
            props.isCompact
              ? "px-2 py-0.5 text-[10px]"
              : "px-3 py-1 text-[11px]",
          )}
        >
          <CrownIcon className="size-3 shrink-0" />
          {props.isCompact
            ? t("復活", "Restore")
            : t(`${planLabel}で復活`, `Restore with ${planLabel}`)}
        </Link>
      )}
      {!plan && !props.isCompact && (
        <span className="text-[10px] leading-tight opacity-90">
          {t("保護すると消えません", "Protect it to keep it")}
        </span>
      )}
    </div>
  )
}
