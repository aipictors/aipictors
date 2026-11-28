import { SlidersHorizontalIcon } from "lucide-react"
import { useContext, useState } from "react"
import {
  appFilterChipClassName,
  appPillRowClassName,
  appPillTabClassName,
} from "~/components/app/app-pill-tab"
import { Button } from "~/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "~/components/ui/drawer"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import type { SearchLoaderData } from "~/routes/($lang)._main.search/search-loader.server"
import {
  countActiveFilters,
  type SearchFilterChange,
  type SearchOrderFilter,
  type SearchPromptFilter,
  type SearchRatingFilter,
  type SearchStyleFilter,
} from "~/routes/($lang)._main.search/utils/search-filters"

type Draft = {
  rating: SearchRatingFilter
  style: SearchStyleFilter
  prompt: SearchPromptFilter
  isMine: boolean
}

/**
 * アプリと同じ並べ替えの丸いタブと「絞り込み」。
 * 絞り込み（年齢区分・画風・プロンプト・自分の作品）は下から出る画面で選び、「この条件で表示」でまとめて反映する
 */
export function SearchFilterBar(props: {
  data: SearchLoaderData
  navigateToSearch: (tagName?: string | null, next?: SearchFilterChange) => void
}) {
  const t = useTranslation()
  const authContext = useContext(AuthContext)
  const { data, navigateToSearch } = props
  const [isOpen, setIsOpen] = useState(false)

  const current: Draft = {
    rating: data.filters.rating,
    style: data.filters.style,
    prompt: data.filters.prompt,
    isMine: data.filters.userId !== null,
  }
  const [draft, setDraft] = useState<Draft>(current)

  // 画風・プロンプトはタグの一致で探すときだけ使える
  const isTagMode = data.mode !== "text"
  const defaultRating: SearchRatingFilter = data.isSensitiveMode ? "R18" : "G"
  const activeCount = countActiveFilters(data)

  const orders: [SearchOrderFilter, string][] = [
    ["popular", t("人気順", "Popular")],
    ["new", t("新しい順", "Newest")],
    ["old", t("古い順", "Oldest")],
  ]

  const open = () => {
    setDraft(current)
    setIsOpen(true)
  }

  const apply = () => {
    setIsOpen(false)
    navigateToSearch(data.searchQuery, {
      rating: draft.rating,
      style: draft.style,
      prompt: draft.prompt,
      userId: draft.isMine
        ? (data.filters.userId ?? authContext.userId ?? null)
        : null,
    })
  }

  const canFilterMine = Boolean(authContext.userId || data.filters.userId)

  return (
    <>
      <div className={cn("mb-4 items-center", appPillRowClassName)}>
        {orders.map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={data.filters.order === value}
            onClick={() => navigateToSearch(data.searchQuery, { order: value })}
            className={appPillTabClassName(data.filters.order === value)}
          >
            {label}
          </button>
        ))}
        <span aria-hidden className="mx-0.5 h-5 w-px shrink-0 bg-border" />
        <button
          type="button"
          onClick={open}
          aria-haspopup="dialog"
          className={cn(
            appFilterChipClassName(activeCount > 0),
            activeCount === 0 && "text-foreground",
          )}
        >
          <SlidersHorizontalIcon className="size-4" />
          {activeCount > 0
            ? t(`絞り込み ${activeCount}`, `Filters ${activeCount}`)
            : t("絞り込み", "Filters")}
        </button>
      </div>

      <Drawer
        open={isOpen}
        onOpenChange={setIsOpen}
        shouldScaleBackground={false}
      >
        <DrawerContent className="mx-auto max-h-[90dvh] w-full max-w-lg pb-[env(safe-area-inset-bottom)]">
          <div className="flex items-center justify-between px-5 pt-3">
            <DrawerTitle className="font-black text-xl">
              {t("絞り込み", "Filters")}
            </DrawerTitle>
            <button
              type="button"
              onClick={() =>
                setDraft({
                  rating: defaultRating,
                  style: "all",
                  prompt: "all",
                  isMine: false,
                })
              }
              className="h-10 px-2 font-semibold text-[#0170C8] text-sm dark:text-sky-400"
            >
              {t("リセット", "Reset")}
            </button>
          </div>
          <DrawerDescription className="sr-only">
            {t("検索結果の絞り込み", "Filter the search results")}
          </DrawerDescription>
          <div className="space-y-5 overflow-y-auto px-5 pt-4 pb-2">
            <ChoiceRow
              title={t("年齢区分", "Age rating")}
              values={[
                ["G", t("全年齢", "All ages")],
                ["R15", "R-15"],
                ["R18", "R-18"],
              ]}
              selected={draft.rating}
              onChange={(rating) => setDraft({ ...draft, rating })}
            />
            {isTagMode && (
              <ChoiceRow
                title={t("画風", "Style")}
                values={[
                  ["all", t("すべて", "All")],
                  ["ILLUSTRATION", t("AIイラスト", "AI illustration")],
                  ["REAL", t("AIフォト", "AI photo")],
                ]}
                selected={draft.style}
                onChange={(style) => setDraft({ ...draft, style })}
              />
            )}
            {isTagMode && (
              <ChoiceRow
                title={t("プロンプト", "Prompt")}
                values={[
                  ["all", t("すべて", "All")],
                  ["with", t("プロンプトあり", "With prompt")],
                  ["without", t("プロンプトなし", "Without prompt")],
                ]}
                selected={draft.prompt}
                onChange={(prompt) => setDraft({ ...draft, prompt })}
              />
            )}
            {canFilterMine && (
              <label className="flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-xl bg-muted px-4">
                <span className="font-bold text-sm">
                  {t("自分の作品だけ", "My works only")}
                </span>
                <input
                  type="checkbox"
                  checked={draft.isMine}
                  onChange={(event) =>
                    setDraft({ ...draft, isMine: event.target.checked })
                  }
                  className="size-5 accent-[#0170C8]"
                />
              </label>
            )}
          </div>
          <div className="px-5 pt-3 pb-5">
            <Button
              type="button"
              onClick={apply}
              className="h-12 w-full rounded-full font-extrabold text-base"
            >
              {t("この条件で表示", "Show results")}
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}

function ChoiceRow<T extends string>(props: {
  title: string
  values: [T, string][]
  selected: T
  onChange: (value: T) => void
}) {
  return (
    <section>
      <h3 className="mb-2 font-bold text-muted-foreground text-xs">
        {props.title}
      </h3>
      <div className="flex flex-wrap gap-2">
        {props.values.map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={props.selected === value}
            onClick={() => props.onChange(value)}
            className={appFilterChipClassName(props.selected === value)}
          >
            {label}
          </button>
        ))}
      </div>
    </section>
  )
}
