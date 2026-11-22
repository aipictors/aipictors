import { ChevronRight, SearchIcon, XIcon } from "lucide-react"
import { useMemo } from "react"
import { Input } from "~/components/ui/input"
import { useTranslation } from "~/hooks/use-translation"
import { Link, useNavigate } from "~/lib/app/locale-router"
import { searchSettings } from "~/routes/($lang).settings._index/utils/settings-search"

type InputProps = {
  query: string
  onChange(value: string): void
  /** Enter で最初の結果を開く */
  onSubmit(): void
}

/**
 * 設定の上の検索欄
 */
export function SettingsSearchInput(props: InputProps) {
  const t = useTranslation()

  return (
    <div className="relative">
      <SearchIcon className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-muted-foreground" />
      <Input
        type="search"
        value={props.query}
        onChange={(event) => props.onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.nativeEvent.isComposing) return
          if (event.key === "Enter") {
            event.preventDefault()
            props.onSubmit()
          }
          if (event.key === "Escape") props.onChange("")
        }}
        placeholder={t(
          "設定を検索（例: パスワード、通知、R18）",
          "Search settings (e.g. password, notifications, R18)",
        )}
        aria-label={t("設定を検索", "Search settings")}
        className="h-11 rounded-full pr-10 pl-9 [&::-webkit-search-cancel-button]:hidden"
      />
      {props.query !== "" && (
        <button
          type="button"
          onClick={() => props.onChange("")}
          aria-label={t("検索をやめる", "Clear search")}
          className="-translate-y-1/2 absolute top-1/2 right-2 rounded-full p-1.5 text-muted-foreground hover:bg-muted"
        >
          <XIcon className="size-4" />
        </button>
      )}
    </div>
  )
}

type ResultsProps = {
  query: string
  onSelect(): void
}

/**
 * 検索結果（設定の一覧）。入力中は各ページの中身の代わりに出す
 */
export function SettingsSearchResults(props: ResultsProps) {
  const t = useTranslation()

  const results = useMemo(() => searchSettings(props.query), [props.query])

  if (results.length === 0) {
    return (
      <div className="rounded-xl border px-4 py-10 text-center text-muted-foreground text-sm">
        {t(
          `「${props.query}」に当てはまる設定は見つかりませんでした`,
          `No settings match "${props.query}"`,
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <p className="px-1 text-muted-foreground text-xs">
        {t(`${results.length} 件の設定`, `${results.length} settings`)}
      </p>
      <ul className="divide-y overflow-hidden rounded-xl border">
        {results.map((entry) => (
          <li key={`${entry.href}:${entry.ja}`}>
            <Link
              to={entry.href}
              onClick={props.onSelect}
              className="flex min-h-14 items-center gap-3 px-4 py-2 transition-colors hover:bg-muted/60"
            >
              <span className="min-w-0 flex-1">
                <span className="block font-medium text-sm">
                  {t(entry.ja, entry.en)}
                </span>
                {entry.pageJa !== undefined && (
                  <span className="block truncate text-muted-foreground text-xs">
                    {t(entry.pageJa, entry.pageEn ?? entry.pageJa)}
                  </span>
                )}
              </span>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Enter で最初の結果を開く */
export function useOpenFirstSettingsResult() {
  const navigate = useNavigate()
  return (query: string) => {
    const first = searchSettings(query)[0]
    if (first === undefined) return false
    navigate(first.href)
    return true
  }
}
