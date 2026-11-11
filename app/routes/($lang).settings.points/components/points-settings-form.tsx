import { useContext, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { useLocation, useSearchParams } from "@remix-run/react"
import { Link, useNavigate } from "~/lib/app/locale-router"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import {
  getViewerRequestHeaders,
  getViewerRequestSessionId,
  hasViewerRequestSession,
} from "~/lib/viewer-request-headers"
import { Button } from "~/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { useLocalStorage } from "usehooks-ts"
import { useTranslation } from "~/hooks/use-translation"
import { PREMIUM_COIN_CONFIRM_STORAGE_KEY } from "~/routes/($lang).generation._index/utils/premium-coin-confirm"
import { AmazonExchangeSection } from "~/routes/($lang).settings.points/components/amazon-exchange-section"
import { CoinBalanceCard } from "~/routes/($lang).settings.points/components/coin-balance-card"
import { CoinExpiryTab } from "~/routes/($lang).settings.points/components/coin-expiry-tab"
import {
  CoinHistoryTab,
  LEDGER_PAGE_SIZE,
} from "~/routes/($lang).settings.points/components/coin-history-tab"
import { CoinSupportTab } from "~/routes/($lang).settings.points/components/coin-support-tab"
import type { LedgerItem } from "~/routes/($lang).settings.points/utils/coin-ledger"
import {
  type CachedCoinSummary,
  type ExpiringCoinLot,
  readCoinSummaryCache,
  writeCoinSummaryCache,
} from "~/routes/($lang).settings.points/utils/coin-summary-cache"
import { AuthContext } from "~/contexts/auth-context"
import { normalizeUnixTimestampSeconds } from "~/utils/normalize-unix-timestamp-seconds"

const formatCoinAmount = (value: number) => {
  return value.toLocaleString()
}

type SummaryResponse = {
  error: string | null
  data: {
    freeBalance: number
    premiumBalance: number
    totalBalance: number
    exchangeablePremiumBalance: number
    lockedExchangePremiumBalance: number
    granted: boolean
    grantedPlanType: string | null
    grantedFreeCoins: number
    grantedPremiumCoins: number
    ledger: LedgerItem[]
    expiringLots: ExpiringCoinLot[]
  } | null
}

type PremiumConfirmResponse = {
  error: string | null
  data: {
    reflected: boolean
    created: boolean
    totalCoins?: number
    paymentStatus?: string | null
  } | null
}

const normalizeLedger = (rows: unknown): LedgerItem[] => {
  if (!Array.isArray(rows)) return []

  return (rows as LedgerItem[])
    .map((row) => {
      const createdAt = normalizeUnixTimestampSeconds(row.createdAt)
      if (createdAt === null) return null

      return {
        ...row,
        createdAt,
        delta: Number(row.delta),
      }
    })
    .filter((row): row is LedgerItem => row !== null)
}

const normalizeSummaryData = (
  data: SummaryResponse["data"],
): SummaryResponse["data"] => {
  if (!data) return null

  return {
    ...data,
    ledger: normalizeLedger(data.ledger),
    expiringLots: Array.isArray(data.expiringLots)
      ? data.expiringLots
          .map((row) => {
            const expiresAt = normalizeUnixTimestampSeconds(row.expiresAt)
            if (expiresAt === null) return null

            return {
              ...row,
              expiresAt,
            }
          })
          .filter((row): row is ExpiringCoinLot => row !== null)
      : [],
  }
}

const COIN_TABS = ["history", "expiry", "support", "exchange"] as const

type CoinTab = (typeof COIN_TABS)[number]

const toCoinTab = (value: string | null): CoinTab => {
  return COIN_TABS.find((tab) => tab === value) ?? "history"
}

export function PointsSettingsForm() {
  const t = useTranslation()
  const [isPremiumCoinConfirmEnabled, setIsPremiumCoinConfirmEnabled] =
    useLocalStorage(PREMIUM_COIN_CONFIRM_STORAGE_KEY, true, {
      initializeWithValue: false,
    })
  const authContext = useContext(AuthContext)
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const checkoutState = searchParams.get("checkout")
  const checkoutSessionId = searchParams.get("session_id")

  const [activeTab, setActiveTab] = useState<CoinTab>(() =>
    toCoinTab(searchParams.get("tab")),
  )
  // タブは開いたときに初めて読み込み、開いたものは切り替えても残す
  const [visitedTabs, setVisitedTabs] = useState<ReadonlySet<CoinTab>>(
    () => new Set([activeTab]),
  )
  const [isLoading, setIsLoading] = useState(true)
  const [hasLoadError, setHasLoadError] = useState(false)
  const [balance, setBalance] = useState<CachedCoinSummary | null>(null)
  const [ledger, setLedger] = useState<LedgerItem[] | null>(null)
  const hasStartedLoadingRef = useRef(false)
  const [isPremiumPurchaseDialogOpen, setIsPremiumPurchaseDialogOpen] =
    useState(false)
  const [isConfirmingPremiumPurchase, setIsConfirmingPremiumPurchase] =
    useState(false)
  const handledPremiumCheckoutSessionRef = useRef<string | null>(null)
  const [premiumPurchaseError, setPremiumPurchaseError] = useState<string | null>(
    null,
  )
  const [confirmedPremiumCoins, setConfirmedPremiumCoins] = useState<number | null>(
    null,
  )

  const withAuthHeader = async () => {
    try {
      return await getViewerRequestHeaders({ includeJsonContentType: true })
    } catch {
      throw new Error(t("ログインが必要です", "Login required"))
    }
  }

  const loadSummary = async () => {
    if (!hasViewerRequestSession()) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setHasLoadError(false)
      const headers = await withAuthHeader()
      const response = await fetch(
        `/api/coins/summary?includeLedger=1&includeExpiringLots=1&includeLedgerLimit=${LEDGER_PAGE_SIZE}`,
        {
          method: "GET",
          headers,
        },
      )

      const json = (await response.json()) as SummaryResponse

      if (!response.ok || json.error) {
        throw new Error(json.error ?? "Failed to load points")
      }

      const data = normalizeSummaryData(json.data)

      if (data) {
        setBalance(data)
        setLedger(data.ledger)

        const viewerId = getViewerRequestSessionId()
        if (viewerId) {
          writeCoinSummaryCache(viewerId, Math.floor(Date.now() / 1000), data)
        }
      }
    } catch (error) {
      setHasLoadError(true)
      if (error instanceof Error) {
        toast(error.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (hasStartedLoadingRef.current || !hasViewerRequestSession()) {
      return
    }
    hasStartedLoadingRef.current = true

    const viewerId = getViewerRequestSessionId()
    if (viewerId) {
      const cached = readCoinSummaryCache(viewerId, Math.floor(Date.now() / 1000))
      if (cached) {
        setBalance(cached)
      }
    }

    void loadSummary()
  }, [authContext.isLoading, authContext.isLoggedIn])

  const handleTabChange = (value: string) => {
    const tab = toCoinTab(value)
    setActiveTab(tab)
    setVisitedTabs((current) => new Set([...current, tab]))

    // サーバーへの再読み込みが走らないよう、URL だけ書き換える
    const url = new URL(window.location.href)
    if (tab === "history") {
      url.searchParams.delete("tab")
    } else {
      url.searchParams.set("tab", tab)
    }
    window.history.replaceState(window.history.state, "", url)
  }

  useEffect(() => {
    if (checkoutState === "premium-cancel") {
      if (handledPremiumCheckoutSessionRef.current === "premium-cancel") {
        return
      }
      handledPremiumCheckoutSessionRef.current = "premium-cancel"
      toast.message(
        t(
          "プレミアムコインの購入をキャンセルしました",
          "Premium coin purchase was canceled",
        ),
      )
      void navigate(location.pathname, { replace: true })
      return
    }

    if (checkoutState !== "premium-success") {
      return
    }

    setIsPremiumPurchaseDialogOpen(true)
    setPremiumPurchaseError(null)

    if (authContext.isLoading) {
      setIsConfirmingPremiumPurchase(true)
      return
    }

    if (!authContext.isLoggedIn) {
      setIsConfirmingPremiumPurchase(false)
      setPremiumPurchaseError(
        t(
          "ログイン状態の確認中に購入完了処理を開始できませんでした。再読み込み後にもう一度ご確認ください。",
          "Could not start purchase confirmation because login state was not ready. Please reload and check again.",
        ),
      )
      return
    }

    if (checkoutSessionId && !checkoutSessionId.startsWith("cs_")) {
      handledPremiumCheckoutSessionRef.current = checkoutSessionId
      setConfirmedPremiumCoins(null)
      setPremiumPurchaseError(
        t(
          "購入情報が不正です。もう一度購入画面からお試しください。",
          "Invalid checkout session. Please retry from the purchase dialog.",
        ),
      )
      void navigate(location.pathname, { replace: true })
      return
    }

    if (!checkoutSessionId) {
      handledPremiumCheckoutSessionRef.current = "missing-session"
      setConfirmedPremiumCoins(null)
      setPremiumPurchaseError(
        t(
          "購入情報の確認に必要なセッションIDが見つかりませんでした",
          "Missing checkout session ID for premium coin confirmation",
        ),
      )
      return
    }

    const checkoutKey = checkoutSessionId
    if (handledPremiumCheckoutSessionRef.current === checkoutKey) {
      return
    }
    handledPremiumCheckoutSessionRef.current = checkoutKey

    const confirmPremiumPurchase = async () => {
      try {
        setIsConfirmingPremiumPurchase(true)

        const headers = await withAuthHeader()
        const response = await fetch("/api/stripe/premium-coins-confirm", {
          method: "POST",
          headers,
          body: JSON.stringify({ sessionId: checkoutSessionId }),
        })

        const json = (await response.json()) as PremiumConfirmResponse

        const paymentStatus = json.data?.paymentStatus ?? null

        if (
          !response.ok ||
          json.error ||
          (!json.data?.reflected &&
            paymentStatus !== "rate_limited" &&
            paymentStatus !== "pending" &&
            paymentStatus !== "unpaid")
        ) {
          throw new Error(
            json.error ??
              (json.data?.paymentStatus === "paid"
                ? t(
                    "購入内容の反映に失敗しました。履歴を更新しても反映されない場合はお問い合わせください",
                    "Failed to reflect the purchase. If it still does not appear after refreshing history, please contact support.",
                  )
                : t(
                    "購入完了を確認できませんでした",
                    "Could not confirm the completed purchase",
                  )),
          )
        }

        if (!json.data?.reflected && paymentStatus === "rate_limited") {
          toast.message(
            t(
              "決済は完了しています。現在反映処理が混み合っているため、しばらくしてから残高をご確認ください。",
              "Your payment is complete. Reflection is temporarily delayed due to high load. Please check your balance again shortly.",
            ),
          )
          setIsPremiumPurchaseDialogOpen(false)
          await navigate(location.pathname, { replace: true })
          return
        }

        // コンビニ払いなど後から支払う方法では、決済画面から戻った時点ではまだ払われていない
        if (!json.data?.reflected && paymentStatus === "unpaid") {
          toast.message(
            t(
              "コンビニでのお支払いを待っています。お支払い番号は決済画面とメールでお知らせしています。お支払いが確認されると、コインが付きます。",
              "Waiting for your convenience store payment. Use the payment number shown at checkout and sent by email. Coins are added once payment is confirmed.",
            ),
          )
          setIsPremiumPurchaseDialogOpen(false)
          await navigate(location.pathname, { replace: true })
          return
        }

        if (!json.data?.reflected && paymentStatus === "pending") {
          toast.message(
            t(
              "決済確認中です。しばらくしてから残高をご確認ください。",
              "Payment confirmation is in progress. Please check your balance again shortly.",
            ),
          )
          setIsPremiumPurchaseDialogOpen(false)
          await navigate(location.pathname, { replace: true })
          return
        }

        setConfirmedPremiumCoins(json.data?.totalCoins ?? null)
        await loadSummary()
        await navigate(location.pathname, { replace: true })
      } catch (error) {
        setConfirmedPremiumCoins(null)
        setPremiumPurchaseError(
          error instanceof Error
            ? error.message
            : t("エラーが発生しました", "An error occurred"),
        )
      } finally {
        setIsConfirmingPremiumPurchase(false)
      }
    }

    void confirmPremiumPurchase()
  }, [
    authContext.isLoading,
    authContext.isLoggedIn,
    checkoutSessionId,
    checkoutState,
    location.pathname,
    navigate,
    t,
  ])

  return (
    <div className="space-y-4">
      <Dialog
        open={isPremiumPurchaseDialogOpen}
        onOpenChange={setIsPremiumPurchaseDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("プレミアムコイン購入完了", "Premium coin purchase complete")}
            </DialogTitle>
            <DialogDescription>
              {isConfirmingPremiumPurchase
                ? t(
                    "購入内容を反映しています。残高と履歴を更新中です。",
                    "Applying your purchase. Updating balance and history.",
                  )
                : premiumPurchaseError
                  ? premiumPurchaseError
                  : confirmedPremiumCoins !== null
                    ? t(
                        `${formatCoinAmount(confirmedPremiumCoins)}枚のプレミアムコインを反映しました。残高と履歴を更新済みです。`,
                        `${formatCoinAmount(confirmedPremiumCoins)} premium coins were added. Your balance and history have been refreshed.`,
                      )
                    : t(
                        "購入完了を確認しました。",
                        "Your purchase has been confirmed.",
                      )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            {premiumPurchaseError ? (
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                {t("再読み込み", "Reload")}
              </Button>
            ) : null}
            <Button
              onClick={() => setIsPremiumPurchaseDialogOpen(false)}
              disabled={isConfirmingPremiumPurchase}
            >
              {t("閉じる", "Close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CoinBalanceCard
        summary={balance}
        isLoading={isLoading}
        hasError={hasLoadError}
        onRetry={() => void loadSummary()}
        isPremiumCoinConfirmEnabled={isPremiumCoinConfirmEnabled}
        onPremiumCoinConfirmChange={setIsPremiumCoinConfirmEnabled}
      />

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid h-11 w-full grid-cols-4">
          <TabsTrigger value="history" className="h-9 px-1">
            {t("履歴", "History")}
          </TabsTrigger>
          <TabsTrigger value="expiry" className="h-9 px-1">
            {t("有効期限", "Expiry")}
          </TabsTrigger>
          <TabsTrigger value="support" className="h-9 px-1">
            {t("推し", "Support")}
          </TabsTrigger>
          <TabsTrigger value="exchange" className="h-9 px-1">
            {t("ギフト券", "Gift cards")}
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="history"
          forceMount
          className="mt-4 data-[state=inactive]:hidden"
        >
          <CoinHistoryTab
            ledger={ledger}
            isLoading={isLoading}
            onRefresh={() => void loadSummary()}
            normalizeLedger={normalizeLedger}
          />
        </TabsContent>
        <TabsContent
          value="expiry"
          forceMount
          className="mt-4 data-[state=inactive]:hidden"
        >
          {visitedTabs.has("expiry") && <CoinExpiryTab summary={balance} />}
        </TabsContent>
        <TabsContent
          value="support"
          forceMount
          className="mt-4 data-[state=inactive]:hidden"
        >
          {visitedTabs.has("support") && <CoinSupportTab />}
        </TabsContent>
        <TabsContent
          value="exchange"
          forceMount
          className="mt-4 data-[state=inactive]:hidden"
        >
          {visitedTabs.has("exchange") && (
            <AmazonExchangeSection
              premiumBalance={balance?.premiumBalance ?? 0}
              exchangeablePremiumBalance={
                balance?.exchangeablePremiumBalance ?? 0
              }
              lockedExchangePremiumBalance={
                balance?.lockedExchangePremiumBalance ?? 0
              }
              isBalanceLoading={balance === null}
              onApplied={() => void loadSummary()}
            />
          )}
        </TabsContent>
      </Tabs>

      <div className="flex flex-wrap gap-x-4 gap-y-1 border-t pt-4 text-muted-foreground text-xs">
        <Link className="hover:underline" to="/help?tab=coins">
          {t("コインのガイド", "Coin guide")}
        </Link>
        <Link className="hover:underline" to="/premium-coins/policy">
          {t("プレミアムコイン規約・ポリシー", "Premium Coin Policy")}
        </Link>
        <Link
          className="hover:underline"
          to="/specified-commercial-transaction-act"
        >
          {t(
            "特定商取引法に基づく表記",
            "Specified Commercial Transaction Act",
          )}
        </Link>
      </div>
    </div>
  )
}
