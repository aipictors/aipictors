import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { useContext } from "react"
import { AuthContext } from "~/contexts/auth-context"
import {
  fetchMyUserModels,
  fetchUserModel,
  fetchUserModels,
} from "~/lib/user-models/client"
import type { UserModelListParams } from "~/lib/user-models/types"

const PAGE_SIZE = 24

export const userModelsQueryKeys = {
  all: ["user-models"] as const,
  list: (params: UserModelListParams) =>
    ["user-models", "list", params] as const,
  detail: (id: string) => ["user-models", "detail", id] as const,
  mine: () => ["user-models", "mine"] as const,
}

/**
 * みんなのモデル一覧（無限スクロール）
 */
export function useUserModelsInfinite(
  params: Omit<UserModelListParams, "offset" | "limit">,
  options: { enabled?: boolean; pageSize?: number } = {},
) {
  const authContext = useContext(AuthContext)
  const pageSize = options.pageSize ?? PAGE_SIZE

  return useInfiniteQuery({
    queryKey: [...userModelsQueryKeys.list(params), pageSize],
    enabled: (options.enabled ?? true) && !authContext.isLoading,
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      fetchUserModels({ ...params, offset: pageParam, limit: pageSize }),
    getNextPageParam: (lastPage, pages) => {
      if (!lastPage.hasMore) return undefined
      return pages.reduce((sum, page) => sum + page.models.length, 0)
    },
    staleTime: 60_000,
  })
}

export function useUserModel(id: string | null | undefined) {
  const authContext = useContext(AuthContext)
  return useQuery({
    queryKey: userModelsQueryKeys.detail(id ?? ""),
    enabled: Boolean(id) && !authContext.isLoading,
    queryFn: () => fetchUserModel(id ?? ""),
    staleTime: 60_000,
    retry: (count, error) => {
      const status =
        typeof error === "object" && error !== null && "status" in error
          ? Number((error as { status: unknown }).status)
          : 0
      return status >= 500 && count < 2
    },
  })
}

export function useMyUserModels() {
  const authContext = useContext(AuthContext)
  return useQuery({
    queryKey: userModelsQueryKeys.mine(),
    enabled: authContext.isLoggedIn,
    queryFn: fetchMyUserModels,
    staleTime: 10_000,
  })
}
