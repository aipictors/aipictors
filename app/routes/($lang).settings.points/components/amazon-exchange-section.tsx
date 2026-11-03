import { Check, Copy } from "lucide-react"
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
import { Skeleton } from "~/components/ui/skeleton"
import { useTranslation } from "~/hooks/use-translation"
import {
  AMAZON_EXCHANGE_MAX_PENDING,
  AMAZON_EXCHANGE_PACKAGES,
  type AmazonExchangePackageId,
} from "~/lib/amazon-exchange"
import { cn } from "~/lib/utils"
import { getViewerRequestHeaders } from "~/lib/viewer-request-headers"
import type { AmazonExchangeRequest } from "~/routes/api.coins.amazon-exchange/route"
import { normalizeUnixTimestampSeconds } from "~/utils/normalize-unix-timestamp-seconds"

const PACKAGE_OPTIONS = Object.values(AMAZON_EXCHANGE_PACKAGES)

const SMALLEST_PACKAGE = PACKAGE_OPTIONS.reduce((smallest, pkg) =>
  pkg.coinAmount < smallest.coinAmount ? pkg : smallest,
)

const MIN_EXCHANGE_COINS = SMALLEST_PACKAGE.coinAmount

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
  remainingSlots:
    typeof data?.remainingSlots === "number"
      ? data.remainingSlots
      : AMAZON_EXCHANGE_MAX_PENDING,
})

