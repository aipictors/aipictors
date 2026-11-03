import { Link, useNavigation, useSearchParams } from "@remix-run/react"
import type { FragmentOf } from "gql.tada"
import { ResponsivePagination } from "~/components/responsive-pagination"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import {
  StickerList,
  type StickerListItemFragment,
} from "~/routes/($lang)._main.stickers._index/components/sticker-list"
import {
  STICKER_SORTS,
  STICKERS_PER_PAGE,
  type StickerSort,
} from "~/routes/($lang)._main.stickers._index/utils/sticker-list-params"

type Props = {
  stickers: FragmentOf<typeof StickerListItemFragment>[]
  count: number
  sort: StickerSort
  page: number
  emptyMessage: string
}

/**
 * 公開スタンプの一覧: 並び順、件数、ページ送り（どれも URL に残る）
 */
export function StickerListSection(props: Props) {
  const t = useTranslation()

  const navigation = useNavigation()

  const [searchParams, setSearchParams] = useSearchParams()

  const onPageChange = (page: number) => {
    const next = new URLSearchParams(searchParams)
    if (page === 0) {
      next.delete("page")
    } else {
      next.set("page", page.toString())
    }
    setSearchParams(next)
  }

  const toSortSearch = (sort: StickerSort) => {
    const next = new URLSearchParams(searchParams)
    next.delete("page")
    if (sort === "new") {
      next.delete("sort")
    } else {
      next.set("sort", sort)
    }
    return next.toString()
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2 border-b">
        <nav
          className="-mb-px flex min-w-0 gap-1 overflow-x-auto [scrollbar-width:none]"
          aria-label={t("並び順", "Sort")}
        >
          {(Object.keys(STICKER_SORTS) as StickerSort[]).map((sort) => (
            <Link
              key={sort}
              to={{ search: toSortSearch(sort) }}
              preventScrollReset
              prefetch="intent"
              aria-current={props.sort === sort ? "page" : undefined}
              className={cn(
                "shrink-0 border-b-2 px-3 py-2 font-medium text-sm transition-colors",
                props.sort === sort
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {t(STICKER_SORTS[sort].ja, STICKER_SORTS[sort].en)}
            </Link>
          ))}
        </nav>
        <p className="shrink-0 pb-1 text-muted-foreground text-xs tabular-nums">
          {t(
            `${props.count.toLocaleString()}件`,
            `${props.count.toLocaleString()} stickers`,
          )}
        </p>
      </div>
      {props.stickers.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground text-sm">
          {props.emptyMessage}
        </p>
      ) : (
        <div
          className={cn(
            "transition-opacity",
            navigation.state === "loading" && "opacity-60",
          )}
        >
          <StickerList
            stickers={props.stickers}
            isFirstView={props.page === 0}
          />
        </div>
      )}
      <ResponsivePagination
        perPage={STICKERS_PER_PAGE}
        maxCount={props.count}
        currentPage={props.page}
        maxPages={Math.ceil(props.count / STICKERS_PER_PAGE)}
        onPageChange={onPageChange}
      />
    </section>
  )
}
