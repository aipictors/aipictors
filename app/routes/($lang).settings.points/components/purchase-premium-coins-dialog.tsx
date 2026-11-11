import { Link } from "~/lib/app/locale-router"
import { Check, Minus, Plus } from "lucide-react"
import { useEffect, useState } from "react"
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
import { cn } from "~/lib/utils"
import { getViewerRequestHeaders } from "~/lib/viewer-request-headers"
import {
  BONUS_RATE,
  BONUS_THRESHOLD,
  calcBonusCoins,
  calcCustomPriceYen,
  calcOfferBonusCoins,
  FIRST_PURCHASE_BONUS_MAX,
  MEMBER_BONUS_RATE,
  MIN_CUSTOM_COINS,
  PREMIUM_COIN_PACKAGES,
  type PremiumCoinOffer,
} from "~/lib/premium-coins"
import { trackGrowthEvent } from "~/utils/track-growth-event"

type PackageKey = keyof typeof PREMIUM_COIN_PACKAGES

const PACKAGE_OPTIONS: {
  id: PackageKey
  coins: number
  bonusCoins: number
  priceYen: number
}[] = [
  {
    id: "PREMIUM_COINS_100",
    coins: 100,
    bonusCoins: 0,
    priceYen: 80,
  },
  {
    id: "PREMIUM_COINS_1000",
    coins: 1000,
    bonusCoins: 100,
    priceYen: 800,
  },
  {
    id: "PREMIUM_COINS_10000",
    coins: 10000,
    bonusCoins: 1000,
    priceYen: 8000,
  },
]

