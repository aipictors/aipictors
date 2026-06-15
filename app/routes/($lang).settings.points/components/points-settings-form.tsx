import { getAuth, getIdToken } from "firebase/auth"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { CoinIcon } from "~/components/coin-icon"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"

const jstDateFormatter = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
})

const jstDateTimeFormatter = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
})

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

  const visibleLedger = (summary?.ledger ?? []).filter(
    (row) => row.coinType === "FREE",
  )
  const hasLedger = visibleLedger.length > 0
  const todayJstKey = jstDateFormatter.format(new Date())
  const todayLedger = visibleLedger.filter(
    (row) =>
      jstDateFormatter.format(new Date(row.createdAt * 1000)) === todayJstKey,
  )
  const grantedCoins = todayLedger.reduce((total, row) => {
    if (row.kind === "GRANT" || row.kind === "INITIAL_GRANT") {
      return total + Math.max(row.delta, 0)
    }

    return total
  }, 0)
  const consumedCoins = todayLedger.reduce((total, row) => {
    if (row.kind !== "CONSUME") {
      return total
    }

    return total + Math.abs(row.delta)
  }, 0)
  const expiredCoins = todayLedger.reduce((total, row) => {
    if (row.kind !== "EXPIRE") {
      return total
    }

    return total + Math.abs(row.delta)
  }, 0)

  const formatLedgerDateTime = (createdAt: number) => {
    return jstDateTimeFormatter
      .format(new Date(createdAt * 1000))
      .replace(/\//g, "/")
  }

  const getHistoryTitle = (row: LedgerItem) => {
    if (row.coinType === "PREMIUM") {
      if (row.kind === "CONSUME") return t("プレミアムコインを使用", "Premium coins used")
      if (row.kind === "EXPIRE") return t("プレミアムコイン失効", "Premium coins expired")
      return t("プレミアムコイン付与", "Premium coins granted")
    }

    if (row.kind === "CONSUME") {
      return t("フリーコインを使用", "Free coins used")
    }

    if (row.kind === "EXPIRE") {
      return t("フリーコイン失効", "Free coins expired")
    }

    return t("フリーコイン付与", "Free coins granted")
  }

  const getHistoryDetail = (row: LedgerItem) => {
    const reason = row.reason ?? ""

    if (reason === "image-generation:text_to_image") {
      return t("通常生成", "Standard generation")
    }

    if (reason === "image-generation:image_to_image") {
      return t("画像修正", "Image modification")
    }

    if (reason === "image-generation:inpainting") {
      return t("画像修正", "Image modification")
    }

    if (reason === "image-generation:reserved:text_to_image") {
      return t("通常生成（予約）", "Reserved standard generation")
    }

    if (reason === "image-generation:reserved:image_to_image") {
      return t("画像修正（予約）", "Reserved image modification")
    }

    if (reason === "image-generation:reserved:inpainting") {
      return t("画像修正（予約）", "Reserved image modification")
    }

    if (reason === "image-generation:flux") {
      return t("FLUX生成", "FLUX generation")
    }

    if (reason === "image-generation:gemini-2.5-flash-image") {
      return t("Gemini Nano Banana", "Gemini Nano Banana")
    }

    if (reason === "image-generation:gemini-3.1-flash-image-preview") {
      return t("Gemini Nano Banana 2", "Gemini Nano Banana 2")
    }

    const dailyGrantMatch = reason.match(
      /^(FREE|LITE|STANDARD|PREMIUM) daily generation coin grant$/,
    )

    if (dailyGrantMatch) {
      return t(
        `${dailyGrantMatch[1]}プランの毎日付与`,
        `${dailyGrantMatch[1]} plan daily grant`,
      )
    }

    const initialGrantMatch = reason.match(
      /^(FREE|LITE|STANDARD|PREMIUM) initial generation coin grant$/,
    )

    if (initialGrantMatch) {
      return t(
        `${initialGrantMatch[1]}プランの初回付与`,
        `${initialGrantMatch[1]} plan initial grant`,
      )
    }

    if (reason === "Daily coin expiration") {
      return t("当日24:00の期限切れ", "Expired at 24:00 on the grant day")
    }

    return reason || t("詳細なし", "No details")
  }

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
      const response = await fetch("/api/coins/summary?includeLedger=1", {
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
      <div className="rounded-xl border p-5">
        <p className="flex items-center gap-2 font-semibold text-lg">
          <CoinIcon className="h-5 w-5 shrink-0" />
          <span>{t("現在使えるフリーコイン", "Free coins available now")}</span>
        </p>
        <p className="mt-3 font-bold text-4xl">
          {isLoading ? "..." : (summary?.freeBalance ?? 0)}
          <span className="ml-2 font-semibold text-xl">{t("コイン", "coins")}</span>
        </p>
        <p className="mt-3 text-muted-foreground text-sm leading-6">
          {t(
            "画像生成に使える無料コインです。付与されたコインは当日の24:00に失効します。",
            "These free coins can be used for image generation. Granted coins expire at 24:00 on the same day.",
          )}
        </p>
      </div>

      <div className="space-y-3 rounded-xl border p-4">
        <p className="font-semibold text-lg">{t("今日の内訳", "Today's breakdown")}</p>
        <div className="grid gap-2 text-sm md:grid-cols-3">
          <div className="rounded-lg border p-3">
            <p className="text-muted-foreground text-xs">
              {t("今日もらったコイン", "Coins received today")}
            </p>
            <p className="font-semibold text-xl">{grantedCoins}</p>
            <p className="mt-1 text-muted-foreground text-xs">
              {t("本日付与された無料コイン", "Free coins granted today")}
            </p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-muted-foreground text-xs">
              {t("今日使ったコイン", "Coins used today")}
            </p>
            <p className="font-semibold text-xl">{consumedCoins}</p>
            <p className="mt-1 text-muted-foreground text-xs">
              {t("画像生成などで使用済み", "Used for image generation and related features")}
            </p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-muted-foreground text-xs">
              {t("今日失効したコイン", "Coins expired today")}
            </p>
            <p className="font-semibold text-xl">{expiredCoins}</p>
            <p className="mt-1 text-muted-foreground text-xs">
              {t("24:00に期限切れになったコイン", "Coins that expired at 24:00")}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3 rounded-xl border p-4">
        <p className="font-semibold text-lg">
          {t("フリーコインの使い方", "How to use free coins")}
        </p>
        <p className="text-sm leading-6">
          {t(
            "画像生成を行うと、使用するモデルや機能に応じてフリーコインを消費します。",
            "When you generate images, free coins are consumed depending on the model and feature you use.",
          )}
        </p>
        <p className="text-amber-600 text-sm dark:text-amber-400">
          {t(
            "付与されたフリーコインは、付与日の24:00に失効します。",
            "Granted free coins expire at 24:00 on the day they are granted.",
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
          <p className="font-semibold text-lg">{t("利用履歴", "Usage history")}</p>
          <Button variant="outline" onClick={loadSummary} disabled={isLoading}>
            {t("履歴を更新", "Refresh history")}
          </Button>
        </div>
        {!hasLedger ? (
          <p className="text-muted-foreground text-sm">{t("履歴はありません", "No history")}</p>
        ) : (
          <div className="space-y-2">
            {visibleLedger.map((row) => (
              <div key={row.id} className="rounded-lg border p-3 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="font-semibold">{getHistoryTitle(row)}</p>
                    <p className="text-muted-foreground text-xs">{getHistoryDetail(row)}</p>
                    <p className="text-muted-foreground text-xs">
                      {formatLedgerDateTime(row.createdAt)}
                    </p>
                  </div>
                  <span className={row.delta >= 0 ? "font-semibold text-emerald-600" : "font-semibold text-red-600"}>
                    {row.delta > 0 ? `+${row.delta}` : row.delta} {t("コイン", "coins")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
