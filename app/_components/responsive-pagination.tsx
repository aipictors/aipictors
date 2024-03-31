import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

type Props = {
  maxCount: number // 最大個数
  perPage: number // ページあたりの表示数
  currentPage: number
  onPageChange: (page: number) => void
}

/**
 * レスポンシブ対応のページネーション
 * @returns
 */
export const ResponsivePagination = ({
  maxCount,
  perPage,
  currentPage,
  onPageChange,
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
              href="#"
              onClick={() => handlePageChange(currentPageIndex - 1)}
            />
          </PaginationItem>
        )}
        {/* 先頭ページ */}
        {currentPageIndex > 1 && pageCount > 2 && (
          <>
            <PaginationItem>
              <PaginationLink href="#" onClick={() => handlePageChange(1)}>
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
              href="#"
              onClick={() => handlePageChange(currentPageIndex - 1)}
            >
              {currentPageIndex - 1 + 1}
            </PaginationLink>
          </PaginationItem>
        )}
        {/* 現在のページ */}
        <PaginationItem>
          <PaginationLink href="#" isActive>
            {currentPageIndex + 1}
          </PaginationLink>
        </PaginationItem>
        {/* 次のページ */}
        {currentPageIndex + 1 !== pageCount && (
          <PaginationItem>
            <PaginationLink
              href="#"
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
                href="#"
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
              href="#"
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
