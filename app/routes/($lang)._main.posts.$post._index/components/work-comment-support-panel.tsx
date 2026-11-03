import { CoinAmountStepper } from "~/components/coin-amount-stepper"
import {
  FreeSupportCoinIcon,
  PremiumSupportCoinIcon,
} from "~/components/support-coin-icons"
import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import {
  SUPPORT_FREE_COIN_STEPS,
  SUPPORT_PREMIUM_COIN_STEPS,
} from "~/routes/($lang)._main.posts.$post._index/components/work-comment-list-utils"
import type { WorkCommentListState } from "~/routes/($lang)._main.posts.$post._index/hooks/use-work-comment-list"

/**
 * コメントに付ける推しコインの入力欄
 */
export function WorkCommentSupportPanel(
  props: Pick<
    WorkCommentListState,
    | "coinBalances"
    | "currentFreeSupportCoinAmount"
    | "currentPremiumSupportCoinAmount"
    | "isLoadingCoinSummary"
    | "setIsPremiumPurchaseDialogOpen"
    | "setSupportCoinAmount"
    | "setSupportCoinType"
    | "setSupportIsAnonymous"
    | "supportCoinType"
    | "supportFreeCoinAmount"
    | "supportIsAnonymous"
    | "supportPremiumCoinAmount"
  >,
) {
  const t = useTranslation()
  const {
    coinBalances,
    currentFreeSupportCoinAmount,
    currentPremiumSupportCoinAmount,
    isLoadingCoinSummary,
    setIsPremiumPurchaseDialogOpen,
    setSupportCoinAmount,
    setSupportCoinType,
    setSupportIsAnonymous,
    supportCoinType,
    supportFreeCoinAmount,
    supportIsAnonymous,
    supportPremiumCoinAmount,
  } = props

  return (
    <div className="space-y-2.5 rounded-2xl bg-rose-500/5 p-3 ring-1 ring-rose-500/20 md:ml-13">
      <div className="flex items-center gap-1.5">
        {(
          [
            {
              type: "FREE",
              icon: <FreeSupportCoinIcon className="size-4" />,
              label: t("フリー", "Free"),
              balance: coinBalances.freeBalance,
            },
            {
              type: "PREMIUM",
              icon: <PremiumSupportCoinIcon className="size-4" />,
              label: t("プレミアム×10pt", "Premium ×10pt"),
              balance: coinBalances.premiumBalance,
            },
          ] as const
        ).map((item) => (
          <button
            key={item.type}
            type="button"
            aria-pressed={supportCoinType === item.type}
            onClick={() => {
              setSupportCoinType(item.type)
              setSupportCoinAmount(item.type, "0")
            }}
            className={cn(
              "flex min-w-0 items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs transition-colors",
              supportCoinType === item.type
                ? "bg-background font-bold shadow-sm ring-1 ring-rose-500/50"
                : "text-muted-foreground hover:bg-background/60",
            )}
          >
            {item.icon}
            {item.label}
            <span className="tabular-nums">
              {isLoadingCoinSummary ? "…" : item.balance.toLocaleString()}
            </span>
          </button>
        ))}
      </div>
      {supportCoinType === "PREMIUM" &&
      !isLoadingCoinSummary &&
      coinBalances.premiumBalance === 0 ? (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="w-full"
          onClick={() => setIsPremiumPurchaseDialogOpen(true)}
        >
          {t("プレミアムコインを購入", "Buy premium coins")}
        </Button>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            {(supportCoinType === "FREE"
              ? SUPPORT_FREE_COIN_STEPS
              : SUPPORT_PREMIUM_COIN_STEPS
            ).map((amount) => {
              const current =
                supportCoinType === "FREE"
                  ? currentFreeSupportCoinAmount
                  : currentPremiumSupportCoinAmount
              const balance =
                supportCoinType === "FREE"
                  ? coinBalances.freeBalance
                  : coinBalances.premiumBalance
              return (
                <Button
                  key={amount}
                  type="button"
                  size="sm"
                  variant={current === amount ? "default" : "outline"}
                  aria-pressed={current === amount}
                  className="h-9 min-w-0 flex-1 rounded-full bg-background px-0 font-bold tabular-nums aria-pressed:bg-primary"
                  disabled={amount > balance}
                  onClick={() =>
                    setSupportCoinAmount(
                      supportCoinType,
                      current === amount ? "0" : String(amount),
                    )
                  }
                >
                  {amount}
                </Button>
              )
            })}
          </div>
          <CoinAmountStepper
            value={
              supportCoinType === "FREE"
                ? supportFreeCoinAmount
                : supportPremiumCoinAmount
            }
            max={
              supportCoinType === "FREE"
                ? coinBalances.freeBalance
                : coinBalances.premiumBalance
            }
            onChange={(value) => setSupportCoinAmount(supportCoinType, value)}
          />
        </div>
      )}
      <label
        htmlFor="support-anonymous-checkbox"
        className="flex w-fit cursor-pointer items-center gap-1.5 text-muted-foreground text-xs"
      >
        <Checkbox
          id="support-anonymous-checkbox"
          checked={supportIsAnonymous}
          onCheckedChange={(checked: boolean) =>
            setSupportIsAnonymous(checked === true)
          }
        />
        {t("匿名で推す", "Support anonymously")}
      </label>
    </div>
  )
}
