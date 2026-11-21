import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { toGachaCoinShortage } from "~/components/gacha/gacha-coin-shortage"
import { PremiumCoinIcon } from "~/components/premium-coin-icon"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { calcOfferBonusCoins, type PremiumCoinOffer } from "~/lib/premium-coins"
import { createPremiumCoinCheckoutUrl } from "~/lib/start-premium-coin-checkout"
import { cn } from "~/lib/utils"
import { getViewerRequestHeaders } from "~/lib/viewer-request-headers"
import { LazyPurchasePremiumCoinsDialog as PurchasePremiumCoinsDialog } from "~/routes/($lang).settings.points/components/lazy-purchase-premium-coins-dialog"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  balance: number
  /** 引こうとした回の値段 */
  cost: number
  /** 「10 連」「1 回」 */
  label: string
  /** 10 連 1 回分の値段（まとめ買いの目安に出す） */
  bundleCost?: number
  /** 1 回なら引けるときに出す */
  onDrawSingle?: () => void
  singleCost?: number
  /**
   * 買う。渡さなければ決済画面（Stripe）へ移る。
   * シミュレーションでは決済せずに残高を足すものを渡す
   */
  onPurchase?: (coins: number) => void | Promise<void>
  /** 決済のあとに戻るページ（引く続きができるように） */
  successPath?: string
  cancelPath?: string
}

/**
 * ガチャのコインが足りないとき、その場で足りない分を買えるようにする。
 * いちばん大きいボタンは「足りない分だけ買う」。まとめ買いと、好きな枚数を選ぶ画面も出す
 */
export function GachaCoinShortageDialog(props: Props) {
  const shortage = toGachaCoinShortage({
    balance: props.balance,
    cost: props.cost,
    bundleCost: props.bundleCost,
  })
  const [loadingCoins, setLoadingCoins] = useState<number | null>(null)
  const [isCustomOpen, setIsCustomOpen] = useState(false)
  const [offer, setOffer] = useState<PremiumCoinOffer | null>(null)

  // はじめての購入・プラン加入中のおまけを、ボタンの枚数にも出す（決済のときもサーバーで同じ判定をする）
  useEffect(() => {
    if (!props.open || offer !== null || props.onPurchase) return
    let isCancelled = false
    ;(async () => {
      try {
        const headers = await getViewerRequestHeaders()
        const response = await fetch("/api/coins/purchase-offer", { headers })
        const json = (await response.json()) as {
          data: PremiumCoinOffer | null
        }
        if (!isCancelled && json.data) setOffer(json.data)
      } catch {
        // おまけの表示が出ないだけ
      }
    })()
    return () => {
      isCancelled = true
    }
  }, [props.open])

  const buy = async (coins: number) => {
    setLoadingCoins(coins)
    try {
      if (props.onPurchase) {
        await props.onPurchase(coins)
        return
      }
      const url = await createPremiumCoinCheckoutUrl({
        coins,
        successPath: props.successPath,
        cancelPath: props.cancelPath,
      })
      window.location.href = url
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "エラーが発生しました",
      )
    } finally {
      setLoadingCoins(null)
    }
  }

  const totalOf = (coins: number, bonusCoins: number) => {
    const extra = calcOfferBonusCoins(coins, offer)
    return coins + bonusCoins + extra.firstPurchase + extra.member
  }

  const canDrawSingle =
    props.onDrawSingle !== undefined &&
    props.singleCost !== undefined &&
    props.balance >= props.singleCost

  if (!shortage) return null
  const exact = shortage.exact

  return (
    <>
      <Dialog open={props.open} onOpenChange={props.onOpenChange}>
        <DialogContent className="max-h-[92dvh] max-w-sm overflow-y-auto">
          <DialogHeader className="pr-6 text-left">
            <DialogTitle className="leading-snug">
              コインがあと {shortage.shortage.toLocaleString()} 枚足りません
            </DialogTitle>
            <DialogDescription>
              {props.label}は {props.cost.toLocaleString()} コイン。いまの残高は{" "}
              {props.balance.toLocaleString()}{" "}
              コインです。買ったらそのまま引けます。
            </DialogDescription>
          </DialogHeader>

          {offer?.isFirstPurchase && (
            <p className="rounded-lg border border-emerald-500/40 bg-emerald-500/5 px-3 py-2 font-bold text-emerald-700 text-sm dark:text-emerald-300">
              はじめての購入は 2 倍！買った枚数と同じだけおまけ
            </p>
          )}

          <Button
            disabled={loadingCoins !== null}
            onClick={() => buy(exact.coins)}
            className="h-auto w-full flex-col gap-0.5 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 py-3 font-black text-white shadow-lg shadow-orange-500/30 hover:opacity-95 active:scale-[0.98]"
          >
            <span className="flex items-center gap-1.5 text-base">
              {loadingCoins === exact.coins && (
                <Loader2 className="size-4 animate-spin" />
              )}
              足りない分を買って{props.label}を引く
            </span>
            <span className="flex items-center gap-1 font-bold text-sm text-white/90">
              <PremiumCoinIcon className="size-3.5" />
              {totalOf(exact.coins, exact.bonusCoins).toLocaleString()} コイン
              ・¥{exact.priceYen.toLocaleString()}
            </span>
          </Button>

          {shortage.options.length > 1 && (
            <div className="space-y-1.5">
              <p className="text-muted-foreground text-xs">
                まとめて買うとおまけ付き
              </p>
              <div
                className={cn(
                  "grid gap-2",
                  shortage.options.length > 2 && "grid-cols-2",
                )}
              >
                {shortage.options
                  .filter((option) => option.coins !== exact.coins)
                  .map((option) => (
                    <button
                      key={option.coins}
                      type="button"
                      disabled={loadingCoins !== null}
                      onClick={() => buy(option.coins)}
                      className={cn(
                        "flex flex-col items-start rounded-xl border bg-card p-3 text-left transition-colors hover:border-orange-400/70 hover:bg-muted/60 disabled:opacity-60",
                      )}
                    >
                      <span className="flex items-center gap-1 font-bold text-sm tabular-nums">
                        <PremiumCoinIcon className="size-3.5" />
                        {totalOf(
                          option.coins,
                          option.bonusCoins,
                        ).toLocaleString()}
                        {loadingCoins === option.coins && (
                          <Loader2 className="size-3.5 animate-spin" />
                        )}
                      </span>
                      {option.bonusCoins > 0 && (
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
                          {option.bonusCoins.toLocaleString()} 枚おまけ
                        </span>
                      )}
                      <span className="mt-0.5 font-semibold text-sm">
                        ¥{option.priceYen.toLocaleString()}
                      </span>
                    </button>
                  ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-x-4 text-sm">
            {canDrawSingle && (
              <button
                type="button"
                onClick={() => {
                  props.onOpenChange(false)
                  props.onDrawSingle?.()
                }}
                className="min-h-9 text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                いまのコインで 1 回引く
              </button>
            )}
            {!props.onPurchase && (
              <button
                type="button"
                onClick={() => {
                  props.onOpenChange(false)
                  setIsCustomOpen(true)
                }}
                className="min-h-9 text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                ほかの枚数を選ぶ
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>
      {!props.onPurchase && (
        <PurchasePremiumCoinsDialog
          currentBalance={props.balance}
          open={isCustomOpen}
          onOpenChange={setIsCustomOpen}
          hideTrigger={true}
          initialCoinAmount={exact.coins}
          successPath={props.successPath}
          cancelPath={props.cancelPath}
        />
      )}
    </>
  )
}
