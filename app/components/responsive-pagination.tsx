import { Button } from "~/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "~/components/ui/pagination"

type Props = {
  maxCount: number // 最大個数
  perPage: number // ページあたりの表示数
  currentPage: number
  onPageChange: (page: number) => void
  isActiveButtonStyle?: boolean
}

/**
 * レスポンシブ対応のページネーション
 */
export const ResponsivePagination = ({
  maxCount,
  perPage,
  currentPage,
  onPageChange,
  isActiveButtonStyle,
}: Props) => {
  const pageCount = Math.ceil(maxCount / perPage) // 総ページ数の計算

  const currentPageIndex =
    currentPage >= pageCount ? pageCount - 1 : currentPage

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < pageCount) {
      onPageChange(newPage)
    }
  }

  if (pageCount === 0) {
    return null
  }

  return (
    <Pagination>
      <PaginationContent className="flex items-center">
        {/* Prevボタン */}
        {currentPageIndex !== 0 && (
          <PaginationItem>
            <Button
              variant={"secondary"}
              onClick={() => handlePageChange(currentPageIndex - 1)}
            >
              {"Prev"}
            </Button>
          </PaginationItem>
        )}
        {/* 先頭ページ */}
        {currentPageIndex > 1 && pageCount > 2 && (
          <>
            <PaginationItem>
              <Button variant={"secondary"} onClick={() => handlePageChange(0)}>
                {1}
              </Button>
            </PaginationItem>{" "}
            <PaginationEllipsis />
          </>
        )}
        {/* 前ページ */}
        {currentPageIndex > 0 && (
          <PaginationItem>
            <Button
              variant={"secondary"}
              onClick={() => handlePageChange(currentPageIndex - 1)}
            >
              {currentPageIndex}
            </Button>
          </PaginationItem>
        )}
        {/* 現在のページ */}
        <PaginationItem>
          <Button
            className={
              isActiveButtonStyle
                ? "bg-black text-white hover:bg-black hover:text-white dark:bg-white dark:text-black dark:hover:bg-white"
                : ""
            }
          >
            {currentPageIndex + 1}
          </Button>
        </PaginationItem>
        {/* 次のページ */}
        {currentPageIndex + 1 !== pageCount && (
          <PaginationItem>
            <Button
              variant={"secondary"}
              onClick={() => handlePageChange(currentPageIndex + 1)}
            >
              {currentPageIndex + 2}
            </Button>
          </PaginationItem>
        )}
        {/* 末尾ページ */}
        {currentPageIndex + 1 !== pageCount && (
          <>
            <PaginationEllipsis />{" "}
            <PaginationItem>
              <Button
                variant={"secondary"}
                onClick={() => handlePageChange(pageCount - 1)}
              >
                {pageCount}
              </Button>
            </PaginationItem>
          </>
        )}
        {/* Nextボタン */}
        {currentPageIndex + 1 !== pageCount && (
          <PaginationItem>
            <Button
              variant={"secondary"}
              onClick={(e) => {
                e.preventDefault()
                handlePageChange(currentPageIndex + 1)
              }}
            >
              {"Next"}
            </Button>
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  )
}