export function AmazonExchangeSection(props: {
  premiumBalance: number
  exchangeablePremiumBalance: number
  lockedExchangePremiumBalance?: number
  isBalanceLoading?: boolean
  /** 申請できたとき（残高を取り直す） */
  onApplied?: () => void
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
      props.onApplied?.()
      await loadList()
    } catch (e) {
      if (e instanceof Error) toast.error(e.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      toast.success(t("コードをコピーしました", "Code copied"))
    } catch {
      toast.error(t("コピーできませんでした", "Could not copy"))
    }
  }

  const requests = listData?.requests ?? []
  const remainingSlots = listData?.remainingSlots ?? AMAZON_EXCHANGE_MAX_PENDING
  const lockedCoins = props.lockedExchangePremiumBalance ?? 0
  const missingCoins = Math.max(
    0,
    MIN_EXCHANGE_COINS - props.exchangeablePremiumBalance,
  )
  const progressPercent = Math.min(
    100,
    (props.exchangeablePremiumBalance / MIN_EXCHANGE_COINS) * 100,
  )
  const isApplicable = missingCoins === 0 && remainingSlots > 0

  return (
    <div className="space-y-4">
      <div className="space-y-3 rounded-lg border p-4">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-muted-foreground text-xs">
              {t("交換できる応援コイン", "Support coins you can exchange")}
            </p>
            {props.isBalanceLoading ? (
              <Skeleton className="mt-1.5 h-8 w-24" />
            ) : (
              <p className="mt-0.5 font-bold text-3xl tabular-nums">
                {props.exchangeablePremiumBalance.toLocaleString()}
              </p>
            )}
          </div>
          {lockedCoins > 0 && (
            <p className="shrink-0 text-muted-foreground text-xs tabular-nums">
              {t(
                `申請中 ${lockedCoins.toLocaleString()} 枚`,
                `${lockedCoins.toLocaleString()} pending`,
              )}
            </p>
          )}
        </div>

        {!props.isBalanceLoading && missingCoins > 0 && (
          <div className="space-y-1.5">
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-muted-foreground text-xs">
              {t(
                `あと ${missingCoins.toLocaleString()} 枚で交換できます`,
                `${missingCoins.toLocaleString()} more coins to exchange`,
              )}
            </p>
          </div>
        )}

        <p className="text-muted-foreground text-sm leading-6">
          {t(
            `ほかのユーザーに推してもらって受け取ったコインを、Amazonギフト券に交換できます（${SMALLEST_PACKAGE.coinAmount.toLocaleString()} 枚で ${SMALLEST_PACKAGE.amazonPointYen.toLocaleString()} 円分）。購入したコインは交換できません。同時に申請できるのは ${AMAZON_EXCHANGE_MAX_PENDING} 件までです。`,
            `Coins you received as support from other users can be exchanged for Amazon Gift Cards (${SMALLEST_PACKAGE.coinAmount.toLocaleString()} coins for ¥${SMALLEST_PACKAGE.amazonPointYen.toLocaleString()}). Purchased coins cannot be exchanged. Up to ${AMAZON_EXCHANGE_MAX_PENDING} requests can be pending at a time.`,
          )}
        </p>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              className="w-full sm:w-auto"
              disabled={props.isBalanceLoading || !isApplicable}
            >
              {remainingSlots <= 0
                ? t(`申請できるのは${AMAZON_EXCHANGE_MAX_PENDING}件までです`, "Request limit reached")
                : t("交換を申請する", "Request exchange")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {t("Amazonギフト券に交換", "Exchange for Amazon Gift Card")}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div
                className="space-y-2"
                role="radiogroup"
                aria-label={t("交換する内容", "Exchange option")}
              >
                {PACKAGE_OPTIONS.map((pkg) => {
                  const isSelected = selectedPackageId === pkg.id
                  const isAvailable =
                    props.exchangeablePremiumBalance >= pkg.coinAmount

                  return (
                    <button
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      key={pkg.id}
                      onClick={() => setSelectedPackageId(pkg.id)}
                      className={cn(
                        "flex min-h-14 w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors",
                        isSelected
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "hover:bg-muted",
                        !isAvailable && "text-muted-foreground",
                      )}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold">
                          {t(
                            `${pkg.amazonPointYen.toLocaleString()} 円分`,
                            `¥${pkg.amazonPointYen.toLocaleString()}`,
                          )}
                        </span>
                        <span className="block text-muted-foreground text-xs tabular-nums">
                          {t(
                            `${pkg.coinAmount.toLocaleString()} 枚`,
                            `${pkg.coinAmount.toLocaleString()} coins`,
                          )}
                        </span>
                      </span>
                      {isSelected && (
                        <Check className="h-5 w-5 shrink-0 text-primary" />
                      )}
                    </button>
                  )
                })}
              </div>

              <dl className="space-y-1.5 rounded-lg bg-muted/50 p-3 text-sm tabular-nums">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">
                    {t("いま交換できる枚数", "Available now")}
                  </dt>
                  <dd>{props.exchangeablePremiumBalance.toLocaleString()}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">
                    {t("申請後の枚数", "After request")}
                  </dt>
                  <dd className="font-semibold">
                    {Math.max(
                      0,
                      props.exchangeablePremiumBalance - selectedPkg.coinAmount,
                    ).toLocaleString()}
                  </dd>
                </div>
              </dl>

              <p className="text-muted-foreground text-xs leading-5">
                {t(
                  `申請中のものが承認されるまで、次の申請枠は空きません（残り ${remainingSlots} 件）。`,
                  `A request slot only frees up after approval (${remainingSlots} left).`,
                )}
              </p>

              {props.exchangeablePremiumBalance < selectedPkg.coinAmount && (
                <p className="text-destructive text-sm">
                  {t(
                    "交換に使える応援コインが足りません。",
                    "Not enough support coins to exchange.",
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
                  : t(
                      `${selectedPkg.amazonPointYen.toLocaleString()} 円分を申請する`,
                      `Request ¥${selectedPkg.amazonPointYen.toLocaleString()}`,
                    )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <section>
        <h3 className="mb-1.5 font-medium text-muted-foreground text-xs">
          {t("申請の履歴", "Requests")}
        </h3>
        {listData === null && isLoadingList ? (
          <Skeleton className="h-14 w-full rounded-lg" />
        ) : requests.length === 0 ? (
          <p className="rounded-lg border border-dashed py-8 text-center text-muted-foreground text-sm">
            {t("まだ申請はありません", "No requests yet")}
          </p>
        ) : (
          <ul className="divide-y rounded-lg border">
            {requests.map((req) => (
              <li key={req.id} className="space-y-2 px-3 py-2.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm tabular-nums">
                      {t(
                        `${req.amazonPointYen.toLocaleString()} 円分`,
                        `¥${req.amazonPointYen.toLocaleString()}`,
                      )}
                      <span className="ml-1.5 font-normal text-muted-foreground text-xs">
                        {t(
                          `${req.coinAmount.toLocaleString()} 枚`,
                          `${req.coinAmount.toLocaleString()} coins`,
                        )}
                      </span>
                    </p>
                    <p className="text-muted-foreground text-xs tabular-nums">
                      {formatDateTime(
                        req.status === "APPROVED"
                          ? (req.approvedAt ?? req.appliedAt)
                          : req.appliedAt,
                      )}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 font-medium text-xs",
                      req.status === "APPROVED"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
                    )}
                  >
                    {req.status === "APPROVED"
                      ? t("承認済み", "Approved")
                      : t("審査中", "Pending")}
                  </span>
                </div>
                {req.amazonGiftCode && (
                  <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-1.5">
                    <p className="min-w-0 flex-1 select-all break-all font-mono font-semibold text-sm tracking-wider">
                      {req.amazonGiftCode}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 shrink-0"
                      onClick={() =>
                        void handleCopyCode(req.amazonGiftCode ?? "")
                      }
                      aria-label={t("コードをコピー", "Copy code")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
