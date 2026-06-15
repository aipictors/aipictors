/**
 * ユーザーのコイン残高を取得するカスタムhook
 * - 認証済みユーザーのフリーコイン/プレミアムコイン残高を取得
 * - /api/coins/summary を利用
 */
import { useContext, useEffect, useState } from "react"
import { AuthContext } from "~/contexts/auth-context"
import {
  getViewerRequestHeaders,
  hasViewerRequestSession,
} from "~/lib/viewer-request-headers"

type CoinBalance = {
  freeCoinsBalance: number
  premiumCoinsBalance: number
}

export function useCoinBalance() {
  const authContext = useContext(AuthContext)
  const [balance, setBalance] = useState<CoinBalance | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const hasViewerSession = hasViewerRequestSession()

    if (
      (authContext.isLoading || authContext.isNotLoggedIn) &&
      !hasViewerSession
    ) {
      setBalance(null)
      setIsLoading(false)
      return
    }

    const load = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const headers = await getViewerRequestHeaders({
          includeJsonContentType: true,
        })
        const res = await fetch(`/api/coins/summary`, {
          method: "GET",
          headers,
        })

        const json = (await res.json()) as {
          error?: string
          data?: {
            freeBalance?: number
            premiumBalance?: number
          }
        }

        if (!res.ok || json.error) {
          setError(json.error ?? "Failed to load coin balance")
          return
        }

        if (json.data) {
          setBalance({
            freeCoinsBalance: json.data.freeBalance ?? 0,
            premiumCoinsBalance: json.data.premiumBalance ?? 0,
          })
        }
      } catch (e) {
        if (e instanceof Error) {
          setError(e.message)
        }
      } finally {
        setIsLoading(false)
      }
    }

    void load()
  }, [authContext.isLoading, authContext.isNotLoggedIn])

  return { balance, isLoading, error }
}
