import { useCallback } from "react"

export function useSearchRateLimit() {
  const executeSearchWithRateLimit = useCallback((action: () => void) => {
    action()
    return true
  }, [])

  const closeSearchRateLimitDialog = useCallback(() => {}, [])

  return {
    isRateLimitDialogOpen: false,
    executeSearchWithRateLimit,
    closeSearchRateLimitDialog,
  }
}
