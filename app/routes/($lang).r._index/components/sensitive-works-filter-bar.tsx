import { ArrowDownWideNarrow, ChevronDownIcon } from "lucide-react"
import { useState } from "react"
import { Button } from "~/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { useTranslation } from "~/hooks/use-translation"
import type { IntrospectionEnum } from "~/lib/introspection-enum"

type Props = {
  workType: IntrospectionEnum<"WorkType"> | null
  onChangeWorkType: (value: IntrospectionEnum<"WorkType"> | null) => void
  isPromptPublic: boolean | null
  onChangeIsPromptPublic: (value: boolean | null) => void
  sortType: IntrospectionEnum<"WorkOrderBy"> | null
  onChangeSortType: (value: IntrospectionEnum<"WorkOrderBy"> | null) => void
  /** 期間で絞れる一覧だけ渡す */
  timeRange?: string
  onChangeTimeRange?: (value: string) => void
  /** 表示の切り替え（詳細の中に出す） */
  children?: React.ReactNode
}

/**
 * 新着一覧の絞り込み
 * スマホでは作品が画面に入るように、よく使う並び順と期間だけを出して残りは畳む
 */
export function SensitiveWorksFilterBar(props: Props): React.ReactNode {
  const t = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)
  const onChangeTimeRange = props.onChangeTimeRange

  const activeCount =
    (props.workType !== null ? 1 : 0) + (props.isPromptPublic !== null ? 1 : 0)

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Select
          value={props.sortType ?? "DATE_CREATED"}
          onValueChange={(value) =>
            props.onChangeSortType(
              value === "DATE_CREATED"
                ? null
                : (value as IntrospectionEnum<"WorkOrderBy">),
            )
          }
        >
          <SelectTrigger
            className="h-9 w-auto min-w-[104px] gap-1 text-sm"
            aria-label={t("並び順", "Sort")}
          >
            <ArrowDownWideNarrow className="size-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DATE_CREATED">{t("最新", "Latest")}</SelectItem>
            <SelectItem value="LIKES_COUNT">
              {t("人気", "Most Liked")}
            </SelectItem>
            <SelectItem value="COMMENTS_COUNT">
              {t("コメント数", "Most Comments")}
            </SelectItem>
          </SelectContent>
        </Select>
        {onChangeTimeRange && (
          <Select
            value={props.timeRange ?? "ALL"}
            onValueChange={onChangeTimeRange}
          >
            <SelectTrigger
              className="h-9 w-auto min-w-[88px] text-sm"
              aria-label={t("期間", "Period")}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t("全期間", "All time")}</SelectItem>
              <SelectItem value="TODAY">{t("本日", "Today")}</SelectItem>
              <SelectItem value="YESTERDAY">
                {t("昨日", "Yesterday")}
              </SelectItem>
              <SelectItem value="WEEK">{t("週間", "Week")}</SelectItem>
            </SelectContent>
          </Select>
        )}
        <Button
          variant="secondary"
          size="sm"
          className="ml-auto h-9 gap-1"
          aria-expanded={isExpanded}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {t("詳細", "More")}
          {activeCount > 0 && ` (${activeCount})`}
          <ChevronDownIcon
            className={`size-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          />
        </Button>
      </div>
      {isExpanded && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg bg-muted/40 p-2">
          <Select
            value={props.workType ?? "ALL"}
            onValueChange={(value) =>
              props.onChangeWorkType(
                value === "ALL"
                  ? null
                  : (value as IntrospectionEnum<"WorkType">),
              )
            }
          >
            <SelectTrigger
              className="h-9 w-auto min-w-[96px] text-sm"
              aria-label={t("種類", "Type")}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">
                {t("すべての種類", "All types")}
              </SelectItem>
              <SelectItem value="WORK">{t("画像", "Images")}</SelectItem>
              <SelectItem value="VIDEO">{t("動画", "Videos")}</SelectItem>
              <SelectItem value="NOVEL">{t("小説", "Novels")}</SelectItem>
              <SelectItem value="COLUMN">{t("コラム", "Columns")}</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={
              props.isPromptPublic === null
                ? "ALL"
                : props.isPromptPublic
                  ? "prompt"
                  : "no-prompt"
            }
            onValueChange={(value) =>
              props.onChangeIsPromptPublic(
                value === "ALL" ? null : value === "prompt",
              )
            }
          >
            <SelectTrigger
              className="h-9 w-auto min-w-[120px] text-sm"
              aria-label={t("プロンプト", "Prompt")}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">
                {t("プロンプト：すべて", "Prompt: all")}
              </SelectItem>
              <SelectItem value="prompt">
                {t("プロンプトあり", "With prompt")}
              </SelectItem>
              <SelectItem value="no-prompt">
                {t("プロンプトなし", "Without prompt")}
              </SelectItem>
            </SelectContent>
          </Select>
          <div className="ml-auto">{props.children}</div>
        </div>
      )}
    </div>
  )
}
