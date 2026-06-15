import { getAuth, getIdToken } from "firebase/auth"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"

type LedgerItem = {
  id: number
  coinType: "FREE" | "PREMIUM"
  delta: number
  kind: string
  reason: string | null
  source: string | null
  createdAt: number
}

type SummaryResponse = {
  error: string | null
  data: {
    freeBalance: number
    premiumBalance: number
    totalBalance: number
    granted: boolean
    grantedPlanType: string | null
    grantedFreeCoins: number
    grantedPremiumCoins: number
    ledger: LedgerItem[]
  } | null
}

export function PointsSettingsForm() {
  const t = useTranslation()

  const [isLoading, setIsLoading] = useState(false)
  const [summary, setSummary] = useState<SummaryResponse["data"]>(null)

  const hasLedger = (summary?.ledger.length ?? 0) > 0
  const grantedCoins = (summary?.ledger ?? []).reduce((total, row) => {
    if (row.coinType !== "FREE") {
      return total
    }

    if (row.kind === "GRANT" || row.kind === "INITIAL_GRANT") {
      return total + Math.max(row.delta, 0)
    }

    return total
  }, 0)
  const consumedCoins = (summary?.ledger ?? []).reduce((total, row) => {
    if (row.coinType !== "FREE" || row.kind !== "CONSUME") {
      return total
    }

    return total + Math.abs(row.delta)
  }, 0)
  const expiredCoins = (summary?.ledger ?? []).reduce((total, row) => {
    if (row.coinType !== "FREE" || row.kind !== "EXPIRE") {
      return total
    }

    return total + Math.abs(row.delta)
  }, 0)

  const withAuthHeader = async () => {
    const currentUser = getAuth().currentUser
    if (!currentUser) {
      throw new Error(t("ログインが必要です", "Login required"))
    }

    const idToken = await getIdToken(currentUser)

    return {
      authorization: `Bearer ${idToken}`,
      "content-type": "application/json",
    }
  }

  const loadSummary = async () => {
    try {
      setIsLoading(true)
      const headers = await withAuthHeader()
      const response = await fetch("/api/coins/summary", {
        method: "GET",
        headers,
      })

      const json = (await response.json()) as SummaryResponse

      if (!response.ok || json.error) {
        throw new Error(json.error ?? "Failed to load points")
      }

      setSummary(json.data)
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSummary()
  }, [])

  return (
    <div className="space-y-4">
      <div className="rounded-xl border p-4">
        <p className="font-semibold text-lg">{t("所持フリーコイン", "Free Coin Balance")}</p>
        <p className="mt-2 font-bold text-3xl">{isLoading ? "..." : (summary?.freeBalance ?? 0)}</p>
        <div className="mt-3 grid gap-2 text-sm md:grid-cols-3">
          <div className="rounded-lg border p-3">
            <p className="text-muted-foreground text-xs">{t("付与", "Granted")}</p>
            <p className="font-semibold text-xl">{grantedCoins}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-muted-foreground text-xs">{t("消費", "Consumed")}</p>
            <p className="font-semibold text-xl">{consumedCoins}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-muted-foreground text-xs">{t("失効", "Expired")}</p>
            <p className="font-semibold text-xl">{expiredCoins}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 rounded-xl border p-4">
        <p className="font-semibold text-lg">{t("コイン仕様", "Coin Rules")}</p>
        <p className="text-sm">
          {t(
            "通常生成は10コイン、Gemini Nano Bananaは50コイン、Gemini Nano Banana 2は100コイン、画像修正は50コインを消費します。付与されたコインは付与日の24:00で失効します。",
            "Standard generation costs 10 coins, Gemini Nano Banana costs 50, Gemini Nano Banana 2 costs 100, and image editing costs 50. Granted coins expire at 24:00 on the day they are granted.",
          )}
        </p>
        {summary?.granted && (
          <p className="text-emerald-600 text-sm">
            {t(
              `本日の付与コインとして ${summary.grantedFreeCoins + summary.grantedPremiumCoins} コインを付与済みです。本日24:00まで有効です。`,
              `Your daily coin grant of ${summary.grantedFreeCoins + summary.grantedPremiumCoins} coins has been granted and is valid until 24:00 today.`,
            )}
          </p>
        )}
      </div>

      <div className="space-y-3 rounded-xl border p-4">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-lg">{t("履歴", "History")}</p>
          <Button variant="outline" onClick={loadSummary} disabled={isLoading}>
            {t("更新", "Refresh")}
          </Button>
        </div>
        {!hasLedger ? (
          <p className="text-muted-foreground text-sm">{t("履歴はありません", "No history")}</p>
        ) : (
          <div className="space-y-2">
            {(summary?.ledger ?? []).map((row) => (
              <div key={row.id} className="rounded-md border p-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>{`${row.kind} / ${row.coinType}`}</span>
                  <span className={row.delta >= 0 ? "text-emerald-600" : "text-red-600"}>
                    {row.delta > 0 ? `+${row.delta}` : row.delta}
                  </span>
                </div>
                <p className="text-muted-foreground text-xs">{row.reason ?? "-"}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
