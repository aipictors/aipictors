import { Minus, Plus } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { PremiumCoinIcon } from "~/components/premium-coin-icon"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { useTranslation } from "~/hooks/use-translation"
import { getViewerRequestHeaders } from "~/lib/viewer-request-headers"
import {
  BONUS_RATE,
  BONUS_THRESHOLD,
  calcBonusCoins,
  calcCustomPriceYen,
  MIN_CUSTOM_COINS,
  PREMIUM_COIN_PACKAGES,
} from "~/lib/premium-coins"

type PackageKey = keyof typeof PREMIUM_COIN_PACKAGES

const PACKAGE_OPTIONS: {
  id: PackageKey
  coins: number
  priceYen: number
}[] = [
  {
    id: "PREMIUM_COINS_100",
    coins: 100,
    priceYen: 80,
  },
  {
    id: "PREMIUM_COINS_1000",
    coins: 1000,
    priceYen: 800,
  },
  {
    id: "PREMIUM_COINS_10000",
    coins: 10000,
    priceYen: 8000,
  },
]

const ADJUSTMENT_STEPS = [100, 500, 1000] as const

const clampCoinAmount = (value: number) => {
  if (!Number.isFinite(value)) return MIN_CUSTOM_COINS
  return Math.max(MIN_CUSTOM_COINS, Math.floor(value))
}

const getMatchedPackage = (coinAmount: number) => {
  return (
    Object.values(PREMIUM_COIN_PACKAGES).find((pkg) => pkg.coins === coinAmount) ??
    null
  )
}

