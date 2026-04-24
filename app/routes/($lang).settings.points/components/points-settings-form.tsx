import { getAuth, getIdToken } from "firebase/auth"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { useTranslation } from "~/hooks/use-translation"

type LedgerItem = {
  id: number
  delta: number
  kind: string
  reason: string | null
  createdAt: number
}

type SummaryResponse = {
  error: string | null
  data: {
    userId: string
    balance: number
    ledger: LedgerItem[]
  } | null
}

const packageOptions = [
  { id: "POINTS_100", label: "100pt", points: 100 },
  { id: "POINTS_300", label: "300pt", points: 300 },
  { id: "POINTS_1000", label: "1000pt", points: 1000 },
] as const

export function PointsSettingsForm() {
  const t = useTranslation()

  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [summary, setSummary] = useState<SummaryResponse["data"]>(null)
  const [consumePoints, setConsumePoints] = useState("10")
  const [consumeReason, setConsumeReason] = useState("image generation")
  const [grantPoints, setGrantPoints] = useState("10")
  const [grantReason, setGrantReason] = useState("manual grant")

  const hasLedger = (summary?.ledger.length ?? 0) > 0

  const ledgerRows = useMemo(() => {
    return summary?.ledger ?? []
  }, [summary])

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
      const response = await fetch("/api/points/summary", {
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

  const postTransaction = async (type: "grant" | "consume") => {
    const pointsText = type === "grant" ? grantPoints : consumePoints
    const reason = type === "grant" ? grantReason : consumeReason
    const points = Number.parseInt(pointsText, 10)

    if (!Number.isFinite(points) || points <= 0) {
      toast(t("ポイント数が不正です", "Invalid points"))
      return
    }

    try {
      setIsSubmitting(true)
      const headers = await withAuthHeader()
      const response = await fetch("/api/points/transaction", {
        method: "POST",
        headers,
        body: JSON.stringify({
          type,
          points,
          reason,
        }),
      })

      const json = (await response.json()) as SummaryResponse
      if (!response.ok || json.error) {
        throw new Error(json.error ?? "Failed to update points")
      }

      setSummary(
        json.data
          ? {
              ...summary,
              userId: summary?.userId ?? "",
              balance: json.data.balance,
              ledger: json.data.ledger,
            }
          : summary,
      )
      toast(
        type === "grant"
          ? t("ポイントを付与しました", "Granted points")
          : t("ポイントを消費しました", "Consumed points"),
      )
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const onStartCheckout = async (packageId: string) => {
    try {
      setIsSubmitting(true)
      const headers = await withAuthHeader()

      const response = await fetch("/api/stripe/points-checkout", {
        method: "POST",
        headers,
        body: JSON.stringify({ packageId }),
      })

      const json = (await response.json()) as {
        error: string | null
        data: {
          checkoutUrl: string
        } | null
      }

      if (!response.ok || json.error || !json.data?.checkoutUrl) {
        throw new Error(json.error ?? "Failed to create checkout")
      }

      window.location.assign(json.data.checkoutUrl)
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border p-4">
        <p className="font-semibold text-lg">{t("現在のポイント", "Current Points")}</p>
        <p className="mt-2 font-bold text-3xl">{isLoading ? "..." : (summary?.balance ?? 0)}</p>
      </div>

      <div className="space-y-3 rounded-xl border p-4">
        <p className="font-semibold text-lg">{t("ポイント購入", "Buy Points")}</p>
        <div className="grid gap-2 md:grid-cols-3">
          {packageOptions.map((option) => (
            <Button
              key={option.id}
              onClick={() => onStartCheckout(option.id)}
              disabled={isSubmitting}
              variant="outline"
            >
              {option.label}
            </Button>
          ))}
        </div>
        <p className="text-muted-foreground text-xs">
          {t(
            "購入後、Webhook経由でポイントが自動付与されます。",
            "Points are granted automatically via Stripe webhook after successful payment.",
          )}
        </p>
      </div>

      <div className="space-y-3 rounded-xl border p-4">
        <p className="font-semibold text-lg">{t("ポイントを使う", "Consume Points")}</p>
        <div className="flex flex-col gap-2 md:flex-row">
          <Input value={consumePoints} onChange={(event) => setConsumePoints(event.target.value)} />
          <Input value={consumeReason} onChange={(event) => setConsumeReason(event.target.value)} />
          <Button onClick={() => postTransaction("consume")} disabled={isSubmitting}>
            {t("消費", "Consume")}
          </Button>
        </div>
      </div>

      <div className="space-y-3 rounded-xl border p-4">
        <p className="font-semibold text-lg">{t("ポイント付与(運用/テスト)", "Grant Points (Ops/Test)")}</p>
        <div className="flex flex-col gap-2 md:flex-row">
          <Input value={grantPoints} onChange={(event) => setGrantPoints(event.target.value)} />
          <Input value={grantReason} onChange={(event) => setGrantReason(event.target.value)} />
          <Button onClick={() => postTransaction("grant")} disabled={isSubmitting}>
            {t("付与", "Grant")}
          </Button>
        </div>
      </div>

      <div className="space-y-3 rounded-xl border p-4">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-lg">{t("履歴", "History")}</p>
          <Button variant="outline" onClick={loadSummary} disabled={isLoading || isSubmitting}>
            {t("更新", "Refresh")}
          </Button>
        </div>
        {!hasLedger ? (
          <p className="text-muted-foreground text-sm">{t("履歴はありません", "No history")}</p>
        ) : (
          <div className="space-y-2">
            {ledgerRows.map((row) => (
              <div key={row.id} className="rounded-md border p-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>{row.kind}</span>
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
