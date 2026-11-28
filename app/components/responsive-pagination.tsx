import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { useContext, useState } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "~/components/ui/pagination"
import { config } from "~/config"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { parsePageJump } from "~/utils/parse-page-jump"

type Props = {
  maxCount: number // 最大個数
  perPage: number // ページあたりの表示数
  currentPage: number
  onPageChange: (page: number) => void
  isActiveButtonStyle?: boolean
  disableScrollToTop?: boolean // ページ変更時のスクロールを無効化
  allowExtendedPagination?: boolean // 100ページまでのページングを許可する
  maxPages?: number // プランベースでの最大ページ数制限
  showPageJump?: boolean // ページ番号を入れて移る欄を出す
}

/** ページ番号を入れて移る欄 */
function PageJumpForm(props: {
  pageCount: number
  onJump: (page: number) => void
}) {
  const t = useTranslation()
  const [text, setText] = useState("")

  return (
    <form
      className="flex items-center gap-1"
      onSubmit={(e) => {
        e.preventDefault()
        const page = parsePageJump(text, props.pageCount)
        if (page === null) return
        props.onJump(page)
        setText("")
      }}
    >
      <Input
        type="text"
        inputMode="numeric"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={`1-${props.pageCount}`}
        aria-label={t("移動するページ番号", "Page number")}
        className="h-9 w-16 text-center"
      />
      <Button type="submit" variant="secondary" disabled={!text.trim()}>
        {t("移動", "Go")}
      </Button>
    </form>
  )
}

/**
 * 改善版ページネーション：
 * 常に最初と最後のページを表示し、現在ページ付近に2ページ表示。
 * 必要な場合は「...」を挟んで省略。
 *
 * 例:
 * ページ総数が30で、現在ページが1の場合:
 * [Prev] [1] [2] [3] ... [30] [Next]
 *
 * ページ総数が30で、現在ページが15の場合:
 * [Prev] [1] ... [15] [16] ... [30] [Next]
 *
 * ページ総数が30で、現在ページが28の場合:
 * [Prev] [1] ... [28] [29] ... [30] [Next]
 */
