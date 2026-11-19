import { CheckIcon, EllipsisIcon } from "lucide-react"
import { Link } from "~/lib/app/locale-router"
import { Button } from "~/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import { SensitiveToggle } from "~/components/sensitive/sensitive-toggle"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import {
  AI_MODEL_WORKS_PER_PAGE,
  type AiModelWorksSearch,
  type AiModelWorksSort,
  toAiModelWorksQuery,
} from "~/routes/($lang)._main.models.$model/ai-model-works-page"

type Props = {
  /** /models/<名前> または /r/models/<名前> */
  basePath: string
  /** 年齢区分を広げる絞り込み（全年齢は R15、R18 は R18G） */
  moreRatingsKey: "r15" | "r18g"
  search: AiModelWorksSearch
  worksCount: number
  isSensitive: boolean
  name: string
}

/**
 * 並び替えと絞り込み（押すと URL が変わるので、共有・戻るでも同じ一覧になる）
 */
export function AiModelWorksToolbar(props: Props) {
  const t = useTranslation()

  // 条件を変えたら 1 ページ目に戻す（件数が変わって今のページがなくなることがある）
  const toPath = (change: Partial<AiModelWorksSearch>) =>
    `${props.basePath}${toAiModelWorksQuery(
      { ...props.search, page: 0, ...change },
      props.moreRatingsKey,
    )}`

  const sorts: { value: AiModelWorksSort; label: string }[] = [
    { value: "new", label: t("新着", "Newest") },
    { value: "likes", label: t("人気", "Popular") },
  ]

  const start = props.search.page * AI_MODEL_WORKS_PER_PAGE + 1
  const end = Math.min(
    (props.search.page + 1) * AI_MODEL_WORKS_PER_PAGE,
    props.worksCount,
  )

  const chipClassName =
    "inline-flex h-8 shrink-0 items-center gap-1 rounded-full border px-3 text-sm transition-colors"

  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div className="-mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1 md:pb-0">
        <div
          role="group"
          aria-label={t("並び順", "Sort")}
          className="flex shrink-0 rounded-full bg-muted p-0.5"
        >
          {sorts.map((sort) => (
            <Link
              key={sort.value}
              to={toPath({ sort: sort.value })}
              rel="nofollow"
              preventScrollReset
              aria-current={
                props.search.sort === sort.value ? "true" : undefined
              }
              className={cn(
                "rounded-full px-3 py-1 text-sm transition-colors",
                props.search.sort === sort.value
                  ? "bg-background font-semibold shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {sort.label}
            </Link>
          ))}
        </div>
        <Link
          to={toPath({ hasPrompt: !props.search.hasPrompt })}
          rel="nofollow"
          preventScrollReset
          aria-pressed={props.search.hasPrompt}
          className={cn(
            chipClassName,
            props.search.hasPrompt
              ? "border-primary bg-primary/10 font-semibold text-primary"
              : "hover:bg-muted",
          )}
        >
          {props.search.hasPrompt && <CheckIcon className="size-3.5" />}
          {t("プロンプト有", "With prompts")}
        </Link>
        <Link
          to={toPath({ isMoreRatings: !props.search.isMoreRatings })}
          rel="nofollow"
          preventScrollReset
          aria-pressed={props.search.isMoreRatings}
          className={cn(
            chipClassName,
            props.search.isMoreRatings
              ? "border-primary bg-primary/10 font-semibold text-primary"
              : "hover:bg-muted",
          )}
        >
          {props.search.isMoreRatings && <CheckIcon className="size-3.5" />}
          {props.moreRatingsKey === "r15"
            ? t("R15も表示", "Include R15")
            : t("R18Gも表示", "Include R18G")}
        </Link>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="size-8 shrink-0 rounded-full"
              aria-label={t("その他の表示設定", "More options")}
            >
              <EllipsisIcon className="size-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <SensitiveToggle
              variant="compact"
              targetUrl={
                props.isSensitive
                  ? `/models/${encodeURIComponent(props.name)}`
                  : `/r/models/${encodeURIComponent(props.name)}`
              }
            />
          </PopoverContent>
        </Popover>
      </div>
      {props.worksCount > 0 && start <= end && (
        <p className="shrink-0 text-muted-foreground text-xs md:text-sm">
          {t(
            `${props.worksCount.toLocaleString()}件中 ${start.toLocaleString()}〜${end.toLocaleString()}件目`,
            `${start.toLocaleString()}–${end.toLocaleString()} of ${props.worksCount.toLocaleString()}`,
          )}
        </p>
      )}
    </div>
  )
}
