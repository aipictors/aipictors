import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/_components/ui/pagination"

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

  const currentPageIndex = currentPage > pageCount ? pageCount : currentPage

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage <= pageCount) {
      onPageChange(newPage)
    }
  }

  if (pageCount === 0) {
    return null
  }

  return (
    <Pagination>
      <PaginationContent>
        {/* Prevボタン */}
        {currentPageIndex !== 0 && (
          <PaginationItem>
            <PaginationPrevious
              to="#"
              onClick={() => handlePageChange(currentPageIndex - 1)}
            />
          </PaginationItem>
        )}
        {/* 先頭ページ */}
        {currentPageIndex > 1 && pageCount > 2 && (
          <>
            <PaginationItem>
              <PaginationLink to="#" onClick={() => handlePageChange(1)}>
                {1}
              </PaginationLink>
            </PaginationItem>{" "}
            <PaginationEllipsis />
          </>
        )}
        {/* 前ページ */}
        {currentPageIndex > 0 && (
          <PaginationItem>
            <PaginationLink
              to="#"
              onClick={() => handlePageChange(currentPageIndex - 1)}
            >
              {currentPageIndex - 1 + 1}
            </PaginationLink>
          </PaginationItem>
        )}
        {/* 現在のページ */}
        <PaginationItem>
          <PaginationLink
            className={
              isActiveButtonStyle
                ? "bg-black text-white dark:bg-white dark:hover:bg-white hover:bg-black dark:text-black hover:text-white"
                : ""
            }
            to="#"
            isActive
          >
            {currentPageIndex + 1}
          </PaginationLink>
        </PaginationItem>
        {/* 次のページ */}
        {currentPageIndex + 1 !== pageCount && (
          <PaginationItem>
            <PaginationLink
              to="#"
              onClick={() => handlePageChange(currentPageIndex + 1)}
            >
              {currentPageIndex + 1 + 1}
            </PaginationLink>
          </PaginationItem>
        )}
        {/* 末尾ページ */}
        {currentPageIndex + 1 !== pageCount && (
          <>
            <PaginationEllipsis />{" "}
            <PaginationItem>
              <PaginationLink
                to="#"
                onClick={() => handlePageChange(pageCount - 1)}
              >
                {pageCount}
              </PaginationLink>
            </PaginationItem>
          </>
        )}
        {/* Nextボタン */}
        {currentPageIndex + 1 !== pageCount && (
          <PaginationItem>
            <PaginationNext
              to="#"
              onClick={(e) => {
                e.preventDefault()
                handlePageChange(currentPageIndex + 1)
              }}
            />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  )
}
