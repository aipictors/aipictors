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
    if (newPage >= 0 && newPage <= pageCount) {
      onPageChange(newPage)
    }
  }

  return (
    <Pagination>
      <PaginationContent>
        {/* Prevボタン */}
        {currentPage !== 0 && (
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={() => handlePageChange(currentPage - 1)}
            />
          </PaginationItem>
        )}
        {/* 前ページ */}
        {currentPage > 0 && (
          <PaginationItem>
            <PaginationLink
              href="#"
              onClick={() => handlePageChange(currentPage - 1)}
            >
              {currentPage - 1 + 1}
            </PaginationLink>
          </PaginationItem>
        )}
        {/* 現在のページ */}
        <PaginationItem>
          <PaginationLink href="#" isActive>
            {currentPage + 1}
          </PaginationLink>
        </PaginationItem>
        {/* 次のページ */}
        {currentPage + 1 !== pageCount && (
          <PaginationItem>
            <PaginationLink
              href="#"
              onClick={() => handlePageChange(currentPage + 1)}
            >
              {currentPage + 1 + 1}
            </PaginationLink>
          </PaginationItem>
        )}
        {currentPage + 1 !== pageCount && pageCount > (isDesktop ? 5 : 3) && (
          <PaginationEllipsis />
        )}{" "}
        {/* 末尾ページ */}
        {currentPage + 1 !== pageCount && (
          <PaginationItem>
            <PaginationLink
              href="#"
              onClick={() => handlePageChange(pageCount - 1)}
            >
              {pageCount}
            </PaginationLink>
          </PaginationItem>
        )}
        {/* Nextボタン */}
        {currentPage + 1 !== pageCount && (
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault()
                handlePageChange(currentPage + 1)
              }}
            />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  )
}
