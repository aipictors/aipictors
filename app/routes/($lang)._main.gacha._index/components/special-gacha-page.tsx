import { ApolloError, useMutation, useQuery } from "@apollo/client/index"
import { Info } from "lucide-react"
import { useContext, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import { toast } from "sonner"
import { CoinIcon } from "~/components/coin-icon"
import { GachaCoinShortageDialog } from "~/components/gacha/gacha-coin-shortage-dialog"
import type { GachaItem } from "~/components/gacha/gacha-direction"
import { toPityProgress } from "~/components/gacha/gacha-lottery"
import { GachaPerformance } from "~/components/gacha/gacha-performance"
import { GachaPityMeter } from "~/components/gacha/gacha-pity-meter"
import { GACHA_PRIZES } from "~/components/gacha/gacha-prizes"
import {
  GACHA_EXCHANGE_POINTS,
  GACHA_FREE_DAILY_LIMIT,
  GACHA_PRICES,
  type GachaCoinType,
  toGachaPrice,
} from "~/components/gacha/gacha-rules"
import { LoginDialogButton } from "~/components/login-dialog-button"
import { PremiumCoinIcon } from "~/components/premium-coin-icon"
import { AuthContext } from "~/contexts/auth-context"
import { useCoinBalance } from "~/hooks/use-coin-balance"
import { Link } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"
import { SpecialGachaCollection } from "~/routes/($lang)._main.gacha._index/components/special-gacha-collection"
import { SpecialGachaHero } from "~/routes/($lang)._main.gacha._index/components/special-gacha-hero"
import { SpecialGachaLineup } from "~/routes/($lang)._main.gacha._index/components/special-gacha-lineup"
import {
  drawGachaMutation,
  viewerGachaQuery,
} from "~/routes/($lang)._main.gacha._index/components/special-gacha-queries"
import { SpecialGachaUniquePrizes } from "~/routes/($lang)._main.gacha._index/components/special-gacha-unique-prizes"

export type SpecialGachaState = {
  exchangePoints: number
  shards: number
  totalPulls: number
  freePullsToday: number
  isPremiumDealAvailable: boolean
  selectedHeaderFrameSlug: string | null
  ownedPrizes: readonly { prizeId: string; count: number }[]
}

const STYLE = `
@keyframes special-gacha-pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(244,114,182,.0), 0 8px 24px -8px rgba(236,72,153,.8) } 50% { box-shadow: 0 0 0 6px rgba(244,114,182,.25), 0 8px 28px -6px rgba(236,72,153,.95) } }
`

const toGraphQLCode = (error: unknown) => {
  if (!(error instanceof ApolloError)) return null
  const code = error.graphQLErrors[0]?.extensions?.code
  return typeof code === "string" ? code : null
}

const toGachaItems = (
  drawId: string,
  pulls: readonly {
    prizeId: string
    isNew: boolean
    shards: number
    byGuarantee: boolean
  }[],
): GachaItem[] =>
  pulls.flatMap((pull, index) => {
    const prize = GACHA_PRIZES.find((item) => item.id === pull.prizeId)
    if (!prize) return []
    const notes = [
      pull.byGuarantee ? "確定枠" : null,
      pull.shards > 0 ? `かぶり → かけら+${pull.shards}` : null,
    ].filter(Boolean)
    return [
      {
        id: `${drawId}-${index}`,
        rarity: prize.rarity,
        name: prize.name,
        imageUrl: prize.imageUrl,
        isNew: pull.isNew,
        note: notes.length > 0 ? notes.join("・") : undefined,
      },
    ]
  })

/**
 * スペシャル枠ガチャ（/gacha）。抽選・コインの支払いはサーバー（drawGacha）で行い、ここは見せるだけ
 */
export function SpecialGachaPage() {
  const auth = useContext(AuthContext)
  const isLoggedIn = !auth.isLoading && !auth.isNotLoggedIn
  const { data, refetch } = useQuery(viewerGachaQuery, {
    skip: !isLoggedIn,
    fetchPolicy: "cache-and-network",
  })
  const [drawMutation, { loading: isDrawing }] = useMutation(drawGachaMutation)
  const coins = useCoinBalance()
  const [override, setOverride] = useState<SpecialGachaState | null>(null)
  const [spent, setSpent] = useState({ free: 0, premium: 0 })
  const [performanceItems, setPerformanceItems] = useState<GachaItem[] | null>(
    null,
  )
  const [last, setLast] = useState<{
    coinType: GachaCoinType
    shards: number
  } | null>(null)
  const [shortage, setShortage] = useState<{ count: 1 | 10 } | null>(null)
  /** UUR を当てたら獲得者の一覧を読み直す */
  const [uniqueKey, setUniqueKey] = useState(0)

  const state: SpecialGachaState | null = override ?? data?.viewerGacha ?? null
  const freeBalance =
    coins.balance === null
      ? null
      : Math.max(0, coins.balance.freeCoinsBalance - spent.free)
  const premiumBalance =
    coins.balance === null
      ? null
      : Math.max(0, coins.balance.premiumCoinsBalance - spent.premium)

  const freePullsToday = state?.freePullsToday ?? 0
  const isPremiumDealAvailable = state?.isPremiumDealAvailable ?? true
  const priceOf = (coinType: GachaCoinType, count: 1 | 10) =>
    toGachaPrice({ coinType, count, freePullsToday, isPremiumDealAvailable })
  const freePrice = priceOf("FREE", 1)
  const premiumSinglePrice = priceOf("PREMIUM", 1)
  const premiumTenPrice = priceOf("PREMIUM", 10)

  const pity = useMemo(
    () =>
      toPityProgress(
        { exchangePoints: state?.exchangePoints ?? 0 },
        { pityCount: GACHA_EXCHANGE_POINTS },
      ),
    [state?.exchangePoints],
  )

  const draw = async (coinType: GachaCoinType, count: 1 | 10) => {
    if (isDrawing) return
    const price = priceOf(coinType, count)
    if (price === null) {
      toast.error(
        `フリーコインで引けるのは 1 日 ${GACHA_FREE_DAILY_LIMIT} 回までです。プレミアムコインなら何回でも引けます`,
      )
      return
    }
    if (coinType === "PREMIUM" && premiumBalance !== null) {
      if (premiumBalance < price.costCoins) {
        setShortage({ count })
        return
      }
    }
    if (coinType === "FREE" && freeBalance !== null) {
      if (freeBalance < price.costCoins) {
        toast.error(
          `フリーコインが足りません（あと ${(price.costCoins - freeBalance).toLocaleString()} 枚）。フリーコインは毎日もらえます`,
        )
        return
      }
    }
    try {
      const result = await drawMutation({
        variables: {
          input: {
            requestId: crypto.randomUUID(),
            coinType,
            count,
            expectedCostCoins: price.costCoins,
          },
        },
      })
      const payload = result.data?.drawGacha
      if (!payload) return
      setOverride(payload.state)
      setSpent((current) =>
        coinType === "FREE"
          ? { ...current, free: current.free + payload.costCoins }
          : { ...current, premium: current.premium + payload.costCoins },
      )
      setLast({
        coinType,
        shards: payload.pulls.reduce((sum, pull) => sum + pull.shards, 0),
      })
      setPerformanceItems(toGachaItems(payload.drawId, payload.pulls))
      if (
        payload.pulls.some((pull) =>
          GACHA_PRIZES.some(
            (prize) => prize.id === pull.prizeId && prize.rarity === "UUR",
          ),
        )
      ) {
        setUniqueKey((value) => value + 1)
      }
    } catch (error) {
      const code = toGraphQLCode(error)
      if (code === "GACHA_INSUFFICIENT_COINS" && coinType === "PREMIUM") {
        setShortage({ count })
        return
      }
      if (code === "GACHA_PRICE_CHANGED") {
        setOverride(null)
        await refetch()
      }
      toast.error(error instanceof Error ? error.message : "引けませんでした")
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-6 pb-16">
        <SpecialGachaHero isPremiumDealAvailable isFreeFirstAvailable />
        <div className="rounded-3xl border bg-card p-6 text-center">
          <p className="font-bold text-lg">ログインしてガチャを引こう</p>
          <p className="mt-1 text-muted-foreground text-sm">
            フリーコイン {GACHA_PRICES.free} 枚で 1 日 1 回、プレミアムコインの
            10 連は 1 日 1 回半額です
          </p>
          <div className="mx-auto mt-4 w-fit">
            <LoginDialogButton label="ログインして引く" />
          </div>
        </div>
        <SpecialGachaUniquePrizes />
        <SpecialGachaLineup />
        <RatesLink />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 pb-16">
      <style>{STYLE}</style>
      <SpecialGachaHero
        isPremiumDealAvailable={isPremiumDealAvailable}
        isFreeFirstAvailable={freePullsToday === 0}
      />

      <section className="space-y-4 rounded-3xl bg-gradient-to-b from-[#1d0b3a] to-[#120726] p-4 text-white sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <div className="flex flex-wrap items-center gap-3 font-bold">
            <span className="flex items-center gap-1">
              <PremiumCoinIcon className="size-4" />
              {premiumBalance === null ? "…" : premiumBalance.toLocaleString()}
            </span>
            <span className="flex items-center gap-1 text-white/80">
              <CoinIcon className="size-4" />
              {freeBalance === null ? "…" : freeBalance.toLocaleString()}
            </span>
          </div>
          <Link
            to="/gacha/rates"
            className="flex items-center gap-1 text-white/70 text-xs underline-offset-2 hover:underline"
          >
            <Info className="size-3.5" />
            提供割合・ご注意
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <DrawButton
            title="フリーで 1 回"
            icon={<CoinIcon className="size-5" />}
            cost={freePrice?.costCoins ?? null}
            originalCost={null}
            badge={freePrice === null ? null : "1 日 1 回"}
            sub={`今日 ${freePullsToday} / ${GACHA_FREE_DAILY_LIMIT} 回`}
            disabledLabel={freePrice === null ? "今日は終わり" : null}
            isLoading={isDrawing}
            onClick={() => draw("FREE", 1)}
          />
          <DrawButton
            title="プレミアム 1 回"
            icon={<PremiumCoinIcon className="size-5" />}
            cost={premiumSinglePrice?.costCoins ?? null}
            sub="何回でも引けます"
            isLoading={isDrawing}
            onClick={() => draw("PREMIUM", 1)}
          />
          <DrawButton
            title="プレミアム 10 連"
            icon={<PremiumCoinIcon className="size-5" />}
            cost={premiumTenPrice?.costCoins ?? null}
            originalCost={
              premiumTenPrice?.isDeal ? GACHA_PRICES.premiumTen : null
            }
            badge={premiumTenPrice?.isDeal ? "今日だけ半額" : null}
            sub="SR 以上 1 枠確定"
            isHighlighted
            isLoading={isDrawing}
            onClick={() => draw("PREMIUM", 10)}
          />
        </div>

        <GachaPityMeter progress={pity} />
        {pity.canExchange && (
          <p className="text-center font-bold text-pink-200 text-sm">
            下のコレクションで、まだ持っていない枠を選ぶと交換できます
          </p>
        )}
      </section>

      <SpecialGachaUniquePrizes key={uniqueKey} />
      {state && (
        <SpecialGachaCollection
          state={state}
          onStateChange={(next) => setOverride(next)}
        />
      )}
      <SpecialGachaLineup />
      <RatesLink />

      {performanceItems &&
        createPortal(
          <GachaPerformance
            items={performanceItems}
            onClose={() => setPerformanceItems(null)}
            onDrawAgain={(count) => {
              setPerformanceItems(null)
              const coinType: GachaCoinType =
                count === 10 ? "PREMIUM" : (last?.coinType ?? "PREMIUM")
              // 閉じてから次の演出を始める（演出を最初から作り直すため）
              window.setTimeout(() => draw(coinType, count), 0)
            }}
            resultExtra={
              <div className="space-y-2">
                {last && last.shards > 0 && (
                  <p className="text-center font-bold text-sky-200 text-xs">
                    かぶりはかけらになりました +{last.shards}（いま{" "}
                    {(state?.shards ?? 0).toLocaleString()}
                    。まだ持っていない枠と交換できます）
                  </p>
                )}
                <GachaPityMeter progress={pity} compact />
              </div>
            }
          />,
          document.body,
        )}
      {shortage && premiumBalance !== null && (
        <GachaCoinShortageDialog
          open={true}
          onOpenChange={(open) => {
            if (!open) setShortage(null)
          }}
          balance={premiumBalance}
          cost={priceOf("PREMIUM", shortage.count)?.costCoins ?? 0}
          label={shortage.count === 10 ? "10 連" : "1 回"}
          bundleCost={GACHA_PRICES.premiumTen}
          singleCost={GACHA_PRICES.premiumSingle}
          onDrawSingle={
            shortage.count === 10 ? () => draw("PREMIUM", 1) : undefined
          }
          successPath="/gacha"
          cancelPath="/gacha"
        />
      )}
    </div>
  )
}

function DrawButton(props: {
  title: string
  icon: React.ReactNode
  cost: number | null
  originalCost?: number | null
  badge?: string | null
  sub: string
  disabledLabel?: string | null
  isHighlighted?: boolean
  isLoading: boolean
  onClick: () => void
}) {
  const isDisabled = props.isLoading || props.disabledLabel != null
  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={props.onClick}
      className={cn(
        "relative flex flex-col items-center gap-1 rounded-2xl px-3 pt-4 pb-3 text-center font-bold transition active:scale-[.97] disabled:opacity-50",
        props.isHighlighted
          ? "bg-gradient-to-br from-pink-500 via-fuchsia-500 to-orange-400 text-white"
          : "bg-white text-slate-900",
      )}
      style={
        props.isHighlighted && !isDisabled
          ? { animation: "special-gacha-pulse 1.8s ease-in-out infinite" }
          : undefined
      }
    >
      {props.badge && (
        <span className="-top-2.5 absolute right-2 rounded-full bg-amber-300 px-2 py-0.5 font-black text-[11px] text-slate-900 shadow">
          {props.badge}
        </span>
      )}
      <span className="text-sm">{props.title}</span>
      <span className="flex items-center gap-1 font-black text-2xl tabular-nums">
        {props.icon}
        {props.disabledLabel ?? props.cost?.toLocaleString() ?? "-"}
        {props.originalCost != null && (
          <span
            className={cn(
              "ml-1 font-bold text-sm line-through",
              props.isHighlighted ? "text-white/70" : "text-slate-400",
            )}
          >
            {props.originalCost.toLocaleString()}
          </span>
        )}
      </span>
      <span
        className={cn(
          "text-[11px]",
          props.isHighlighted ? "text-white/90" : "text-slate-500",
        )}
      >
        {props.sub}
      </span>
    </button>
  )
}

function RatesLink() {
  return (
    <p className="text-center text-muted-foreground text-xs leading-relaxed">
      <Link to="/gacha/rates" className="underline underline-offset-2">
        提供割合（確率）・天井・ご注意
      </Link>
      ／景品はアイコン枠・ヘッダー枠（デジタルの見た目の飾り）です。プレミアムコインは有償、フリーコインは無償のコインです。
    </p>
  )
}
