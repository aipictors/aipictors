import { Link } from "@remix-run/react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"

export type UserWorksSort = "new" | "popular"

/**
 * URL の ?page=（0 始まり）と ?sort=popular を読む（ローダー用）
 */
export const parseUserWorksListParams = (requestUrl: string) => {
  const url = new URL(requestUrl)
  const rawPage = Number.parseInt(url.searchParams.get("page") ?? "0", 10)
  const page =
    Number.isFinite(rawPage) && rawPage >= 0 && rawPage <= 100 ? rawPage : 0
  const sort: UserWorksSort =
    url.searchParams.get("sort") === "popular" ? "popular" : "new"
  return {
    page,
    sort,
    /** works の where に足す並び順 */
    orderWhere:
      sort === "popular"
        ? ({ orderBy: "LIKES_COUNT", sort: "DESC" } as const)
        : ({} as const),
  }
}

const toHref = (basePath: string, page: number, sort: UserWorksSort) => {
  const params = new URLSearchParams()
  if (sort === "popular") params.set("sort", "popular")
  if (page > 0) params.set("page", String(page))
  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}

type Props = {
  title: string
  count: number
  basePath: string
  page: number
  perPage: number
  sort: UserWorksSort
  children: React.ReactNode
}

/**
 * ユーザーページの作品タブ共通の枠（見出し・件数・並び替え・ページ送り）
 * ページ送りと並び替えはリンクにして、検索エンジンが 2 ページ目以降もたどれるようにする
 */
export function UserWorksTabLayout(props: Props) {
  const t = useTranslation()
  const lastPage = Math.max(
    0,
    Math.min(Math.ceil(props.count / props.perPage), 100) - 1,
  )

  return (
    <section className="space-y-4 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-bold text-lg">
          {props.title}
          <span className="ml-2 font-normal text-muted-foreground text-sm tabular-nums">
            {props.count.toLocaleString()}
            {t("件", "")}
          </span>
        </h2>
        <div className="inline-flex rounded-full border bg-muted/40 p-0.5 text-sm">
          {(
            [
              ["new", t("新しい順", "Newest")],
              ["popular", t("人気順", "Popular")],
            ] as const
          ).map(([value, label]) => (
            <Link
              key={value}
              to={toHref(props.basePath, 0, value)}
              preventScrollReset
              aria-current={props.sort === value ? "page" : undefined}
              className={cn(
                "rounded-full px-3 py-1 transition-colors",
                props.sort === value
                  ? "bg-background font-medium text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {props.count === 0 ? (
        <p className="rounded-2xl border border-dashed px-4 py-12 text-center text-muted-foreground text-sm">
          {t("まだ作品がありません", "No works yet")}
        </p>
      ) : (
        props.children
      )}

      {lastPage > 0 && (
        <LinkPagination
          basePath={props.basePath}
          page={props.page}
          lastPage={lastPage}
          sort={props.sort}
        />
      )}
    </section>
  )
}

function LinkPagination(props: {
  basePath: string
  page: number
  lastPage: number
  sort: UserWorksSort
}) {
  const t = useTranslation()
  const { page, lastPage } = props
  const pages = [...new Set([0, page - 1, page, page + 1, lastPage])]
    .filter((value) => value >= 0 && value <= lastPage)
    .sort((a, b) => a - b)

  const itemClass =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-sm transition-colors"

  return (
    <nav
      aria-label={t("ページ送り", "Pagination")}
      className="flex justify-center pt-4"
    >
      <ul className="flex items-center gap-1">
        <li>
          {page > 0 ? (
            <Link
              to={toHref(props.basePath, page - 1, props.sort)}
              rel="prev"
              className={cn(itemClass, "hover:bg-muted")}
              aria-label={t("前のページ", "Previous page")}
            >
              <ChevronLeftIcon className="size-4" />
            </Link>
          ) : (
            <span className={cn(itemClass, "opacity-30")}>
              <ChevronLeftIcon className="size-4" />
            </span>
          )}
        </li>
        {pages.map((value, index) => (
          <li key={value} className="flex items-center gap-1">
            {index > 0 && value - pages[index - 1] > 1 && (
              <span className="px-1 text-muted-foreground">…</span>
            )}
            <Link
              to={toHref(props.basePath, value, props.sort)}
              aria-current={value === page ? "page" : undefined}
              className={cn(
                itemClass,
                value === page
                  ? "bg-foreground font-medium text-background"
                  : "hover:bg-muted",
              )}
            >
              {value + 1}
            </Link>
          </li>
        ))}
        <li>
          {page < lastPage ? (
            <Link
              to={toHref(props.basePath, page + 1, props.sort)}
              rel="next"
              className={cn(itemClass, "hover:bg-muted")}
              aria-label={t("次のページ", "Next page")}
            >
              <ChevronRightIcon className="size-4" />
            </Link>
          ) : (
            <span className={cn(itemClass, "opacity-30")}>
              <ChevronRightIcon className="size-4" />
            </span>
          )}
        </li>
      </ul>
    </nav>
  )
}
