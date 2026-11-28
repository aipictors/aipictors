import { GridLayoutToggle } from "~/components/grid-layout-toggle"
import { LinkPagination } from "~/components/link-pagination"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
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
  /** 並び替えの横にサムネイルの並べ方（正方形／元の比率）の切り替えを出す（画像の一覧） */
  hasGridLayoutToggle?: boolean
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
        <div className="flex flex-wrap items-center gap-2">
          {props.hasGridLayoutToggle && <GridLayoutToggle />}
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
      </div>

      {props.count === 0 ? (
        <p className="rounded-2xl border border-dashed px-4 py-12 text-center text-muted-foreground text-sm">
          {t("まだ作品がありません", "No works yet")}
        </p>
      ) : (
        props.children
      )}

      {lastPage > 0 && (
        <UserWorksPagination
          basePath={props.basePath}
          page={props.page}
          lastPage={lastPage}
          sort={props.sort}
        />
      )}
    </section>
  )
}

/** 作品タブのページ送り（共通のリンクのページ送り。スマホでも「前へ」「次へ」を出す） */
function UserWorksPagination(props: {
  basePath: string
  page: number
  lastPage: number
  sort: UserWorksSort
}) {
  const t = useTranslation()
  return (
    <LinkPagination
      className="pt-4"
      currentPage={props.page}
      totalCount={props.lastPage + 1}
      perPage={1}
      toHref={(page) => toHref(props.basePath, page, props.sort)}
      labels={{
        prev: t("前へ", "Prev"),
        next: t("次へ", "Next"),
        nav: t("ページ送り", "Pagination"),
      }}
    />
  )
}
