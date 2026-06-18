import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import { ScrollArea } from "~/components/ui/scroll-area"
import { useTranslation } from "~/hooks/use-translation"
import {
  getViewerRequestHeaders,
  hasViewerRequestSession,
} from "~/lib/viewer-request-headers"

const INITIAL_LOAD_COUNT = 10
const LOAD_MORE_COUNT = 50

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
    ledger: LedgerItem[]
  } | null
}

const formatCoinAmount = (value: number) => {
  return value.toLocaleString()
}

const normalizeUnixTimestampSeconds = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value > 1_000_000_000_000 ? Math.floor(value / 1000) : value
  }

  if (typeof value === "string") {
    const trimmed = value.trim()
    if (trimmed.length === 0) return null

    if (/^\d+$/.test(trimmed)) {
      const parsed = Number(trimmed)
      if (!Number.isFinite(parsed)) return null
      return parsed > 1_000_000_000_000 ? Math.floor(parsed / 1000) : parsed
    }

    const parsedDate = new Date(trimmed)
    if (!Number.isNaN(parsedDate.getTime())) {
      return Math.floor(parsedDate.getTime() / 1000)
    }
  }

  return null
}

const normalizeLedger = (ledger: LedgerItem[]) => {
  return ledger
    .map((row) => {
      const createdAt = normalizeUnixTimestampSeconds(row.createdAt)
      if (createdAt === null) return null

      return {
        ...row,
        createdAt,
      }
    })
    .filter((row): row is LedgerItem => row !== null)
}

export function GenerationCoinHistoryTab () {
  const t = useTranslation()
  const [items, setItems] = useState<LedgerItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)

  const getHistoryTitle = (row: LedgerItem) => {
    const isAdminBulkAdjust = row.reason === "ADMIN_BULK_ADJUST"

    if (row.coinType === "PREMIUM") {
      if (row.kind === "CONSUME") {
        return isAdminBulkAdjust
          ? t("プレミアムコイン減少", "Premium coins reduced")
          : t("プレミアムコインを使用", "Premium coins used")
      }
      if (row.kind === "EXPIRE") {
        return t("プレミアムコイン失効", "Premium coins expired")
      }
      return t("プレミアムコイン付与", "Premium coins granted")
    }

    if (row.kind === "CONSUME") {
      return isAdminBulkAdjust
        ? t("フリーコイン減少", "Free coins reduced")
        : t("フリーコインを使用", "Free coins used")
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

    if (reason === "ADMIN_BULK_ADJUST") {
      return t("管理者による一括コイン操作", "Bulk coin operation by moderator")
    }

    return reason || t("詳細なし", "No details")
  }

  const fetchLedger = async (offset: number, limit: number) => {
    const headers = await getViewerRequestHeaders()
    const searchParams = new URLSearchParams({
      includeLedger: "1",
      includeLedgerLimit: String(limit),
      includeLedgerOffset: String(offset),
    })
    const response = await fetch(`/api/coins/summary?${searchParams.toString()}`, {
      headers,
    })

    const json = (await response.json()) as SummaryResponse

    if (!response.ok || json.error || json.data === null) {
      throw new Error(json.error ?? "Failed to load coin history")
    }

    return normalizeLedger(json.data.ledger ?? [])
  }

  const refreshHistory = async () => {
    if (!hasViewerRequestSession()) {
      setItems([])
      setHasMore(false)
      return
    }

    try {
      setIsLoading(true)
      const ledger = await fetchLedger(0, INITIAL_LOAD_COUNT)
      setItems(ledger)
      setHasMore(ledger.length === INITIAL_LOAD_COUNT)
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const loadMore = async () => {
    if (!hasViewerRequestSession() || isLoadingMore) {
      return
    }

    try {
      setIsLoadingMore(true)
      const ledger = await fetchLedger(items.length, LOAD_MORE_COUNT)
      setItems((current) => [...current, ...ledger])
      setHasMore(ledger.length === LOAD_MORE_COUNT)
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message)
      }
    } finally {
      setIsLoadingMore(false)
    }
  }

  useEffect(() => {
    void refreshHistory()
  }, [])

  useEffect(() => {
    const handler = () => {
      void refreshHistory()
    }

    window.addEventListener("generation:task-requested", handler)
    window.addEventListener("generation:result-arrived", handler)
    return () => {
      window.removeEventListener("generation:task-requested", handler)
      window.removeEventListener("generation:result-arrived", handler)
    }
  }, [])

  return (
    <div className="flex h-full flex-col gap-2 p-2">
      <div className="flex items-center justify-between">
        <div className="text-muted-foreground text-sm">
          {t("コイン履歴", "Coin history")}
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => void refreshHistory()}
          disabled={isLoading}
        >
          {t("更新", "Refresh")}
        </Button>
      </div>
      <ScrollArea className="h-[60vh] rounded border p-2">
        <div className="space-y-2">
          {!hasViewerRequestSession() && (
            <p className="text-muted-foreground text-sm">
              {t("ログインするとコイン履歴を確認できます", "Sign in to view coin history")}
            </p>
          )}
          {hasViewerRequestSession() && items.length === 0 && !isLoading && (
            <p className="text-muted-foreground text-sm">
              {t("履歴はありません", "No history")}
            </p>
          )}
          {items.map((row) => (
            <div key={row.id} className="rounded border p-3 text-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{getHistoryTitle(row)}</p>
                    {row.coinType === "PREMIUM" && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-700 text-xs dark:bg-amber-900/40 dark:text-amber-400">
                        {t("プレミアム", "Premium")}
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {getHistoryDetail(row)}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {jstDateTimeFormatter.format(new Date(row.createdAt * 1000))}
                  </p>
                </div>
                <span
                  className={
                    row.delta >= 0
                      ? "font-semibold text-emerald-600"
                      : "font-semibold text-red-600"
                  }
                >
                  {row.delta > 0
                    ? `+${formatCoinAmount(row.delta)}`
                    : `-${formatCoinAmount(Math.abs(row.delta))}`} {t("コイン", "coins")}
                </span>
              </div>
            </div>
          ))}
          {hasMore && hasViewerRequestSession() && (
            <Button
              variant="outline"
              className="w-full justify-center"
              onClick={() => void loadMore()}
              disabled={isLoadingMore}
            >
              {isLoadingMore
                ? t("読み込み中…", "Loading...")
                : t("もっと見る", "Show more")}
            </Button>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}