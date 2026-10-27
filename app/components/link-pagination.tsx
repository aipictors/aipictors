import { Link } from "@remix-run/react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { cn } from "~/lib/utils"

type Props = {
  /** 0 始まりの現在のページ */
  currentPage: number
  totalCount: number
  perPage: number
  /** これより後ろのページは表示しない（API の offset 上限など） */
  maxPage?: number
  /** ページ番号（0 始まり）から URL を作る */
  toHref: (page: number) => string
  className?: string
  labels?: { prev: string; next: string; nav: string }
}

/**
 * リンク（<a href>）で作るページ送り
 * 検索エンジンが 2 ページ目以降もたどれるよう、ボタンではなくリンクにする
 */
export function LinkPagination(props: Props) {
  const lastPage = Math.min(
    Math.max(Math.ceil(props.totalCount / props.perPage) - 1, 0),
    props.maxPage ?? Number.POSITIVE_INFINITY,
  )
  if (lastPage <= 0) {
    return null
  }

  const current = Math.min(Math.max(props.currentPage, 0), lastPage)
  const pages = new Set<number>([0, lastPage])
  for (let page = current - 2; page <= current + 2; page++) {
    if (page >= 0 && page <= lastPage) pages.add(page)
  }
  const sorted = Array.from(pages).sort((a, b) => a - b)

  const items: (number | "gap")[] = []
  for (const [index, page] of sorted.entries()) {
    if (index > 0 && page - sorted[index - 1] > 1) items.push("gap")
    items.push(page)
  }

  const labels = props.labels ?? {
    prev: "前へ",
    next: "次へ",
    nav: "ページ送り",
  }

  const itemClassName =
    "inline-flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm tabular-nums transition-colors"

  return (
    <nav
      aria-label={labels.nav}
      className={cn("flex flex-wrap items-center justify-center gap-1", props.className)}
    >
      {current > 0 ? (
        <Link
          to={props.toHref(current - 1)}
          rel="prev"
          className={cn(itemClassName, "gap-1 hover:bg-muted")}
        >
          <ChevronLeftIcon className="size-4" />
          <span className="hidden sm:inline">{labels.prev}</span>
        </Link>
      ) : (
        <span
          className={cn(itemClassName, "gap-1 text-muted-foreground/50")}
          aria-hidden
        >
          <ChevronLeftIcon className="size-4" />
          <span className="hidden sm:inline">{labels.prev}</span>
        </span>
      )}
      {items.map((item, index) =>
        item === "gap" ? (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: 省略記号は位置で区別する
            key={`gap-${index}`}
            className="px-1 text-muted-foreground"
          >
            …
          </span>
        ) : item === current ? (
          <span
            key={item}
            aria-current="page"
            className={cn(itemClassName, "bg-foreground font-semibold text-background")}
          >
            {item + 1}
          </span>
        ) : (
          <Link
            key={item}
            to={props.toHref(item)}
            className={cn(itemClassName, "hover:bg-muted")}
          >
            {item + 1}
          </Link>
        ),
      )}
      {current < lastPage ? (
        <Link
          to={props.toHref(current + 1)}
          rel="next"
          className={cn(itemClassName, "gap-1 hover:bg-muted")}
        >
          <span className="hidden sm:inline">{labels.next}</span>
          <ChevronRightIcon className="size-4" />
        </Link>
      ) : (
        <span
          className={cn(itemClassName, "gap-1 text-muted-foreground/50")}
          aria-hidden
        >
          <span className="hidden sm:inline">{labels.next}</span>
          <ChevronRightIcon className="size-4" />
        </span>
      )}
    </nav>
  )
}
