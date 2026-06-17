import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"
import { getViewerRequestHeaders, hasViewerRequestSession } from "~/lib/viewer-request-headers"
import type { AmazonExchangeRequest } from "~/routes/api.coins.amazon-exchange/route"

type ExchangeListData = {
  requests: AmazonExchangeRequest[]
  pendingCount: number
  remainingSlots: number
}

type Props = {
  className?: string
  maxItems?: number
}

const jstDateTimeFormatter = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
})

const formatDateTime = (unix: number) =>
  jstDateTimeFormatter.format(new Date(unix * 1000)).replace(/\//g, "/")

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

const normalizeExchangeListData = (
  data: Partial<ExchangeListData> | undefined,
): ExchangeListData => ({
  requests: Array.isArray(data?.requests)
    ? data.requests.map((request) => ({
        ...request,
        appliedAt: normalizeUnixTimestampSeconds(request.appliedAt) ?? 0,
        approvedAt:
          request.approvedAt === null
            ? null
            : (normalizeUnixTimestampSeconds(request.approvedAt) ?? null),
      }))
    : [],
  pendingCount: typeof data?.pendingCount === "number" ? data.pendingCount : 0,
  remainingSlots: typeof data?.remainingSlots === "number" ? data.remainingSlots : 0,
})

export function AmazonExchangeCodesPanel(props: Props) {
  const t = useTranslation()
  const [isLoading, setIsLoading] = useState(false)
  const [requests, setRequests] = useState<AmazonExchangeRequest[]>([])

  const loadRequests = async () => {
    if (!hasViewerRequestSession()) {
      setRequests([])
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const headers = await getViewerRequestHeaders({ includeJsonContentType: true })
      const response = await fetch("/api/coins/amazon-exchange", {
        method: "GET",
        headers,
      })

      const json = (await response.json()) as {
        error: string | null
        data?: ExchangeListData
      }

      if (!response.ok || json.error || !json.data) {
        throw new Error(
          json.error ??
            t(
              "交換コード履歴の読み込みに失敗しました",
              "Failed to load exchange code history",
            ),
        )
      }

      const normalized = normalizeExchangeListData(json.data)
      const approvedWithCode = normalized.requests
        .filter(
          (request) =>
            request.status === "APPROVED" &&
            typeof request.amazonGiftCode === "string" &&
            request.amazonGiftCode.trim().length > 0,
        )
        .sort((a, b) => {
          const aTime = a.approvedAt ?? a.appliedAt
          const bTime = b.approvedAt ?? b.appliedAt
          return bTime - aTime
        })

      setRequests(approvedWithCode)
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadRequests()
  }, [])

  const visibleRequests =
    typeof props.maxItems === "number" ? requests.slice(0, props.maxItems) : requests

  return (
    <div className={props.className ?? "space-y-3 rounded-xl border p-4"}>
      <div className="flex items-center justify-between">
        <p className="font-semibold text-lg">
          {t("Amazon交換コード履歴", "Amazon exchange codes")}
        </p>
        <Button variant="outline" size="sm" onClick={loadRequests} disabled={isLoading}>
          {isLoading ? t("更新中...", "Refreshing...") : t("更新", "Refresh")}
        </Button>
      </div>

      {visibleRequests.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          {t(
            "表示できる交換コードはまだありません。",
            "No exchange codes available yet.",
          )}
        </p>
      ) : (
        <div className="space-y-2">
          {visibleRequests.map((request) => (
            <div key={request.id} className="rounded-lg border p-3 text-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="font-semibold">
                    \\u00a5{request.amazonPointYen.toLocaleString()} ({request.coinAmount.toLocaleString()}
                    {t("コイン", " coins")})
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {t("承認日", "Approved")}: {formatDateTime(request.approvedAt ?? request.appliedAt)}
                  </p>
                </div>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-medium text-emerald-700 text-xs dark:bg-emerald-900/40 dark:text-emerald-600">
                  {t("コード反映済み", "Code reflected")}
                </span>
              </div>
              <div className="mt-2 rounded-md bg-muted px-3 py-2">
                <p className="select-all font-bold font-mono text-sm tracking-widest">
                  {request.amazonGiftCode}
                </p>
                <p className="mt-0.5 text-muted-foreground text-xs">
                  {t("Amazonギフト券コード", "Amazon Gift Card code")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
