import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { config } from "@/config"
import { useMediaQuery } from "usehooks-ts"

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
  const isDesktop = useMediaQuery(config.mediaQuery.isDesktop)

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pageCount) {
      onPageChange(newPage - 1)
    }
  }

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={() => handlePageChange(currentPage - 1)}
          />
        </PaginationItem>
        {/* 略記号を使用したページ番号の動的生成 */}
        {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
          <PaginationItem key={page}>
            {/* 現在のページの前後にページを表示するロジック */}
            {Math.abs(page - currentPage) <= 2 && (
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  handlePageChange(page)
                }}
                className={page === currentPage ? "active" : ""}
              >
                {page}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}
        {pageCount > (isDesktop ? 5 : 3) && <PaginationEllipsis />}{" "}
        {/* 省略記号の表示条件 */}
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={() => handlePageChange(currentPage + 1)}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
