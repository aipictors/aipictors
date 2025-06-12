import { useCallback } from "react"
import { useNavigate } from "@remix-run/react"

/**
 * URLSearchParams を更新するユーティリティ。
 * @param params    変更後の URLSearchParams
 * @param replace   true: history.replaceState 相当 / false(default): pushState
 */
export const useUpdateQueryParams = () => {
  const navigate = useNavigate()

  const updateQueryParams = useCallback(
    (params: URLSearchParams, options: { replace?: boolean } = {}) => {
      navigate(`?${params.toString()}`, {
        replace: options.replace ?? false,
        /* スクロール位置を維持したい場合は ↓ */
        preventScrollReset: true,
      })
    },
    [navigate],
  )

  return updateQueryParams
}
