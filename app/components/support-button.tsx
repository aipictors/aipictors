/**
 * 推しボタン — ユーザーを支援する際に使用
 * - 指定コイン数に対する消費内訳と獲得ptのプレビュー表示
 * - ポイント不足時にコイン購入決済ができる
 */
import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { CircleHelp, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { CoinIcon } from "~/components/coin-icon"
import {
  FreeSupportCoinIcon,
  PremiumSupportCoinIcon,
} from "~/components/support-coin-icons"
import { SupportSuccessDialog } from "~/components/support-success-dialog"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { getViewerRequestHeaders } from "~/lib/viewer-request-headers"
import { PurchasePremiumCoinsDialog } from "~/routes/($lang).settings.points/components/purchase-premium-coins-dialog"
import { consumeSupportSuccessDialogOpportunity } from "~/utils/support-success-dialog"

type Props = {
  targetUserId: string
  targetUserName?: string
  targetUserIconUrl?: string | null
  freeCoinBalance: number
  premiumCoinBalance: number
  onSuccess?: () => void
  triggerClassName?: string
}

type CoinBreakdown = {
  totalCoinsUsed: number
  freeCoinsUsed: number
  premiumCoinsUsed: number
  totalPt: number
}

type SupportMode = "default" | "custom"

function CoinUsageIcon(props: {
  breakdown: CoinBreakdown | null
  freeCoinBalance: number
  premiumCoinBalance: number
}) {
  if (props.breakdown?.freeCoinsUsed && props.breakdown.premiumCoinsUsed) {
    return (
      <span className="flex items-center gap-1">
        <CoinIcon className="h-4 w-4 shrink-0" />
        <PremiumSupportCoinIcon className="h-4 w-4 shrink-0" />
      </span>
    )
  }

  if (props.breakdown?.premiumCoinsUsed) {
    return <PremiumSupportCoinIcon className="h-4 w-4 shrink-0" />
  }

  if (props.breakdown?.freeCoinsUsed || props.freeCoinBalance > 0) {
    return <CoinIcon className="h-4 w-4 shrink-0" />
  }

  if (props.premiumCoinBalance > 0) {
    return <PremiumSupportCoinIcon className="h-4 w-4 shrink-0" />
  }

  return <CoinIcon className="h-4 w-4 shrink-0" />
}

/**
 * フリーコイン優先でコインを消費してポイントを計算
 * フリーコイン 1pt / プレミアムコイン 10pt
 */
const calculateCoinBreakdown = (
  coinAmount: number,
  freeCoinBalance: number,
  premiumCoinBalance: number,
): CoinBreakdown | null => {
  if (!Number.isInteger(coinAmount) || coinAmount <= 0) return null
  if (coinAmount > freeCoinBalance + premiumCoinBalance) return null

  const freeCoinsUsed = Math.min(freeCoinBalance, coinAmount)
  const remainingCoins = coinAmount - freeCoinsUsed
  const premiumCoinsUsed = Math.min(premiumCoinBalance, remainingCoins)

  if (freeCoinsUsed + premiumCoinsUsed !== coinAmount) {
    return null
  }

  return {
    totalCoinsUsed: coinAmount,
    freeCoinsUsed,
    premiumCoinsUsed,
    totalPt: freeCoinsUsed + premiumCoinsUsed * 10,
  }
}

const calculateCustomCoinBreakdown = (
  freeCoinAmount: number,
  premiumCoinAmount: number,
  freeCoinBalance: number,
  premiumCoinBalance: number,
): CoinBreakdown | null => {
  if (!Number.isInteger(freeCoinAmount) || freeCoinAmount < 0) return null
  if (!Number.isInteger(premiumCoinAmount) || premiumCoinAmount < 0) return null

  const totalCoinsUsed = freeCoinAmount + premiumCoinAmount
  if (totalCoinsUsed <= 0) return null

  if (
    freeCoinAmount > freeCoinBalance ||
    premiumCoinAmount > premiumCoinBalance
  ) {
    return null
  }

  return {
    totalCoinsUsed,
    freeCoinsUsed: freeCoinAmount,
    premiumCoinsUsed: premiumCoinAmount,
    totalPt: freeCoinAmount + premiumCoinAmount * 10,
  }
}

const QUICK_COIN_OPTIONS = [10, 30, 100, 300] as const
const ADJUSTMENT_STEPS = [1, 10, 100] as const

export function SupportButton({
  targetUserId,
  targetUserName,
  targetUserIconUrl,
  freeCoinBalance,
  premiumCoinBalance,
  onSuccess,
  triggerClassName,
}: Props) {
  const t = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [isInfoOpen, setIsInfoOpen] = useState(false)
  const [supportMode, setSupportMode] = useState<SupportMode>("default")
  const [coinAmount, setCoinAmount] = useState<string>("10")
  const [customFreeCoinAmount, setCustomFreeCoinAmount] = useState<string>("0")
  const [customPremiumCoinAmount, setCustomPremiumCoinAmount] =
    useState<string>("0")
  const [isLoading, setIsLoading] = useState(false)
  const [showCoinPurchase, setShowCoinPurchase] = useState(false)
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)
  const [successThankYouMessage, setSuccessThankYouMessage] = useState("")
  const [successTotalPt, setSuccessTotalPt] = useState<number | null>(null)
  const [currentFreeCoinBalance, setCurrentFreeCoinBalance] =
    useState(freeCoinBalance)
  const [currentPremiumCoinBalance, setCurrentPremiumCoinBalance] =
    useState(premiumCoinBalance)

  const { data: targetUserData } = useQuery(targetSupportUserQuery, {
    variables: {
      userId: targetUserId,
    },
  })

  const resolvedTargetUser = targetUserData?.user
  const resolvedTargetUserName = resolvedTargetUser?.name ?? targetUserName
  const resolvedTargetUserIconUrl =
    resolvedTargetUser?.iconUrl ?? targetUserIconUrl
  const resolvedThankYouMessage =
    resolvedTargetUser?.supportThankYouMessage ??
    t(
      "応援してくれてありがとう！みんなのためにこれからも頑張るね！",
      "Thank you for your support! I will keep doing my best for everyone!",
    )

  useEffect(() => {
    setCurrentFreeCoinBalance(freeCoinBalance)
  }, [freeCoinBalance])

  useEffect(() => {
    setCurrentPremiumCoinBalance(premiumCoinBalance)
  }, [premiumCoinBalance])

  const reloadBalance = async () => {
    try {
      const headers = await getViewerRequestHeaders({
        includeJsonContentType: true,
      })
      const res = await fetch("/api/coins/summary", {
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

      if (!res.ok || json.error || !json.data) {
        return
      }

      setCurrentFreeCoinBalance(json.data.freeBalance ?? 0)
      setCurrentPremiumCoinBalance(json.data.premiumBalance ?? 0)
    } catch {
      return
    }
  }

  const defaultBreakdown = calculateCoinBreakdown(
    Number(coinAmount) || 0,
    currentFreeCoinBalance,
    currentPremiumCoinBalance,
  )

  const customBreakdown = calculateCustomCoinBreakdown(
    Number(customFreeCoinAmount) || 0,
    Number(customPremiumCoinAmount) || 0,
    currentFreeCoinBalance,
    currentPremiumCoinBalance,
  )

  const breakdown =
    supportMode === "default" ? defaultBreakdown : customBreakdown
  const canSupport = breakdown !== null

  const totalAvailableCoins = currentFreeCoinBalance + currentPremiumCoinBalance

  const handleCoinAmountChange = (value: string) => {
    const numeric = Number.parseInt(value.replaceAll(/[^0-9]/g, ""), 10)
    setCoinAmount(Number.isNaN(numeric) ? "" : String(numeric))
  }

  const handleCustomFreeCoinAmountChange = (value: string) => {
    const numeric = Number.parseInt(value.replaceAll(/[^0-9]/g, ""), 10)
    setCustomFreeCoinAmount(Number.isNaN(numeric) ? "" : String(numeric))
  }

  const handleCustomPremiumCoinAmountChange = (value: string) => {
    const numeric = Number.parseInt(value.replaceAll(/[^0-9]/g, ""), 10)
    setCustomPremiumCoinAmount(Number.isNaN(numeric) ? "" : String(numeric))
  }

  const handleAdjustment = (delta: number) => {
    const nextValue = Math.max(1, (Number(coinAmount) || 0) + delta)
    setCoinAmount(String(nextValue))
  }

  const handleCustomAdjustment = (
    target: "free" | "premium",
    delta: number,
  ) => {
    if (target === "free") {
      const nextValue = Math.max(0, (Number(customFreeCoinAmount) || 0) + delta)
      setCustomFreeCoinAmount(String(nextValue))
      return
    }

    const nextValue = Math.max(
      0,
      (Number(customPremiumCoinAmount) || 0) + delta,
    )
    setCustomPremiumCoinAmount(String(nextValue))
  }

  // モーダルが開かれた時に初期化
  useEffect(() => {
    if (!isOpen) return

    setSupportMode("default")
    setCoinAmount("10")
    const free = Math.min(10, currentFreeCoinBalance)
    const premium = free === 0 && currentPremiumCoinBalance > 0 ? 1 : 0
    setCustomFreeCoinAmount(String(free))
    setCustomPremiumCoinAmount(String(premium))
  }, [isOpen, currentFreeCoinBalance, currentPremiumCoinBalance])

  // タブが custom に切り替わった時に、デフォルトタブの現在値を反映
  useEffect(() => {
    if (supportMode !== "custom") return

    // defaultBreakdownを依存配列に入れないことで、
    // デフォルトタブの数字変更の影響を受けない
    if (defaultBreakdown) {
      setCustomFreeCoinAmount(String(defaultBreakdown.freeCoinsUsed))
      setCustomPremiumCoinAmount(String(defaultBreakdown.premiumCoinsUsed))
    }
  }, [supportMode, defaultBreakdown])

  const handleSupport = async () => {
    if (!canSupport || !breakdown) return

    try {
      setIsLoading(true)
      const headers = await getViewerRequestHeaders({
        includeJsonContentType: true,
      })

      // フリーコインとプレミアムコインに分割して送信
      const requests = []

      if (breakdown.freeCoinsUsed > 0) {
        requests.push(
          fetch("/api/coins/support", {
            method: "POST",
            headers,
            body: JSON.stringify({
              recipientUserId: targetUserId,
              coinType: "FREE",
              amount: breakdown.freeCoinsUsed,
            }),
          }),
        )
      }

      if (breakdown.premiumCoinsUsed > 0) {
        requests.push(
          fetch("/api/coins/support", {
            method: "POST",
            headers,
            body: JSON.stringify({
              recipientUserId: targetUserId,
              coinType: "PREMIUM",
              amount: breakdown.premiumCoinsUsed,
            }),
          }),
        )
      }

      const responses = await Promise.all(requests)
      const jsonResponses = await Promise.all(
        responses.map(
          (res) =>
            res.json() as Promise<{
              error?: string
              data?: { success: boolean }
            }>,
        ),
      )

      const hasError =
        responses.some((res) => !res.ok) ||
        jsonResponses.some((json) => json.error)

      if (hasError) {
        const errorMsg = jsonResponses.find((j) => j.error)?.error
        if (errorMsg === "Insufficient coins") {
          setShowCoinPurchase(true)
        }
        toast.error(errorMsg ?? t("推しに失敗しました", "Support failed"))
        return
      }

      setCurrentFreeCoinBalance((current) =>
        Math.max(0, current - breakdown.freeCoinsUsed),
      )
      setCurrentPremiumCoinBalance((current) =>
        Math.max(0, current - breakdown.premiumCoinsUsed),
      )

      if (consumeSupportSuccessDialogOpportunity(targetUserId)) {
        setSuccessThankYouMessage(resolvedThankYouMessage)
        setSuccessTotalPt(breakdown.totalPt)
        setIsSuccessOpen(true)
      }
      setIsOpen(false)
      setSupportMode("default")
      setCoinAmount("10")
      onSuccess?.()
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const supportButtonClassName = triggerClassName
    ? triggerClassName.includes("w-full")
      ? triggerClassName.replace("w-full", "flex-1").trim()
      : triggerClassName
    : "flex-1"

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="shrink-0 rounded-full"
          aria-label={t("推すとは", "What is support?")}
          title={t("推すとは", "What is support?")}
          onClick={() => setIsInfoOpen(true)}
        >
          <CircleHelp className="h-4 w-4" />
        </Button>

        <Button
          onClick={() => {
            void reloadBalance()
            setIsOpen(true)
          }}
          className={cn(supportButtonClassName, !triggerClassName && "w-full")}
          variant="default"
        >
          {t("推す", "Support")}
        </Button>
      </div>

      <Dialog open={isInfoOpen} onOpenChange={setIsInfoOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("推すとは", "What is support?")}</DialogTitle>
            <DialogDescription>
              {t(
                "お気に入りのクリエイターにコインを送って、支援や応援の気持ちを届ける機能です。",
                "Support lets you send coins to your favorite creators and show your appreciation.",
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm leading-relaxed">
            <p>
              {t(
                "自分のお気に入りのクリエイターを支援・応援でき、送ったコインに応じて推し pt が加算されます。",
                "You can support your favorite creators, and sent coins are converted into support pt.",
              )}
            </p>
            <p className="text-muted-foreground">
              {t(
                "フリーコインは 1 coin = 1pt、プレミアムコインは 1 coin = 10pt として反映されます。",
                "Free coins count as 1pt each, and premium coins count as 10pt each.",
              )}
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-h-[90svh] w-[calc(100vw-1rem)] max-w-md overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center">
              {t("推しポイント付与", "Support")}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* 対象ユーザー情報 */}
            <div>
              <Label className="text-muted-foreground text-xs">
                {t("付与先", "Target")}
              </Label>
              <div className="mt-1 flex items-center gap-2">
                {resolvedTargetUserIconUrl && (
                  <img
                    src={resolvedTargetUserIconUrl}
                    alt={resolvedTargetUserName || "user"}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                )}
                <p className="font-semibold text-sm">
                  {resolvedTargetUserName || targetUserId}
                </p>
              </div>
            </div>

            {/* 現在の保有コイン */}
            <div>
              <Label className="text-muted-foreground text-xs">
                {t("現在の保有コイン", "Current coins")}
              </Label>
              <div className="mt-2 rounded-xl border bg-muted/40 px-3 py-2.5">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                  <span className="font-medium text-muted-foreground">
                    {t("保有", "Balance")}
                  </span>
                  <span className="flex items-center gap-1.5 font-semibold">
                    <FreeSupportCoinIcon className="h-4 w-4" />
                    <span>F {currentFreeCoinBalance}</span>
                  </span>
                  <span className="flex items-center gap-1.5 font-semibold">
                    <PremiumSupportCoinIcon className="h-4 w-4" />
                    <span>P {currentPremiumCoinBalance}</span>
                  </span>
                </div>
              </div>
            </div>

            <Tabs
              value={supportMode}
              onValueChange={(value) => setSupportMode(value as SupportMode)}
              className="space-y-3"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="default">
                  {t("デフォルト", "Default")}
                </TabsTrigger>
                <TabsTrigger value="custom">
                  {t("カスタム", "Custom")}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="default" className="space-y-3">
                <div className="space-y-3">
                  <Label>
                    {t("テンプレートから選択", "Choose a template")}
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {QUICK_COIN_OPTIONS.map((option) =>
                      (() => {
                        const optionBreakdown = calculateCoinBreakdown(
                          option,
                          currentFreeCoinBalance,
                          currentPremiumCoinBalance,
                        )

                        return (
                          <Button
                            key={option}
                            type="button"
                            variant={
                              Number(coinAmount) === option
                                ? "default"
                                : "outline"
                            }
                            className="h-14 justify-between rounded-xl px-4"
                            onClick={() => setCoinAmount(String(option))}
                            disabled={isLoading}
                          >
                            <span className="flex items-center gap-2">
                              <CoinUsageIcon
                                breakdown={optionBreakdown}
                                freeCoinBalance={currentFreeCoinBalance}
                                premiumCoinBalance={currentPremiumCoinBalance}
                              />
                              {option.toLocaleString()}
                            </span>
                            <span className="text-xs opacity-80">coin</span>
                          </Button>
                        )
                      })(),
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="amount" className="text-xs">
                    {t("使用コイン数", "Coins to use")}
                  </Label>
                  <div className="mt-2 flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleAdjustment(-1)}
                      disabled={isLoading}
                    >
                      -
                    </Button>
                    <Input
                      id="amount"
                      type="text"
                      inputMode="numeric"
                      min="1"
                      max="999999"
                      value={coinAmount}
                      onChange={(e) => handleCoinAmountChange(e.target.value)}
                      className="text-center font-bold text-lg"
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleAdjustment(1)}
                      disabled={isLoading}
                    >
                      +
                    </Button>
                    <span className="text-muted-foreground text-xs">coin</span>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {ADJUSTMENT_STEPS.map((step) => (
                      <Button
                        key={step}
                        type="button"
                        variant="outline"
                        className="text-xs"
                        onClick={() => handleAdjustment(step)}
                        disabled={isLoading}
                      >
                        +{step}
                      </Button>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="custom" className="space-y-3">
                <p className="text-muted-foreground text-xs leading-5">
                  {t(
                    "フリーコインとプレミアムコインの使用量を個別に指定できます。",
                    "You can set free and premium coin usage individually.",
                  )}
                </p>

                <div>
                  <Label htmlFor="custom-free-amount" className="text-xs">
                    {t("フリーコイン使用数", "Free coins to use")}
                  </Label>
                  <div className="mt-2 flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleCustomAdjustment("free", -1)}
                      disabled={isLoading}
                    >
                      -
                    </Button>
                    <Input
                      id="custom-free-amount"
                      type="text"
                      inputMode="numeric"
                      min="0"
                      max="999999"
                      value={customFreeCoinAmount}
                      onChange={(e) =>
                        handleCustomFreeCoinAmountChange(e.target.value)
                      }
                      className="text-center font-bold"
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleCustomAdjustment("free", 1)}
                      disabled={isLoading}
                    >
                      +
                    </Button>
                    <span className="text-muted-foreground text-xs">coin</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="custom-premium-amount" className="text-xs">
                    {t("プレミアムコイン使用数", "Premium coins to use")}
                  </Label>
                  <div className="mt-2 flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleCustomAdjustment("premium", -1)}
                      disabled={isLoading}
                    >
                      -
                    </Button>
                    <Input
                      id="custom-premium-amount"
                      type="text"
                      inputMode="numeric"
                      min="0"
                      max="999999"
                      value={customPremiumCoinAmount}
                      onChange={(e) =>
                        handleCustomPremiumCoinAmountChange(e.target.value)
                      }
                      className="text-center font-bold"
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleCustomAdjustment("premium", 1)}
                      disabled={isLoading}
                    >
                      +
                    </Button>
                    <span className="text-muted-foreground text-xs">coin</span>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* 消費コイン内訳 */}
            {breakdown && (
              <div className="rounded-lg border bg-muted/50 p-3">
                <p className="mb-2 text-muted-foreground text-xs">
                  {t("コイン消費内訳", "Coin breakdown")}
                </p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>{t("使用コイン数", "Coins used")}：</span>
                    <span className="font-semibold">
                      {breakdown.totalCoinsUsed}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("フリーコイン", "Free coins")}：</span>
                    <span className="font-semibold">
                      -{breakdown.freeCoinsUsed}
                    </span>
                  </div>
                  {breakdown.premiumCoinsUsed > 0 && (
                    <div className="flex justify-between">
                      <span>{t("プレミアムコイン", "Premium coins")}：</span>
                      <span className="font-semibold">
                        -{breakdown.premiumCoinsUsed}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between border-t pt-2">
                    <span>{t("付与ポイント", "Support points")}：</span>
                    <span className="font-bold">+{breakdown.totalPt}pt</span>
                  </div>
                </div>
              </div>
            )}

            {/* 残高不足時の警告 */}
            {!canSupport &&
              (supportMode === "default"
                ? Number(coinAmount) > 0
                : Number(customFreeCoinAmount) +
                    Number(customPremiumCoinAmount) >
                  0) && (
                <div className="rounded-lg border border-destructive bg-destructive/5 p-3">
                  <p className="text-destructive text-xs leading-5">
                    {supportMode === "default"
                      ? t(
                          `コインが不足しています。現在 ${totalAvailableCoins} coin まで利用できます。`,
                          `Insufficient coins. You can use up to ${totalAvailableCoins} coins.`,
                        )
                      : t(
                          "コイン配分が残高を超えています。配分を調整してください。",
                          "The selected allocation exceeds your balance. Please adjust it.",
                        )}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-3 w-full"
                    onClick={() => setShowCoinPurchase(true)}
                  >
                    {t(
                      "プレミアムコインを購入して続ける",
                      "Buy premium coins to continue",
                    )}
                  </Button>
                </div>
              )}

            {/* ボタン */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
                className="flex-1"
              >
                {t("キャンセル", "Cancel")}
              </Button>
              <Button
                onClick={handleSupport}
                disabled={!canSupport || isLoading}
                className="flex-1"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t("推す", "Support")}
              </Button>
            </div>

            {/* 利用規約 */}
            <p className="text-center text-muted-foreground text-xs">
              {supportMode === "default"
                ? t(
                    "デフォルトではフリーコインから優先して消費され、プレミアムコインは 1 枚 = 10pt で換算されます。",
                    "In default mode, free coins are used first, and premium coins are worth 10 points each.",
                  )
                : t(
                    "カスタムではフリー/プレミアムの配分を指定して付与できます。プレミアムコインは 1 枚 = 10pt です。",
                    "In custom mode, you can choose free/premium allocation. Premium coins are worth 10 points each.",
                  )}
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <PurchasePremiumCoinsDialog
        currentBalance={currentPremiumCoinBalance}
        open={showCoinPurchase}
        onOpenChange={(open) => {
          setShowCoinPurchase(open)
          if (!open) {
            void reloadBalance()
          }
        }}
        hideTrigger
      />

      <SupportSuccessDialog
        open={isSuccessOpen}
        onOpenChange={setIsSuccessOpen}
        targetUserIconUrl={resolvedTargetUserIconUrl}
        targetUserName={resolvedTargetUserName}
        thankYouMessage={successThankYouMessage}
        totalPt={successTotalPt ?? undefined}
      />
    </>
  )
}

const targetSupportUserQuery = graphql(
  `query TargetSupportUser($userId: ID!) {
    user(id: $userId) {
      id
      name
      iconUrl
      supportThankYouMessage
    }
  }`,
)
