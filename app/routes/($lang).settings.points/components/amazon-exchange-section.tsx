import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import { useTranslation } from "~/hooks/use-translation"
import {
  AMAZON_EXCHANGE_MAX_PENDING,
  AMAZON_EXCHANGE_PACKAGES,
  type AmazonExchangePackageId,
} from "~/lib/amazon-exchange"
import { getViewerRequestHeaders } from "~/lib/viewer-request-headers"
import type { AmazonExchangeRequest } from "~/routes/api.coins.amazon-exchange/route"

const PACKAGE_OPTIONS = Object.values(AMAZON_EXCHANGE_PACKAGES)

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

type ExchangeListData = {
  requests: AmazonExchangeRequest[]
  pendingCount: number
  remainingSlots: number
}

const normalizeExchangeListData = (
  data: Partial<ExchangeListData> | undefined,
): ExchangeListData => ({
  requests: Array.isArray(data?.requests) ? data.requests : [],
  pendingCount: typeof data?.pendingCount === "number" ? data.pendingCount : 0,
  remainingSlots:
    typeof data?.remainingSlots === "number"
      ? data.remainingSlots
      : AMAZON_EXCHANGE_MAX_PENDING,
})

export function AmazonExchangeSection(props: {
  premiumBalance: number
  exchangeablePremiumBalance: number
}) {
  const t = useTranslation()
  const [open, setOpen] = useState(false)
  const [selectedPackageId, setSelectedPackageId] =
    useState<AmazonExchangePackageId>("AMAZON_1000")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [listData, setListData] = useState<ExchangeListData | null>(null)
  const [isLoadingList, setIsLoadingList] = useState(false)

  const selectedPkg = AMAZON_EXCHANGE_PACKAGES[selectedPackageId]

  const withAuthHeader = async () => {
    try {
      return await getViewerRequestHeaders({ includeJsonContentType: true })
    } catch {
      throw new Error(t("ログインが必要です", "Login required"))
    }
  }

  const loadList = async () => {
    try {
      setIsLoadingList(true)
      const headers = await withAuthHeader()
      const res = await fetch("/api/coins/amazon-exchange", {
        method: "GET",
        headers,
      })
      const json = (await res.json()) as {
        error: string | null
        data?: ExchangeListData
      }
      if (!res.ok || json.error || !json.data) {
        throw new Error(
          json.error ?? t("読み込みに失敗しました", "Failed to load"),
        )
      }
      setListData(normalizeExchangeListData(json.data))
    } catch (e) {
      if (e instanceof Error) toast.error(e.message)
    } finally {
      setIsLoadingList(false)
    }
  }

  useEffect(() => {
    loadList()
  }, [])

  const handleApply = async () => {
    if (props.exchangeablePremiumBalance < selectedPkg.coinAmount) {
      toast.error(
        t(
          "交換に使える応援コインが不足しています",
          "Insufficient support coins available for exchange",
        ),
      )
      return
    }

    if ((listData?.remainingSlots ?? AMAZON_EXCHANGE_MAX_PENDING) <= 0) {
      toast.error(
        t(
          `同時申請は${AMAZON_EXCHANGE_MAX_PENDING}件までです。承認後に再度申請できます。`,
          `You can have at most ${AMAZON_EXCHANGE_MAX_PENDING} pending requests at a time.`,
        ),
      )
      return
    }

    try {
      setIsSubmitting(true)
      const headers = await withAuthHeader()
      const res = await fetch("/api/coins/amazon-exchange", {
        method: "POST",
        headers,
        body: JSON.stringify({ packageId: selectedPackageId }),
      })
      const json = (await res.json()) as {
        error: string | null
        data?: { requestId: string; remainingSlots: number }
      }
      if (!res.ok || json.error || !json.data) {
        throw new Error(
          json.error ?? t("申請に失敗しました", "Failed to apply"),
        )
      }
      toast.success(t("交換申請を受け付けました", "Exchange request submitted"))
      setOpen(false)
      await loadList()
    } catch (e) {
      if (e instanceof Error) toast.error(e.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const pendingRequests = (listData?.requests ?? []).filter(
    (r) => r.status === "PENDING",
  )
  const approvedRequests = (listData?.requests ?? []).filter(
    (r) => r.status === "APPROVED",
  )
  const remainingSlots = listData?.remainingSlots ?? AMAZON_EXCHANGE_MAX_PENDING

  return (
    <div className="space-y-3 rounded-xl border p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-lg">
            {t("Amazonギフト券への交換", "Exchange for Amazon Gift Card")}
          </p>
          <p className="mt-1 text-muted-foreground text-sm">
            {t(
              "他ユーザから推されて受け取った応援コインをAmazonギフト券と交換できます。",
              "Exchange support coins received from other users for Amazon Gift Cards.",
            )}
          </p>
          <p className="mt-1 text-muted-foreground text-sm">
            {t(
              `同時申請: ${AMAZON_EXCHANGE_MAX_PENDING - (listData?.pendingCount ?? 0)} / ${AMAZON_EXCHANGE_MAX_PENDING} 枠 空き`,
              `Available slots: ${AMAZON_EXCHANGE_MAX_PENDING - (listData?.pendingCount ?? 0)} / ${AMAZON_EXCHANGE_MAX_PENDING}`,
            )}
          </p>
        </div>

        {/* Apply dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="default" disabled={remainingSlots <= 0}>
              {t("交換申請する", "Apply for Exchange")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {t("Amazonギフト券 交換申請", "Amazon Gift Card Exchange")}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <p className="font-semibold text-sm">
                  {t("交換パッケージを選択", "Select a package")}
                </p>
                {PACKAGE_OPTIONS.map((pkg) => (
                  <button
                    type="button"
                    key={pkg.id}
                    onClick={() => setSelectedPackageId(pkg.id)}
                    className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                      selectedPackageId === pkg.id
                        ? "border-primary bg-primary/10 font-semibold"
                        : "hover:bg-muted"
                    }`}
                  >
                    {t(pkg.label, pkg.labelEn)}
                  </button>
                ))}
              </div>

              {/* Summary */}
              <div className="space-y-2 rounded-lg border bg-muted/40 p-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t(
                      "消費する応援コイン",
                      "Support coins to exchange",
                    )}
                  </span>
                  <span className="font-bold">
                    {selectedPkg.coinAmount.toLocaleString()}
                    {t("コイン", " coins")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("交換額", "Exchange value")}
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    ¥{selectedPkg.amazonPointYen.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-muted-foreground">
                    {t("申請後の残高", "Balance after request")}
                  </span>
                  <span className="font-semibold">
                    {Math.max(
                      0,
                      props.exchangeablePremiumBalance - selectedPkg.coinAmount,
                    ).toLocaleString()}
                    {t("コイン", " coins")}
                  </span>
                </div>
              </div>

              <p className="text-muted-foreground text-xs">
                {t(
                  `交換可能な応援コイン残高: ${props.exchangeablePremiumBalance.toLocaleString()} コイン（他ユーザから推されて受け取ったコインのみ）`,
                  `Exchangeable support coin balance: ${props.exchangeablePremiumBalance.toLocaleString()} coins (only coins received from other users)`,
                )}
              </p>

              <p className="text-muted-foreground text-xs">
                {t(
                  `現在の申請枠: ${remainingSlots} / ${AMAZON_EXCHANGE_MAX_PENDING}。承認されるまで枠は回復しません。`,
                  `Remaining slots: ${remainingSlots} / ${AMAZON_EXCHANGE_MAX_PENDING}. Slots recover only after approval.`,
                )}
              </p>

              {props.exchangeablePremiumBalance < selectedPkg.coinAmount && (
                <p className="text-destructive text-sm">
                  {t(
                    "交換に使える応援コインが不足しています。",
                    "Insufficient support coins available for exchange.",
                  )}
                </p>
              )}

              <Button
                className="w-full"
                onClick={handleApply}
                disabled={
                  isSubmitting ||
                  remainingSlots <= 0 ||
                  props.exchangeablePremiumBalance < selectedPkg.coinAmount
                }
              >
                {isSubmitting
                  ? t("申請中...", "Submitting...")
                  : t("申請する", "Submit")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pending list */}
      {pendingRequests.length > 0 && (
        <div className="space-y-2">
          <p className="font-semibold text-sm">{t("申請中", "Pending")}</p>
          {pendingRequests.map((req) => (
            <div
              key={req.id}
              className="flex items-center justify-between rounded-lg border p-3 text-sm"
            >
              <div className="space-y-0.5">
                <p className="font-semibold">
                  ¥{req.amazonPointYen.toLocaleString()}
                  {t("分", "")} ({req.coinAmount.toLocaleString()}
                  {t("コイン", " coins")})
                </p>
                <p className="text-muted-foreground text-xs">
                  {t("申請日", "Applied")}: {formatDateTime(req.appliedAt)}
                </p>
              </div>
              <span className="rounded-full bg-yellow-100 px-2 py-0.5 font-medium text-xs text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400">
                {t("審査中", "Pending")}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Approved list */}
      {approvedRequests.length > 0 && (
        <div className="space-y-2">
          <p className="font-semibold text-sm">{t("承認済み", "Approved")}</p>
          {approvedRequests.map((req) => (
            <div
              key={req.id}
              className="space-y-2 rounded-lg border p-3 text-sm"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="font-semibold">
                    ¥{req.amazonPointYen.toLocaleString()}
                    {t("分", "")} ({req.coinAmount.toLocaleString()}
                    {t("コイン", " coins")})
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {t("承認日", "Approved")}:{" "}
                    {formatDateTime(req.approvedAt ?? 0)}
                  </p>
                </div>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-medium text-emerald-700 text-xs dark:bg-emerald-900/40 dark:text-emerald-600">
                  {t("承認済み", "Approved")}
                </span>
              </div>
              {req.amazonGiftCode && (
                <div className="rounded-md bg-muted px-3 py-2">
                  <p className="select-all font-bold font-mono text-sm tracking-widest">
                    {req.amazonGiftCode}
                  </p>
                  <p className="mt-0.5 text-muted-foreground text-xs">
                    {t("Amazonギフト券コード", "Amazon Gift Card code")}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {isLoadingList && (
        <p className="text-center text-muted-foreground text-sm">
          {t("読み込み中...", "Loading...")}
        </p>
      )}

      {!isLoadingList &&
        listData !== null &&
        listData.requests.length === 0 && (
          <p className="text-muted-foreground text-sm">
            {t("申請履歴はありません", "No exchange requests yet")}
          </p>
        )}

      <Button
        variant="ghost"
        size="sm"
        onClick={loadList}
        disabled={isLoadingList}
        className="w-full"
      >
        {t("更新", "Refresh")}
      </Button>
    </div>
  )
}