const ADJUSTMENT_STEP = 100

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
  triggerClassName?: string
  successPath?: string
  cancelPath?: string
}) {
  const t = useTranslation()
  const [internalOpen, setInternalOpen] = useState(false)
  const [coinAmount, setCoinAmount] = useState(MIN_CUSTOM_COINS)
  const [isLoading, setIsLoading] = useState(false)

  const open = props.open ?? internalOpen

  // はじめての購入・プラン加入中の上乗せ（決済のときもサーバーで同じ判定をする）
  const [offer, setOffer] = useState<PremiumCoinOffer | null>(null)

  useEffect(() => {
    if (!open || offer !== null) return
    let isCancelled = false
    ;(async () => {
      try {
        const headers = await getViewerRequestHeaders()
        const response = await fetch("/api/coins/purchase-offer", { headers })
        const json = (await response.json()) as { data: PremiumCoinOffer | null }
        if (!isCancelled && json.data) {
          setOffer(json.data)
          trackGrowthEvent(
            "coin_dialog_view",
            json.data.isFirstPurchase ? "first" : json.data.passType ? "member" : "repeat",
          )
        }
      } catch {
        // 上乗せの表示が出ないだけ（決済のときにサーバーで付く）
      }
    })()
    return () => {
      isCancelled = true
    }
  }, [open])

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

  const offerBonus = calcOfferBonusCoins(matchedPackage?.coins ?? coinAmount, offer)

  const derivedBonus =
    (matchedPackage?.bonusCoins ?? calcBonusCoins(coinAmount)) +
    offerBonus.firstPurchase +
    offerBonus.member

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
      if (props.successPath) {
        body.successPath = props.successPath
      }
      if (props.cancelPath) {
        body.cancelPath = props.cancelPath
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
          <Button variant="default" className={props.triggerClassName}>
            {t("コインを購入", "Buy coins")}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="w-[calc(100vw-1rem)] max-w-lg gap-0 p-0 sm:w-full">
        <DialogHeader className="px-4 pt-4 pr-12 text-left sm:px-6 sm:pt-6">
          <DialogTitle>
            {t("プレミアムコインを購入", "Buy premium coins")}
          </DialogTitle>
          <p className="flex items-center gap-1.5 text-muted-foreground text-sm tabular-nums">
            {t("いまの保有", "You have")}
            <PremiumCoinIcon className="h-4 w-4 shrink-0" />
            {props.currentBalance.toLocaleString()}
          </p>
        </DialogHeader>

        <div className="space-y-4 px-4 py-4 sm:px-6">
          {offer && (offer.isFirstPurchase || offer.passType) && (
            <div className="space-y-0.5 rounded-lg border border-emerald-500/40 bg-emerald-500/5 px-3 py-2 text-sm">
              {offer.isFirstPurchase && (
                <p className="font-bold text-emerald-700 dark:text-emerald-300">
                  {t(
                    `はじめての購入は2倍！買った枚数と同じだけおまけ（最大${FIRST_PURCHASE_BONUS_MAX.toLocaleString()}枚）`,
                    `First purchase doubled: bonus equal to your coins (up to ${FIRST_PURCHASE_BONUS_MAX.toLocaleString()})`,
                  )}
                </p>
              )}
              {offer.passType && (
                <p className="text-emerald-700 text-xs dark:text-emerald-300">
                  {t(
                    `プラン加入中の特典: いつでも${Math.round(MEMBER_BONUS_RATE * 100)}%おまけ`,
                    `Member perk: ${Math.round(MEMBER_BONUS_RATE * 100)}% bonus on every purchase`,
                  )}
                </p>
              )}
            </div>
          )}
          {offer && !offer.passType && !offer.isFirstPurchase && (
            <p className="text-muted-foreground text-xs">
              {t(
                `プランに入ると、コインの購入がいつでも${Math.round(MEMBER_BONUS_RATE * 100)}%おまけになります。`,
                `Members get a ${Math.round(MEMBER_BONUS_RATE * 100)}% bonus on every coin purchase.`,
              )}{" "}
              <Link to="/plus" className="underline underline-offset-4">
                {t("プランを見る", "See plans")}
              </Link>
            </p>
          )}
          <div
            className="grid gap-2 sm:grid-cols-3"
            role="radiogroup"
            aria-label={t("購入する枚数", "Amount")}
          >
            {PACKAGE_OPTIONS.map((opt) => {
              const isSelected = matchedPackage?.id === opt.id
              const extra = calcOfferBonusCoins(opt.coins, offer)
              const bonusCoins = opt.bonusCoins + extra.firstPurchase + extra.member

              return (
                <button
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  key={opt.id}
                  onClick={() => handleSelectPackage(opt.id)}
                  className={cn(
                    "relative flex min-h-14 items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left transition-colors sm:flex-col sm:items-start sm:justify-start sm:gap-1",
                    isSelected
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "hover:bg-muted",
                  )}
                >
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5 font-bold text-lg tabular-nums">
                      <PremiumCoinIcon className="h-4 w-4 shrink-0" />
                      {(opt.coins + bonusCoins).toLocaleString()}
                    </span>
                    {bonusCoins > 0 && (
                      <span className="block text-emerald-600 text-xs dark:text-emerald-400">
                        {t(
                          `${bonusCoins.toLocaleString()} 枚おまけ`,
                          `${bonusCoins.toLocaleString()} bonus`,
                        )}
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 font-semibold tabular-nums">
                    ¥{opt.priceYen.toLocaleString()}
                  </span>
                  {isSelected && (
                    <Check className="absolute top-2 right-2 hidden h-4 w-4 text-primary sm:block" />
                  )}
                </button>
              )
            })}
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-coins">
              {t("枚数を指定", "Custom amount")}
            </Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-11 w-11 shrink-0"
                onClick={() => handleAdjustment(-ADJUSTMENT_STEP)}
                aria-label={t("100 枚減らす", "Remove 100 coins")}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="custom-coins"
                type="text"
                inputMode="numeric"
                value={coinAmount <= 0 ? "" : coinAmount.toString()}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="h-11 text-center font-semibold text-lg tabular-nums"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-11 w-11 shrink-0"
                onClick={() => handleAdjustment(ADJUSTMENT_STEP)}
                aria-label={t("100 枚増やす", "Add 100 coins")}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-muted-foreground text-xs leading-5">
              {t(
                `${MIN_CUSTOM_COINS} 枚から。100 枚あたり ¥${calcCustomPriceYen(100).toLocaleString()}、${BONUS_THRESHOLD.toLocaleString()} 枚以上で ${(BONUS_RATE * 100).toFixed(0)}% おまけ`,
                `From ${MIN_CUSTOM_COINS} coins. ¥${calcCustomPriceYen(100).toLocaleString()} per 100, ${(BONUS_RATE * 100).toFixed(0)}% bonus from ${BONUS_THRESHOLD.toLocaleString()} coins`,
              )}
            </p>
          </div>

          <dl className="space-y-1.5 rounded-lg bg-muted/50 p-3 text-sm tabular-nums">
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">
                {t("受け取る枚数", "You receive")}
              </dt>
              <dd className="font-semibold">
                {derivedTotal.toLocaleString()}
                {derivedBonus > 0 && (
                  <span className="ml-1 font-normal text-emerald-600 text-xs dark:text-emerald-400">
                    {t(
                      `（おまけ ${derivedBonus.toLocaleString()}）`,
                      ` (${derivedBonus.toLocaleString()} bonus)`,
                    )}
                  </span>
                )}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">
                {t("購入後の保有", "Balance after")}
              </dt>
              <dd>{(props.currentBalance + derivedTotal).toLocaleString()}</dd>
            </div>
          </dl>

          <div className="space-y-1.5 text-muted-foreground text-xs leading-5">
            <p>
              {t(
                "購入から3か月で失効します。生成ではフリーコインから先に使います。購入前に、有効期限・返金方針・前払式支払手段に関する表示をご確認ください。",
                "Coins expire 3 months after purchase. Free coins are used first for generation. Before purchasing, please review the expiration, refund handling and prepaid payment instrument disclosures.",
              )}
            </p>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              <Link className="underline underline-offset-4" to="/premium-coins/policy">
                {t("プレミアムコイン規約・ポリシー", "Premium Coin Policy")}
              </Link>
              <Link
                className="underline underline-offset-4"
                to="/specified-commercial-transaction-act"
              >
                {t(
                  "特定商取引法に基づく表記",
                  "Specified Commercial Transaction Act",
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* 長い画面でも購入ボタンを常に見せる */}
        <div className="sticky bottom-0 border-t bg-background px-4 py-3 sm:px-6">
          <Button
            className="h-11 w-full text-base"
            onClick={handlePurchase}
            disabled={isLoading || !customCoinsValid}
          >
            {isLoading
              ? t("処理中...", "Processing...")
              : customCoinsValid
                ? t(
                    `¥${derivedPriceYen.toLocaleString()} を Stripe で支払う`,
                    `Pay ¥${derivedPriceYen.toLocaleString()} with Stripe`,
                  )
                : t(
                    `${MIN_CUSTOM_COINS} 枚から購入できます`,
                    `Minimum ${MIN_CUSTOM_COINS} coins`,
                  )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
