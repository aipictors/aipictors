import { useSearchParams } from "@remix-run/react"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import type { SearchType } from "~/routes/($lang)._main.search/utils/search-filters"

/**
 * 検索した言葉で「作品」「ユーザー」「タグ」のどれを見るかの切り替え（アプリの検索と同じ）
 */
export function SearchTypeTabs(props: { type: SearchType }) {
  const t = useTranslation()
  const [, setSearchParams] = useSearchParams()

  const tabs = [
    ["works", t("作品", "Works")],
    ["users", t("ユーザー", "Users")],
    ["tags", t("タグ", "Tags")],
  ] as const

  return (
    <div
      role="tablist"
      aria-label={t("検索する対象", "Search for")}
      className="mb-6 flex border-b"
    >
      {tabs.map(([type, label]) => (
        <button
          key={type}
          type="button"
          role="tab"
          aria-selected={props.type === type}
          onClick={() => {
            setSearchParams(
              (prev) => {
                const next = new URLSearchParams(prev)
                if (type === "works") next.delete("type")
                else next.set("type", type)
                // ユーザー・タグの一覧は作品のページ番号を使わない
                next.delete("page")
                return next
              },
              { preventScrollReset: true },
            )
          }}
          className={cn(
            "-mb-px flex-1 border-b-2 px-4 py-3 font-bold text-sm transition-colors sm:flex-none sm:px-8",
            props.type === type
              ? "border-foreground text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
