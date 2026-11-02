import { useLocation } from "@remix-run/react"
import { SearchIcon } from "lucide-react"
import { useState } from "react"
import { AppStatusPageShell } from "~/components/app/app-status-page-shell"
import { useTranslation } from "~/hooks/use-translation"
import { getPathLocale } from "~/utils/locale-path"
import {
  BIRTHDAY_LINE,
  getDailyLineIndex,
  isPictorChanBirthday,
  NOT_FOUND_LINES,
} from "~/utils/pictor-chan-lines"

const POPULAR_TAGS: readonly (readonly [string, string])[] = [
  ["女の子", "Girl"],
  ["猫", "Cat"],
  ["風景", "Scenery"],
  ["ファンタジー", "Fantasy"],
  ["制服", "Uniform"],
  ["着物", "Kimono"],
  ["メイド", "Maid"],
  ["ドラゴン", "Dragon"],
]

type Props = Readonly<{
  /** root の ErrorBoundary から出すとき */
  standalone?: boolean
}>

/**
 * 404 ページ（迷子になったぴくたーちゃんが検索や人気の場所へ案内する）
 */
export function AppNotFoundPage (props: Props): React.ReactNode {
  const t = useTranslation()
  const { pathname } = useLocation()
  const prefix = getPathLocale(pathname) === "en" ? "/en" : ""

  const [lines] = useState(() => {
    const now = new Date()
    if (isPictorChanBirthday(now)) return [BIRTHDAY_LINE, ...NOT_FOUND_LINES]
    const start = getDailyLineIndex(NOT_FOUND_LINES.length, now)
    return [...NOT_FOUND_LINES.slice(start), ...NOT_FOUND_LINES.slice(0, start)]
  })
  const [lineIndex, setLineIndex] = useState(0)
  const line = lines[lineIndex % lines.length]

  const places = [
    { href: "/rankings", label: t("ランキング", "Rankings") },
    { href: "/new-works", label: t("新着作品", "New works") },
    { href: "/archive", label: t("過去の名作", "Past masterpieces") },
    { href: "/themes", label: t("今日のお題", "Daily themes") },
  ]

  return (
    <AppStatusPageShell homePath={prefix || "/"} standalone={props.standalone}>
      <div className="flex w-full flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6">
        <button
          type="button"
          style={{ background: "transparent", border: 0 }}
          className="hover:-translate-y-1 shrink-0 cursor-pointer rounded-2xl p-1 transition-transform duration-200 motion-reduce:transform-none"
          aria-label={t(
            "ぴくたーちゃんに話しかける",
            "Talk to Pictor-chan",
          )}
          onClick={() => setLineIndex((index) => index + 1)}
        >
          <img
            src="/images/pictor-chan/run.webp"
            alt=""
            width={160}
            height={316}
            fetchPriority="high"
            className="aspect-160/316 h-40 w-auto sm:h-52"
            style={{ maxHeight: 208, width: "auto" }}
          />
        </button>
        <div className="flex min-w-0 flex-col items-center gap-3 text-center sm:items-start sm:text-left">
          <p
            className="bg-linear-to-r from-orange-500 via-sky-500 to-emerald-500 bg-clip-text font-black text-5xl text-transparent tracking-tight md:text-6xl"
            aria-hidden="true"
          >
            404
          </p>
          <h1 className="font-bold text-xl md:text-2xl">
            {t("ページが見つかりません", "Page not found")}
          </h1>
          {/* 日付で変わるので、配信時と日をまたいでも食い違いとして扱わない */}
          <p
            className="flex min-h-16 items-center rounded-2xl bg-muted px-4 py-2 text-left text-sm leading-relaxed sm:rounded-tl-sm"
            aria-live="polite"
            suppressHydrationWarning
          >
            {t(line[0], line[1])}
          </p>
        </div>
      </div>

      <form
        action={`${prefix}/search`}
        method="get"
        className="flex w-full max-w-xl items-center gap-2"
      >
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">{t("作品を検索", "Search works")}</span>
          <SearchIcon
            aria-hidden="true"
            className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-muted-foreground"
          />
          <input
            type="search"
            name="q"
            enterKeyHint="search"
            placeholder={t("作品やタグを検索", "Search works and tags")}
            className="h-11 w-full rounded-full border bg-background pr-4 pl-9 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring md:text-sm"
          />
        </label>
        <button
          type="submit"
          className="h-11 shrink-0 cursor-pointer rounded-full bg-clear-bright-blue px-5 font-medium text-sm text-white transition-opacity hover:opacity-90"
        >
          {t("検索", "Search")}
        </button>
      </form>

      <nav
        aria-label={t("人気の場所", "Popular places")}
        className="grid w-full max-w-xl grid-cols-2 gap-2 sm:grid-cols-4"
      >
        {places.map((place) => (
          <a
            key={place.href}
            href={`${prefix}${place.href}`}
            className="motion-safe:hover:-translate-y-0.5 flex min-h-11 items-center justify-center rounded-xl border px-2 py-2 text-center font-medium text-sm transition-colors hover:bg-accent motion-safe:transition-transform"
          >
            {place.label}
          </a>
        ))}
      </nav>

      <section className="w-full max-w-xl space-y-2">
        <h2 className="text-center font-semibold text-muted-foreground text-sm">
          {t("人気のタグ", "Popular tags")}
        </h2>
        <ul className="flex flex-wrap justify-center gap-1.5">
          {POPULAR_TAGS.map(([tag, enTag]) => (
            <li key={tag}>
              <a
                href={`${prefix}/tags/${encodeURIComponent(tag)}`}
                className="inline-flex min-h-9 items-center rounded-full bg-muted px-3 text-sm transition-colors hover:bg-accent"
              >
                {`#${t(tag, enTag)}`}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <a
        href={prefix || "/"}
        className="inline-flex min-h-11 items-center justify-center rounded-full border px-8 font-medium text-sm transition-colors hover:bg-accent"
      >
        {t("トップページへ戻る", "Back to the top page")}
      </a>
    </AppStatusPageShell>
  )
}
