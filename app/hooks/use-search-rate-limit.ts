import { useCallback, useState } from "react"
import { consumeSearchRateLimitSlot } from "~/utils/search-rate-limit"

export function useSearchRateLimit() {
  const [isRateLimitDialogOpen, setIsRateLimitDialogOpen] = useState(false)

  const executeSearchWithRateLimit = useCallback((action: () => void) => {
    const result = consumeSearchRateLimitSlot()

    if (!result.isAllowed) {
      setIsRateLimitDialogOpen(true)
      return false
    }

    action()
    return true
  }, [])

  const closeSearchRateLimitDialog = useCallback(() => {
    setIsRateLimitDialogOpen(false)
  }, [])

  return {
    isRateLimitDialogOpen,
    executeSearchWithRateLimit,
    closeSearchRateLimitDialog,
  }
}
