import { CoinIcon } from "~/components/coin-icon"
import { CoinHelpDialog } from "~/components/coin-help-dialog"
import { PremiumCoinIcon } from "~/components/premium-coin-icon"
import { Button } from "~/components/ui/button"
import { Label } from "~/components/ui/label"
import { Skeleton } from "~/components/ui/skeleton"
import { Switch } from "~/components/ui/switch"
import { useTranslation } from "~/hooks/use-translation"
import { PurchasePremiumCoinsDialog } from "~/routes/($lang).settings.points/components/purchase-premium-coins-dialog"
import { formatExpiry } from "~/routes/($lang).settings.points/utils/coin-ledger"
import type {
  CachedCoinSummary,
  ExpiringCoinLot,
} from "~/routes/($lang).settings.points/utils/coin-summary-cache"

type Props = {
  summary: CachedCoinSummary | null
  isLoading: boolean
  hasError: boolean
  onRetry: () => void
  isPremiumCoinConfirmEnabled: boolean
  onPremiumCoinConfirmChange: (value: boolean) => void
}

const getNextLot = (lots: ExpiringCoinLot[], coinType: "FREE" | "PREMIUM") => {
  return lots
    .filter((lot) => lot.coinType === coinType)
    .sort((a, b) => a.expiresAt - b.expiresAt)[0]
}

export function CoinBalanceCard(props: Props) {
  const t = useTranslation()
  const nowSeconds = Math.floor(Date.now() / 1000)
  const lots = props.summary?.expiringLots ?? []

  const getExpiryNote = (coinType: "FREE" | "PREMIUM", balance: number) => {
    const lot = getNextLot(lots, coinType)

    if (lot) {
      const when = formatExpiry(lot.expiresAt, nowSeconds, t)
      return t(
        `${when} に ${lot.amount.toLocaleString()} 枚失効`,
        `${lot.amount.toLocaleString()} expire ${when}`,
      )
    }

    if (balance > 0) {
      return t("有効期限なし", "No expiry")
    }

    return coinType === "FREE"
      ? t("毎日もらえます", "Granted daily")
      : t("購入から3か月有効", "Valid for 3 months")
  }

  const tiles = [
    {
      coinType: "FREE" as const,
      icon: <CoinIcon className="h-5 w-5 shrink-0" />,
      label: t("フリーコイン", "Free coins"),
      balance: props.summary?.freeBalance ?? 0,
    },
    {
      coinType: "PREMIUM" as const,
      icon: <PremiumCoinIcon className="h-5 w-5 shrink-0" />,
      label: t("プレミアムコイン", "Premium coins"),
      balance: props.summary?.premiumBalance ?? 0,
    },
  ]

  return (
    <section className="overflow-hidden rounded-xl border bg-card">
      <div className="grid grid-cols-2 divide-x">
        {tiles.map((tile) => (
          <div key={tile.coinType} className="min-w-0 p-4 md:p-5">
            <p className="flex items-center gap-1.5 font-medium text-sm">
              {tile.icon}
              <span className="truncate">{tile.label}</span>
            </p>
            <div className="mt-2 flex h-9 items-center md:h-10">
              {props.summary ? (
                <p className="truncate font-bold text-3xl tabular-nums md:text-4xl">
                  {tile.balance.toLocaleString()}
                </p>
              ) : props.isLoading ? (
                <Skeleton className="h-8 w-20 md:w-28" />
              ) : (
                <p className="font-bold text-3xl text-muted-foreground md:text-4xl">
                  —
                </p>
              )}
            </div>
            <div className="mt-1 flex min-h-4 items-center text-muted-foreground text-xs">
              {props.summary ? (
                <span>{getExpiryNote(tile.coinType, tile.balance)}</span>
              ) : props.isLoading ? (
                <Skeleton className="h-3 w-24" />
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {props.hasError && !props.summary && (
        <div className="flex items-center justify-between gap-3 border-t px-4 py-3 text-sm md:px-5">
          <span className="text-destructive">
            {t("残高を読み込めませんでした", "Could not load your balance")}
          </span>
          <Button variant="outline" size="sm" onClick={props.onRetry}>
            {t("再読み込み", "Retry")}
          </Button>
        </div>
      )}

      <div className="flex gap-2 border-t p-3 md:px-5">
        <PurchasePremiumCoinsDialog
          currentBalance={props.summary?.premiumBalance ?? 0}
          triggerClassName="min-w-0 flex-1 sm:flex-none"
        />
        <CoinHelpDialog triggerLabel={t("コインの仕組み", "How coins work")} />
      </div>

      <div className="flex items-center justify-between gap-3 border-t px-4 py-3 md:px-5">
        <Label
          htmlFor="premium-coin-confirm"
          className="font-normal text-sm leading-5"
        >
          {t(
            "生成でプレミアムコインを使う前に確認する",
            "Ask before using premium coins for generation",
          )}
        </Label>
        <Switch
          id="premium-coin-confirm"
          checked={props.isPremiumCoinConfirmEnabled}
          onCheckedChange={props.onPremiumCoinConfirmChange}
        />
      </div>
    </section>
  )
}
