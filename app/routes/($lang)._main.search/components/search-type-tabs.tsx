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
      // アプリの検索結果と同じ、下線のタブを横幅いっぱいに 3 つ（PC は左に寄せる）
      className="mb-4 flex border-b md:mb-6"
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
            "relative flex h-12 flex-1 items-center justify-center text-[15px] transition-colors md:w-36 md:flex-none",
            props.type === type
              ? "font-extrabold text-foreground"
              : "font-semibold text-muted-foreground hover:text-foreground",
          )}
        >
          <span className="relative inline-flex h-full items-center">
            {label}
            {props.type === type && (
              <span className="absolute inset-x-0 bottom-0 h-[3px] rounded-full bg-foreground" />
            )}
          </span>
        </button>
      ))}
    </div>
  )
}
