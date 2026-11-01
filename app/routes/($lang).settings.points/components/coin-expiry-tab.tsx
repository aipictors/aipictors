import { useState } from "react"
import { CoinIcon } from "~/components/coin-icon"
import { PremiumCoinIcon } from "~/components/premium-coin-icon"
import { Button } from "~/components/ui/button"
import { Skeleton } from "~/components/ui/skeleton"
import { useTranslation } from "~/hooks/use-translation"
import { formatExpiry } from "~/routes/($lang).settings.points/utils/coin-ledger"
import type { CachedCoinSummary } from "~/routes/($lang).settings.points/utils/coin-summary-cache"

type Props = {
  summary: CachedCoinSummary | null
}

/** 失効の一覧は API の都合で最大 50 件まで */
const MAX_EXPIRING_LOTS = 50

const INITIAL_VISIBLE = 8

export function CoinExpiryTab(props: Props) {
  const t = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)
  const nowSeconds = Math.floor(Date.now() / 1000)

  if (!props.summary) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    )
  }

  // 期限の早い順。同じ時刻はフリーを先に
  const lots = [...props.summary.expiringLots].sort(
    (a, b) =>
      a.expiresAt - b.expiresAt ||
      (a.coinType === b.coinType ? 0 : a.coinType === "FREE" ? -1 : 1),
  )
  const visibleLots = isExpanded ? lots : lots.slice(0, INITIAL_VISIBLE)
  const hiddenCoins = lots
    .slice(INITIAL_VISIBLE)
    .reduce((total, lot) => total + lot.amount, 0)

  // 残高のうち一覧に出ない分は期限なし。一覧が上限まであるときは正しく出せないので出さない
  const sumLots = (coinType: "FREE" | "PREMIUM") =>
    lots
      .filter((lot) => lot.coinType === coinType)
      .reduce((total, lot) => total + lot.amount, 0)
  const isListComplete = lots.length < MAX_EXPIRING_LOTS
  const noExpiryFree = isListComplete
    ? Math.max(0, props.summary.freeBalance - sumLots("FREE"))
    : 0
  const noExpiryPremium = isListComplete
    ? Math.max(0, props.summary.premiumBalance - sumLots("PREMIUM"))
    : 0

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm leading-6">
        {t(
          "生成ではフリーコインから先に使い、同じ種類の中では期限の近いものから減ります。毎日のフリーコインは当日24:00まで、購入したプレミアムコインは3か月有効です。",
          "Generation uses free coins first, and within each type the coins closest to expiry go first. Daily free coins last until 24:00 that day, and purchased premium coins last 3 months.",
        )}
      </p>

      {lots.length === 0 && noExpiryFree === 0 && noExpiryPremium === 0 ? (
        <p className="rounded-lg border border-dashed py-10 text-center text-muted-foreground text-sm">
          {t(
            "失効予定のコインはありません",
            "No coins are scheduled to expire",
          )}
        </p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {visibleLots.map((lot) => (
            <li
              key={`${lot.coinType}-${lot.expiresAt}`}
              className="flex items-center gap-3 px-3 py-2.5"
            >
              {lot.coinType === "PREMIUM" ? (
                <PremiumCoinIcon className="h-5 w-5 shrink-0" />
              ) : (
                <CoinIcon className="h-5 w-5 shrink-0" />
              )}
              <span className="min-w-0 flex-1 text-sm tabular-nums">
                {formatExpiry(lot.expiresAt, nowSeconds, t)}
                <span className="text-muted-foreground">{t(" まで", "")}</span>
              </span>
              <span className="shrink-0 font-semibold text-sm tabular-nums">
                {lot.amount.toLocaleString()}
              </span>
            </li>
          ))}
          {noExpiryFree > 0 && (
            <li className="flex items-center gap-3 px-3 py-2.5">
              <CoinIcon className="h-5 w-5 shrink-0" />
              <span className="min-w-0 flex-1 text-muted-foreground text-sm">
                {t("有効期限なし", "No expiry")}
              </span>
              <span className="shrink-0 font-semibold text-sm tabular-nums">
                {noExpiryFree.toLocaleString()}
              </span>
            </li>
          )}
          {noExpiryPremium > 0 && (
            <li className="flex items-center gap-3 px-3 py-2.5">
              <PremiumCoinIcon className="h-5 w-5 shrink-0" />
              <span className="min-w-0 flex-1 text-muted-foreground text-sm">
                {t(
                  "有効期限なし（推してもらった分など）",
                  "No expiry (received as support, etc.)",
                )}
              </span>
              <span className="shrink-0 font-semibold text-sm tabular-nums">
                {noExpiryPremium.toLocaleString()}
              </span>
            </li>
          )}
        </ul>
      )}

      {!isExpanded && lots.length > INITIAL_VISIBLE && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setIsExpanded(true)}
        >
          {t(
            `もっと見る（${hiddenCoins.toLocaleString()} 枚）`,
            `Show more (${hiddenCoins.toLocaleString()} coins)`,
          )}
        </Button>
      )}
    </div>
  )
}
