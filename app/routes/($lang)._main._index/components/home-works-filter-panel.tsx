import { ArrowDownWideNarrow } from "lucide-react"
import { Checkbox } from "~/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { useTranslation } from "~/hooks/use-translation"
import type { HomePageState } from "~/routes/($lang)._main._index/hooks/use-home-page-state"
import { toWorkTypeText } from "~/utils/work/to-work-type-text"

/**
 * 新着タブの絞り込み欄
 */
export function HomeWorksFilterPanel(
  props: Pick<
    HomePageState,
    | "handlePromptChange"
    | "handleSortTypeChange"
    | "handleTimeRangeChange"
    | "handleWorkTypeChange"
    | "isOneWorkPerUser"
    | "isPromptPublic"
    | "location"
    | "searchParams"
    | "setIsOneWorkPerUser"
    | "sortType"
    | "timeRange"
    | "updateQueryParams"
    | "workType"
  > & { checkboxId: string },
) {
  const t = useTranslation()
  const {
    checkboxId,
    handlePromptChange,
    handleSortTypeChange,
    handleTimeRangeChange,
    handleWorkTypeChange,
    isOneWorkPerUser,
    isPromptPublic,
    location,
    searchParams,
    setIsOneWorkPerUser,
    sortType,
    timeRange,
    updateQueryParams,
    workType,
  } = props

  return (
    <div className="space-y-2 rounded-2xl border bg-muted/30 p-3">
      {/* フィルター行1: 種類、プロンプト、ソート */}
      <div className="grid grid-cols-3 gap-2">
        {/* 種類 */}
        <Select
          value={workType ? workType : ""}
          onValueChange={handleWorkTypeChange}
        >
          <SelectTrigger
            className="h-8 w-full min-w-0 font-medium text-xs"
            aria-label={t("種類", "Type")}
          >
            <SelectValue
              placeholder={
                workType
                  ? toWorkTypeText({
                      type: workType,
                      lang: location,
                    })
                  : t("種類", "Type")
              }
            >
              {/* SSR 時も選択中の値を表示し、ハイドレーション後のレイアウトシフトを防ぐ */}
              {workType
                ? toWorkTypeText({
                    type: workType,
                    lang: location,
                  })
                : t("種類", "Type")}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t("種類", "Type")}</SelectItem>
            <SelectItem value="WORK">{t("画像", "Image")}</SelectItem>
            <SelectItem value="VIDEO">{t("動画", "Video")}</SelectItem>
            <SelectItem value="NOVEL">{t("小説", "Novel")}</SelectItem>
            <SelectItem value="COLUMN">{t("コラム", "Column")}</SelectItem>
          </SelectContent>
        </Select>

        {/* プロンプト有無 */}
        <Select
          value={
            isPromptPublic === null
              ? "ALL"
              : isPromptPublic
                ? "prompt"
                : "no-prompt"
          }
          onValueChange={handlePromptChange}
        >
          <SelectTrigger
            className="h-8 w-full min-w-0 font-medium text-xs"
            aria-label={t("プロンプト", "Prompt")}
          >
            <SelectValue
              placeholder={
                isPromptPublic === null
                  ? t("プロンプト", "Prompt")
                  : isPromptPublic
                    ? t("あり", "Yes")
                    : t("なし", "No")
              }
            >
              {isPromptPublic === null
                ? t("プロンプト", "Prompt")
                : isPromptPublic
                  ? t("あり", "Yes")
                  : t("なし", "No")}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t("プロンプト", "Prompt")}</SelectItem>
            <SelectItem value="prompt">{t("あり", "Yes")}</SelectItem>
            <SelectItem value="no-prompt">{t("なし", "No")}</SelectItem>
          </SelectContent>
        </Select>

        {/* ソート */}
        <Select
          value={sortType ? sortType : ""}
          onValueChange={handleSortTypeChange}
        >
          <SelectTrigger
            className="h-8 w-full min-w-0 font-medium text-xs"
            aria-label={t("並び順", "Sort")}
          >
            <ArrowDownWideNarrow className="h-3.5 w-3.5" />
            <SelectValue
              placeholder={sortType ? sortType : t("最新", "Latest")}
            >
              {sortType === "LIKES_COUNT"
                ? t("人気", "Popular")
                : sortType === "COMMENTS_COUNT"
                  ? t("コメント", "Comments")
                  : t("最新", "Latest")}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DATE_CREATED">{t("最新", "Latest")}</SelectItem>
            <SelectItem value="LIKES_COUNT">{t("人気", "Popular")}</SelectItem>
            <SelectItem value="COMMENTS_COUNT">
              {t("コメント", "Comments")}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* フィルター行2: 期間指定とチェックボックス */}
      <div className="flex flex-wrap items-center gap-2">
        {/* 左側: 期間指定とチェックボックス */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 期間指定 */}
          <Select value={timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger
              className="h-8 w-full font-medium text-xs sm:w-auto sm:min-w-[130px]"
              aria-label={t("期間", "Period")}
            >
              <SelectValue
                placeholder={
                  timeRange === "ALL" ? t("全期間", "All time") : timeRange
                }
              >
                {timeRange === "TODAY"
                  ? t("本日", "Today")
                  : timeRange === "YESTERDAY"
                    ? t("昨日", "Yesterday")
                    : timeRange === "WEEK"
                      ? t("週間", "Week")
                      : t("全期間", "All time")}
              </SelectValue>
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

          {/* ユーザー毎に1作品フィルター */}
          <div className="flex items-center gap-2 rounded-md border bg-background px-2 py-1.5">
            <Checkbox
              id={checkboxId}
              checked={isOneWorkPerUser}
              onCheckedChange={(checked) => {
                const newValue = checked === true
                setIsOneWorkPerUser(newValue)
                const newSearchParams = new URLSearchParams(searchParams)
                if (newValue) {
                  newSearchParams.set("isOneWorkPerUser", "true")
                } else {
                  newSearchParams.delete("isOneWorkPerUser")
                }
                updateQueryParams(newSearchParams)
              }}
            />
            <label
              htmlFor={checkboxId}
              className="cursor-pointer font-medium text-xs leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {t("ユーザー毎に1作品", "One work per user")}
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
