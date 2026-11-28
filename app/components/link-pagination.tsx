import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { Link } from "~/lib/app/locale-router"
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

/** 先頭・末尾と現在の前後 radius ページ（離れていれば省略記号） */
export function buildPageItems(
  current: number,
  lastPage: number,
  radius: number,
): (number | "gap")[] {
  const pages = new Set<number>([0, lastPage])
  for (let page = current - radius; page <= current + radius; page++) {
    if (page >= 0 && page <= lastPage) pages.add(page)
  }
  const sorted = Array.from(pages).sort((a, b) => a - b)
  const items: (number | "gap")[] = []
  for (const [index, page] of sorted.entries()) {
    if (index > 0 && page - sorted[index - 1] > 1) items.push("gap")
    items.push(page)
  }
  return items
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
  // PC は前後 2 ページ、スマホは幅が足りないので前後 1 ページだけ数字を出す
  const wideItems = buildPageItems(current, lastPage, 2)
  const narrowItems = buildPageItems(current, lastPage, 1)

  const labels = props.labels ?? {
    prev: "前へ",
    next: "次へ",
    nav: "ページ送り",
  }

  const itemClassName =
    "inline-flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm tabular-nums transition-colors"
  // 「前へ」「次へ」はスマホでも文字を出し、押しやすいよう大きくする（スマホは 1 行目に左右で並べ、数字は 2 行目）
  const stepClassName = cn(
    itemClassName,
    "h-11 flex-1 gap-1 border font-medium sm:h-10 sm:flex-none sm:border-transparent",
  )

  const renderItems = (items: (number | "gap")[]) =>
    items.map((item, index) =>
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
          className={cn(
            itemClassName,
            "bg-foreground font-semibold text-background",
          )}
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
    )

  return (
    <nav
      aria-label={labels.nav}
      className={cn(
        "flex flex-wrap items-center justify-center gap-x-2 gap-y-2 sm:gap-1",
        props.className,
      )}
    >
      {current > 0 ? (
        <Link
          to={props.toHref(current - 1)}
          rel="prev"
          aria-label={labels.prev}
          className={cn(stepClassName, "hover:bg-muted")}
        >
          <ChevronLeftIcon className="size-4" />
          <span>{labels.prev}</span>
        </Link>
      ) : (
        <span
          className={cn(stepClassName, "text-muted-foreground/50")}
          aria-hidden
        >
          <ChevronLeftIcon className="size-4" />
          <span>{labels.prev}</span>
        </span>
      )}
      <div className="order-last flex w-full items-center justify-center gap-1 sm:hidden">
        {renderItems(narrowItems)}
      </div>
      <div className="hidden items-center gap-1 sm:flex">
        {renderItems(wideItems)}
      </div>
      {current < lastPage ? (
        <Link
          to={props.toHref(current + 1)}
          rel="next"
          aria-label={labels.next}
          className={cn(stepClassName, "hover:bg-muted")}
        >
          <span>{labels.next}</span>
          <ChevronRightIcon className="size-4" />
        </Link>
      ) : (
        <span
          className={cn(stepClassName, "text-muted-foreground/50")}
          aria-hidden
        >
          <span>{labels.next}</span>
          <ChevronRightIcon className="size-4" />
        </span>
      )}
    </nav>
  )
}
