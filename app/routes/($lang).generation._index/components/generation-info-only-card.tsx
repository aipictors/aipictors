import { CrownIcon, FileTextIcon, RotateCcwIcon } from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"
import { useApplyGenerationInfo } from "~/routes/($lang).generation._index/hooks/use-apply-generation-info"
import {
  type GenerationInfoSource,
  toGenerationInfoEntry,
} from "~/routes/($lang).generation._index/utils/generation-info-file"
import { trackGrowthEvent } from "~/utils/track-growth-event"

/**
 * 保存期間を過ぎて画像を消した履歴。生成情報（プロンプト・モデル・設定）は残っているので、同じ設定で作り直せる
 */
export function GenerationInfoOnlyCard(props: {
  task: GenerationInfoSource
  isCompact: boolean
}) {
  const t = useTranslation()
  const apply = useApplyGenerationInfo()
  const entry = toGenerationInfoEntry(props.task)
  const date = props.task.completedAt
    ? new Date(props.task.completedAt * 1000).toLocaleDateString(
        t.isEnglish ? "en-US" : "ja-JP",
        { timeZone: "Asia/Tokyo" },
      )
    : null

  return (
    <div
      className={cn(
        "flex h-full flex-col gap-1 overflow-hidden rounded-md border border-dashed bg-muted/40 text-left",
        props.isCompact ? "p-1.5" : "p-2.5",
      )}
    >
      <p className="flex items-center gap-1 font-semibold text-[10px] text-muted-foreground">
        <FileTextIcon className="size-3 shrink-0" />
        <span className="truncate">{t("生成情報のみ", "Info only")}</span>
        {date && <span className="ml-auto shrink-0 font-normal">{date}</span>}
      </p>
      {!props.isCompact && entry?.model.name && (
        <p className="truncate font-medium text-[11px]">{entry.model.name}</p>
      )}
      <p
        className={cn(
          "min-h-0 flex-1 break-all text-[10px] text-muted-foreground leading-snug",
          props.isCompact ? "line-clamp-2" : "line-clamp-4",
        )}
      >
        {entry?.prompt || t("（プロンプトなし）", "(no prompt)")}
      </p>
      <div className="flex items-center gap-1">
        {entry && (
          <button
            type="button"
            onClick={() => apply(entry)}
            title={t("この設定を生成画面に戻す", "Use these settings")}
            className="flex min-w-0 items-center gap-1 rounded-full bg-background px-2 py-1 font-medium text-[10px] shadow-sm transition-colors hover:bg-muted active:scale-95"
          >
            <RotateCcwIcon className="size-3 shrink-0" />
            {!props.isCompact && (
              <span className="truncate">{t("設定を復元", "Reuse")}</span>
            )}
          </button>
        )}
        <Link
          to="/plus"
          onClick={() => trackGrowthEvent("retention_click", "info_only")}
          title={t(
            "プランに入ると画像を長く保存できます",
            "A plan keeps your images longer",
          )}
          className="ml-auto flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-1 font-medium text-[10px] text-amber-600 hover:underline dark:text-amber-400"
        >
          <CrownIcon className="size-3" />
          {!props.isCompact && t("長く保存", "Keep longer")}
        </Link>
      </div>
    </div>
  )
}