export function ResponsivePagination({
  maxCount,
  perPage,
  currentPage,
  onPageChange,
  isActiveButtonStyle,
  disableScrollToTop = false,
  allowExtendedPagination = false,
  maxPages,
  showPageJump = false,
}: Props): React.ReactNode {
  const authContext = useContext(AuthContext)
  const t = useTranslation()

  // 100ページ制限を適用する場合の最大アイテム数
  const maxItemsFor100Pages = perPage * 100

  // プランベースの最大ページ数制限を適用
  let effectiveOffsetLimit: number

  if (maxPages !== undefined) {
    // プランベースのページ制限が指定されている場合はそれを優先
    effectiveOffsetLimit = perPage * maxPages
  } else if (allowExtendedPagination) {
    // 拡張ページングが許可されている場合は100ページ制限
    effectiveOffsetLimit = maxItemsFor100Pages
  } else {
    // 通常のoffsetMax制限
    effectiveOffsetLimit = config.query.offsetMax
  }

  const adjustedMaxCount = authContext.isLoggedIn
    ? Math.min(maxCount, effectiveOffsetLimit)
    : Math.min(maxCount, effectiveOffsetLimit)

  const pageCount = Math.ceil(adjustedMaxCount / perPage)
  const currentPageIndex =
    currentPage >= pageCount ? pageCount - 1 : currentPage

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < pageCount) {
      onPageChange(newPage)
      if (!disableScrollToTop) {
        window.scrollTo(0, 0)
      }
    }
  }

  if (pageCount === 0) {
    return null
  }

  // ページ番号の欄を足すと狭い画面で収まらないので折り返す
  const contentClassName = showPageJump
    ? "flex flex-wrap items-center justify-center gap-2"
    : "flex flex-wrap items-center justify-center gap-1.5 sm:gap-2"

  const firstPageIndex = 0
  const lastPageIndex = pageCount - 1

  const showPrev = currentPageIndex > 0
  const showNext = currentPageIndex < lastPageIndex

  // 中央に表示するページ数は2固定
  const middleCount = 2

  // middleStart: 中央ブロックの開始ページIndex
  // middleEnd: 中央ブロックの終了ページIndex
  let middleStart = currentPageIndex
  let middleEnd = middleStart + middleCount - 1

  // 総ページ数が4以下なら全部表示
  if (pageCount <= 4) {
    // 全部表示する
    const allPages = Array.from({ length: pageCount }, (_, i) => i)
    return (
      <Pagination>
        <PaginationContent className={contentClassName}>
          <PaginationItem>
            <Button
              variant="secondary"
              onClick={() => handlePageChange(currentPageIndex - 1)}
              disabled={!showPrev}
              className="gap-1 px-3"
            >
              <ChevronLeftIcon className="size-4" />
              {t("前へ", "Prev")}
            </Button>
          </PaginationItem>
          {allPages.map((p) => (
            <PaginationItem key={p}>
              <Button
                variant={p === currentPageIndex ? undefined : "secondary"}
                className={
                  p === currentPageIndex && isActiveButtonStyle
                    ? "bg-black text-white hover:bg-black hover:text-white dark:bg-white dark:text-black dark:hover:bg-white"
                    : ""
                }
                onClick={() => handlePageChange(p)}
              >
                {p + 1}
              </Button>
            </PaginationItem>
          ))}
          <PaginationItem>
            <Button
              variant="secondary"
              onClick={() => handlePageChange(currentPageIndex + 1)}
              disabled={!showNext}
              className="gap-1 px-3"
            >
              {t("次へ", "Next")}
              <ChevronRightIcon className="size-4" />
            </Button>
          </PaginationItem>
          {showPageJump && (
            <PaginationItem>
              <PageJumpForm pageCount={pageCount} onJump={handlePageChange} />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    )
  }

  // ページ数が多い場合、先頭・末尾は常に表示し、中間2ページを決める

  // 中間が先頭に近すぎる場合
  if (middleStart <= 1) {
    middleStart = 1
    middleEnd = middleStart + (middleCount - 1) // 1 + 1 = 2
  }

  // 中間が末尾に近すぎる場合
  if (middleEnd >= lastPageIndex - 1) {
    middleEnd = lastPageIndex - 1
    middleStart = middleEnd - (middleCount - 1) // lastPageIndex-1 -1
  }

  // 表示する中間ページのリスト
  const middlePages = []
  for (let i = middleStart; i <= middleEnd; i++) {
    if (i > firstPageIndex && i < lastPageIndex) {
      middlePages.push(i)
    }
  }

  // 左側に...を表示するか: middleStartがfirstPageIndex+1より大きければ...
  const _showLeftEllipsis = middleStart > firstPageIndex + 1

  // 右側に...を表示するか: middleEndがlastPageIndex-1より小ければ...
  const _showRightEllipsis = middleEnd < lastPageIndex - 1

  return (
    <Pagination>
      <PaginationContent className={contentClassName}>
        {/* Prev */}
        <PaginationItem>
          <Button
            variant="secondary"
            onClick={() => handlePageChange(currentPageIndex - 1)}
            disabled={!showPrev}
            className="gap-1 px-3"
          >
            <ChevronLeftIcon className="size-4" />
            {t("前へ", "Prev")}
          </Button>
        </PaginationItem>

        {/* 最初のページ */}
        <PaginationItem>
          <Button
            variant={
              currentPageIndex === firstPageIndex ? undefined : "secondary"
            }
            className={
              currentPageIndex === firstPageIndex && isActiveButtonStyle
                ? "bg-black text-white hover:bg-black hover:text-white dark:bg-white dark:text-black dark:hover:bg-white"
                : ""
            }
            onClick={() => handlePageChange(firstPageIndex)}
          >
            {firstPageIndex + 1}
          </Button>
        </PaginationItem>

        {/* 左側... */}
        {/* {showLeftEllipsis && <PaginationEllipsis />} */}

        {/* 中央2ページ */}
        {middlePages.map((p) => (
          <PaginationItem key={p}>
            <Button
              variant={p === currentPageIndex ? undefined : "secondary"}
              className={
                p === currentPageIndex && isActiveButtonStyle
                  ? "bg-black text-white hover:bg-black hover:text-white dark:bg-white dark:text-black dark:hover:bg-white"
                  : ""
              }
              onClick={() => handlePageChange(p)}
            >
              {p + 1}
            </Button>
          </PaginationItem>
        ))}

        {/* 右側... */}
        {/* {showRightEllipsis && <PaginationEllipsis />} */}

        {/* 最後のページ */}
        <PaginationItem>
          <Button
            variant={
              currentPageIndex === lastPageIndex ? undefined : "secondary"
            }
            className={
              currentPageIndex === lastPageIndex && isActiveButtonStyle
                ? "bg-black text-white hover:bg-black hover:text-white dark:bg-white dark:text-black dark:hover:bg-white"
                : ""
            }
            onClick={() => handlePageChange(lastPageIndex)}
          >
            {lastPageIndex + 1}
          </Button>
        </PaginationItem>

        {/* Next */}
        <PaginationItem>
          <Button
            variant="secondary"
            onClick={() => handlePageChange(currentPageIndex + 1)}
            disabled={!showNext}
            className="gap-1 px-3"
          >
            {t("次へ", "Next")}
            <ChevronRightIcon className="size-4" />
          </Button>
        </PaginationItem>
        {showPageJump && (
          <PaginationItem>
            <PageJumpForm pageCount={pageCount} onJump={handlePageChange} />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  )
}
