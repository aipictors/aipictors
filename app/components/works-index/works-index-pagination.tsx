import { Link } from "@remix-run/react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { toPageItems } from "~/components/works-index/works-index-params"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"

type Props = {
  /** 今のページ（0 始まり） */
  page: number
  lastPage: number
  /** ページの URL */
  toHref: (page: number) => string
}

const ITEM_CLASS_NAME =
  "flex size-9 items-center justify-center rounded-full font-medium text-sm transition-colors"

/**
 * ページ送り
 * 検索エンジンがたどれるように、すべて本物のリンクにする
 */
export function WorksIndexPagination(props: Props) {
  const t = useTranslation()

  if (props.lastPage <= 0) {
    return null
  }

  return (
    <nav
      aria-label={t("ページ送り", "Pagination")}
      className="flex flex-wrap items-center justify-center gap-1"
    >
      {props.page > 0 ? (
        <Link
          to={props.toHref(props.page - 1)}
          rel="prev"
          aria-label={t("前のページ", "Previous page")}
          className={cn(ITEM_CLASS_NAME, "hover:bg-muted")}
        >
          <ChevronLeftIcon className="size-4" />
        </Link>
      ) : (
        <span
          aria-hidden={true}
          className={cn(ITEM_CLASS_NAME, "text-muted-foreground/40")}
        >
          <ChevronLeftIcon className="size-4" />
        </span>
      )}
      {toPageItems(props.page, props.lastPage).map((item, index, items) =>
        item === "gap" ? (
          <span
            // 省略の記号は隣のページ番号で決まる
            key={`gap-after-${items[index - 1]}`}
            aria-hidden={true}
            className="flex h-9 w-5 items-center justify-center text-muted-foreground"
          >
            {"…"}
          </span>
        ) : (
          <Link
            key={item}
            to={props.toHref(item)}
            aria-current={item === props.page ? "page" : undefined}
            className={cn(
              ITEM_CLASS_NAME,
              item === props.page
                ? "bg-foreground text-background"
                : "hover:bg-muted",
            )}
          >
            {item + 1}
          </Link>
        ),
      )}
      {props.page < props.lastPage ? (
        <Link
          to={props.toHref(props.page + 1)}
          rel="next"
          aria-label={t("次のページ", "Next page")}
          className={cn(ITEM_CLASS_NAME, "hover:bg-muted")}
        >
          <ChevronRightIcon className="size-4" />
        </Link>
      ) : (
        <span
          aria-hidden={true}
          className={cn(ITEM_CLASS_NAME, "text-muted-foreground/40")}
        >
          <ChevronRightIcon className="size-4" />
        </span>
      )}
    </nav>
  )
}