export function PurchasePremiumCoinsDialog(props: {
  currentBalance: number
  open?: boolean
  onOpenChange?: (open: boolean) => void
  hideTrigger?: boolean
}) {
  const t = useTranslation()
  const [internalOpen, setInternalOpen] = useState(false)
  const [coinAmount, setCoinAmount] = useState(MIN_CUSTOM_COINS)
  const [isLoading, setIsLoading] = useState(false)

  const open = props.open ?? internalOpen

  const handleOpenChange = (nextOpen: boolean) => {
    if (props.open === undefined) {
      setInternalOpen(nextOpen)
    }
    props.onOpenChange?.(nextOpen)
  }

  const matchedPackage = getMatchedPackage(coinAmount)
  const customCoinsValid =
    Number.isInteger(coinAmount) && coinAmount >= MIN_CUSTOM_COINS

  const derivedCoins = matchedPackage?.coins ?? coinAmount

  const derivedBonus = matchedPackage?.bonusCoins ?? calcBonusCoins(coinAmount)

  const derivedTotal = derivedCoins + derivedBonus

  const derivedPriceYen =
    matchedPackage?.priceYen ?? calcCustomPriceYen(coinAmount)

  const activePackageId = matchedPackage?.id ?? "PREMIUM_COINS_CUSTOM"

  const handleAmountChange = (value: string) => {
    const numeric = Number.parseInt(value.replaceAll(/[^0-9]/g, ""), 10)
    setCoinAmount(Number.isNaN(numeric) ? 0 : numeric)
  }

  const handleAdjustment = (delta: number) => {
    setCoinAmount((current) => clampCoinAmount(current + delta))
  }

  const handleSelectPackage = (packageId: PackageKey) => {
    setCoinAmount(PREMIUM_COIN_PACKAGES[packageId].coins)
  }

  const handlePurchase = async () => {
    if (!customCoinsValid) {
      toast.error(
        t(
          `最低${MIN_CUSTOM_COINS}枚から購入できます`,
          `Minimum purchase is ${MIN_CUSTOM_COINS} coins`,
        ),
      )
      return
    }

    try {
      setIsLoading(true)
      const headers = await getViewerRequestHeaders({
        includeJsonContentType: true,
      })

      const body: Record<string, unknown> = { packageId: activePackageId }
      if (activePackageId === "PREMIUM_COINS_CUSTOM") {
        body.customCoins = coinAmount
      }

      const response = await fetch("/api/stripe/premium-coins-checkout", {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      })

      const json = (await response.json()) as {
        error: string | null
        data?: { checkoutUrl?: string }
      }

      if (!response.ok || json.error || !json.data?.checkoutUrl) {
        throw new Error(
          json.error ??
            t("購入セッションの作成に失敗しました", "Failed to start purchase"),
        )
      }

      handleOpenChange(false)
      window.location.href = json.data.checkoutUrl
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("エラーが発生しました", "An error occurred"),
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!props.hideTrigger && (
        <DialogTrigger asChild>
          <Button variant="default">
            {t("プレミアムコインを購入", "Buy Premium Coins")}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-h-[90svh] w-[calc(100vw-1rem)] max-w-xl overflow-y-auto px-4 py-4 sm:w-full sm:px-6 sm:py-6">
        <DialogHeader>
          <DialogTitle>
            {t("プレミアムコインを購入", "Buy Premium Coins")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pb-2">
          <div className="rounded-xl border bg-muted/30 p-4">
            <p className="text-muted-foreground text-sm">
              {t("現在の保有コイン", "Current balance")}
            </p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-lg">
                  {t("プレミアムコイン", "Premium Coins")}
                </p>
              </div>
              <div className="flex items-center gap-2 font-bold text-2xl">
                <PremiumCoinIcon className="h-6 w-6 shrink-0" />
                <span>{props.currentBalance.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label>{t("テンプレートから選択", "Choose a template")}</Label>
            <div className="grid gap-2 md:grid-cols-3">
              {PACKAGE_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => handleSelectPackage(opt.id)}
                  className={`rounded-2xl border px-5 py-4 text-left transition-colors ${
                    matchedPackage?.id === opt.id
                      ? "border-primary bg-primary/10 font-semibold"
                      : "hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-2xl">
                    <PremiumCoinIcon className="h-5 w-5 shrink-0" />
                    <span>{opt.coins.toLocaleString()}</span>
                  </div>
                  <p className="mt-2 font-semibold text-xl">
                    ¥{opt.priceYen.toLocaleString()}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border p-5">
            <Label htmlFor="custom-coins">
              {t("任意の枚数を入力", "Enter a custom amount")}
            </Label>
            <div className="flex items-center gap-3">
              <PremiumCoinIcon className="h-9 w-9 shrink-0" />
              <Input
                id="custom-coins"
                type="text"
                inputMode="numeric"
                value={coinAmount <= 0 ? "" : coinAmount.toString()}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="h-24 rounded-2xl border-2 text-center font-bold text-4xl tracking-wide md:text-5xl"
                aria-label={t(
                  `購入枚数（最低${MIN_CUSTOM_COINS}枚）`,
                  `Coins to purchase (min ${MIN_CUSTOM_COINS})`,
                )}
              />
            </div>
            <p className="text-center text-muted-foreground text-sm">
              {t(
                `100コイン = ¥${calcCustomPriceYen(100).toLocaleString()} / 最低${MIN_CUSTOM_COINS}コインから購入できます`,
                `100 coins = ¥${calcCustomPriceYen(100).toLocaleString()} / Minimum ${MIN_CUSTOM_COINS} coins`,
              )}
            </p>

            <div className="grid grid-cols-3 gap-2">
              {ADJUSTMENT_STEPS.map((step) => (
                <Button
                  key={`increase-${step}`}
                  type="button"
                  variant="outline"
                  className="h-14 justify-center gap-2 rounded-xl text-base"
                  onClick={() => handleAdjustment(step)}
                >
                  <Plus className="h-4 w-4" />
                  <PremiumCoinIcon className="h-4 w-4 shrink-0" />
                  {step.toLocaleString()}
                </Button>
              ))}
              {ADJUSTMENT_STEPS.map((step) => (
                <Button
                  key={`decrease-${step}`}
                  type="button"
                  variant="outline"
                  className="h-14 justify-center gap-2 rounded-xl text-base"
                  onClick={() => handleAdjustment(-step)}
                >
                  <Minus className="h-4 w-4" />
                  <PremiumCoinIcon className="h-4 w-4 shrink-0" />
                  {step.toLocaleString()}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2 rounded-2xl border bg-muted/40 p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t("購入枚数", "Coins")}
              </span>
              <span className="font-semibold">
                {derivedCoins.toLocaleString()}
              </span>
            </div>
            {derivedBonus > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>{t("ボーナス", "Bonus")}</span>
                <span className="font-semibold">
                  +{derivedBonus.toLocaleString()}
                </span>
              </div>
            )}
            <div className="flex justify-between border-t pt-2">
              <span className="font-semibold">
                {t("合計枚数", "Total coins")}
              </span>
              <span className="font-bold">{derivedTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t("価格", "Price")}
              </span>
              <span className="font-bold">
                ¥{derivedPriceYen.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-muted-foreground">
                {t("購入後の保有枚数", "Balance after purchase")}
              </span>
              <span className="font-semibold">
                {(props.currentBalance + derivedTotal).toLocaleString()}
              </span>
            </div>
          </div>

          {coinAmount >= BONUS_THRESHOLD && (
            <p className="text-center text-emerald-600 text-sm dark:text-emerald-400">
              {t(
                `${(BONUS_RATE * 100).toFixed(0)}%ボーナス（+${calcBonusCoins(coinAmount).toLocaleString()}枚）が付与されます`,
                `${(BONUS_RATE * 100).toFixed(0)}% bonus (+${calcBonusCoins(coinAmount).toLocaleString()} coins) will be added`,
              )}
            </p>
          )}

          <p className="text-muted-foreground text-xs">
            {t(
              "購入から3ヶ月で期限切れになります。期限切れになったコインは使用できません。",
              "Coins expire 3 months after purchase. Expired coins cannot be used.",
            )}
          </p>
          <p className="text-muted-foreground text-xs">
            {t(
              "生成時はフリーコインから優先的に消費されます。",
              "Free coins are consumed first during generation.",
            )}
          </p>

          <Button
            className="w-full"
            onClick={handlePurchase}
            disabled={isLoading || !customCoinsValid}
          >
            {isLoading
              ? t("処理中...", "Processing...")
              : t("Stripeで購入する", "Purchase via Stripe")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
