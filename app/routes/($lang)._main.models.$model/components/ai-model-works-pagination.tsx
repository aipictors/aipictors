import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { Link } from "~/lib/app/locale-router"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import {
  type AiModelWorksSearch,
  toAiModelWorksPageItems,
  toAiModelWorksQuery,
} from "~/routes/($lang)._main.models.$model/ai-model-works-page"

type Props = {
  basePath: string
  moreRatingsKey: "r15" | "r18g"
  search: AiModelWorksSearch
  pageCount: number
}

/**
 * ページ送り。リンクにして、検索エンジンが 2 ページ目以降の作品もたどれるようにする
 * （ボタンで切り替えると、サーバーの HTML に次のページへの道がなかった）
 */
export function AiModelWorksPagination(props: Props) {
  const t = useTranslation()

  if (props.pageCount <= 1) {
    return null
  }

  const currentPage = Math.min(props.search.page, props.pageCount - 1)

  const toPath = (page: number) =>
    `${props.basePath}${toAiModelWorksQuery({ ...props.search, page }, props.moreRatingsKey)}`

  const itemClassName =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-md px-2 text-sm transition-colors"

  return (
    <nav
      aria-label={t("ページ送り", "Pagination")}
      className="flex flex-wrap items-center justify-center gap-1 py-2"
    >
      {currentPage > 0 ? (
        <Link
          to={toPath(currentPage - 1)}
          rel="prev"
          className={cn(
            itemClassName,
            "gap-0.5 bg-secondary hover:bg-secondary/80",
          )}
        >
          <ChevronLeftIcon className="size-4" />
          <span className="hidden sm:inline">{t("前へ", "Prev")}</span>
        </Link>
      ) : (
        <span
          aria-hidden="true"
          className={cn(itemClassName, "gap-0.5 text-muted-foreground/50")}
        >
          <ChevronLeftIcon className="size-4" />
          <span className="hidden sm:inline">{t("前へ", "Prev")}</span>
        </span>
      )}
      {toAiModelWorksPageItems(currentPage, props.pageCount).map(
        (page, index) =>
          page === null ? (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: 省略の印は位置で区別する
              key={`gap-${index}`}
              className="px-1 text-muted-foreground"
            >
              …
            </span>
          ) : page === currentPage ? (
            <span
              key={page}
              aria-current="page"
              className={cn(
                itemClassName,
                "bg-primary font-semibold text-primary-foreground",
              )}
            >
              {page + 1}
            </span>
          ) : (
            <Link
              key={page}
              to={toPath(page)}
              className={cn(
                itemClassName,
                "bg-secondary hover:bg-secondary/80",
              )}
            >
              {page + 1}
            </Link>
          ),
      )}
      {currentPage < props.pageCount - 1 ? (
        <Link
          to={toPath(currentPage + 1)}
          rel="next"
          className={cn(
            itemClassName,
            "gap-0.5 bg-secondary hover:bg-secondary/80",
          )}
        >
          <span className="hidden sm:inline">{t("次へ", "Next")}</span>
          <ChevronRightIcon className="size-4" />
        </Link>
      ) : (
        <span
          aria-hidden="true"
          className={cn(itemClassName, "gap-0.5 text-muted-foreground/50")}
        >
          <span className="hidden sm:inline">{t("次へ", "Next")}</span>
          <ChevronRightIcon className="size-4" />
        </span>
      )}
    </nav>
  )
}
