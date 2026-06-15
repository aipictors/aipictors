/**
 * 推しボタン — ユーザーを支援する際に使用
 * - 指定コイン数に対する消費内訳と獲得ptのプレビュー表示
 * - ポイント不足時にコイン購入決済ができる
 */
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { PremiumCoinIcon } from "~/components/premium-coin-icon"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { useTranslation } from "~/hooks/use-translation"
import { getViewerRequestHeaders } from "~/lib/viewer-request-headers"
import { PurchasePremiumCoinsDialog } from "~/routes/($lang).settings.points/components/purchase-premium-coins-dialog"

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
  const [coinAmount, setCoinAmount] = useState<string>("10")
  const [isLoading, setIsLoading] = useState(false)
  const [showCoinPurchase, setShowCoinPurchase] = useState(false)

  const breakdown = calculateCoinBreakdown(
    Number(coinAmount) || 0,
    freeCoinBalance,
    premiumCoinBalance,
  )
  const canSupport = breakdown !== null

  const totalAvailableCoins = freeCoinBalance + premiumCoinBalance

  const handleCoinAmountChange = (value: string) => {
    const numeric = Number.parseInt(value.replaceAll(/[^0-9]/g, ""), 10)
    setCoinAmount(Number.isNaN(numeric) ? "" : String(numeric))
  }

  const handleAdjustment = (delta: number) => {
    const nextValue = Math.max(1, (Number(coinAmount) || 0) + delta)
    setCoinAmount(String(nextValue))
  }

  const handleSupport = async () => {
    if (!canSupport) return

    try {
      setIsLoading(true)
      const headers = await getViewerRequestHeaders({
        includeJsonContentType: true,
      })

      // フリーコインとプレミアムコインに分割して送信
      const requests = []

      if (breakdown!.freeCoinsUsed > 0) {
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
        toast.error(errorMsg ?? t("推しに失敗しました", "Support failed"))
        return
      }

      toast.success(
        t(
          `${targetUserName ?? "ユーザー"}を推しました（${breakdown.totalPt}pt）`,
          "Supported successfully!",
        ),
      )
      setIsOpen(false)
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

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className={triggerClassName ?? "w-full"}
        variant="default"
      >
        {t("推す", "Support")}
      </Button>

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
              <Label className="text-xs text-muted-foreground">
                {t("付与先", "Target")}
              </Label>
              <div className="mt-1 flex items-center gap-2">
                {targetUserIconUrl && (
                  <img
                    src={targetUserIconUrl}
                    alt={targetUserName || "user"}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                )}
                <p className="font-semibold text-sm">
                  {targetUserName || targetUserId}
                </p>
              </div>
            </div>

            {/* 現在の保有コイン */}
            <div>
              <Label className="text-xs text-muted-foreground">
                {t("現在の保有コイン", "Current coins")}
              </Label>
              <div className="mt-2 rounded-xl border bg-muted/40 p-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{t("フリーコイン", "Free coins")}</span>
                  <span className="font-semibold">{freeCoinBalance}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <PremiumCoinIcon className="h-4 w-4" />
                    {t("プレミアムコイン", "Premium coins")}
                  </span>
                  <span className="font-semibold">{premiumCoinBalance}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label>{t("テンプレートから選択", "Choose a template")}</Label>
              <div className="grid grid-cols-2 gap-2">
                {QUICK_COIN_OPTIONS.map((option) => (
                  <Button
                    key={option}
                    type="button"
                    variant={Number(coinAmount) === option ? "default" : "outline"}
                    className="h-14 justify-between rounded-xl px-4"
                    onClick={() => setCoinAmount(String(option))}
                    disabled={isLoading}
                  >
                    <span className="flex items-center gap-2">
                      <PremiumCoinIcon className="h-4 w-4" />
                      {option.toLocaleString()}
                    </span>
                    <span className="text-xs opacity-80">coin</span>
                  </Button>
                ))}
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

            {/* 消費コイン内訳 */}
            {breakdown && (
              <div className="rounded-lg border bg-muted/50 p-3">
                <p className="mb-2 text-xs text-muted-foreground">
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
            {!canSupport && Number(coinAmount) > 0 && (
              <div className="rounded-lg border border-destructive bg-destructive/5 p-3">
                <p className="text-destructive text-xs">
                  {t(
                    `コインが不足しています。現在 ${totalAvailableCoins} coin まで利用できます。`,
                    `Insufficient coins. You can use up to ${totalAvailableCoins} coins.`,
                  )}
                  <button
                    type="button"
                    onClick={() => setShowCoinPurchase(true)}
                    className="ml-1 underline hover:opacity-70"
                  >
                    {t("購入", "Buy")}
                  </button>
                </p>
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
              {t(
                "フリーコインから優先して消費され、プレミアムコインは 1 枚 = 10pt で換算されます。",
                "Free coins are used first, and premium coins are worth 10 points each.",
              )}
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <PurchasePremiumCoinsDialog
        currentBalance={premiumCoinBalance}
        open={showCoinPurchase}
        onOpenChange={setShowCoinPurchase}
        hideTrigger
      />
    </>
  )
}
