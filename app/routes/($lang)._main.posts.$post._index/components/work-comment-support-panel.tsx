import { useContext } from "react"
import { CoinAmountStepper } from "~/components/coin-amount-stepper"
import {
  FreeSupportCoinIcon,
  PremiumSupportCoinIcon,
} from "~/components/support-coin-icons"
import {
  SupportRewardNote,
  SupportSuperChatCard,
  supportAmountButtonClassName,
} from "~/components/support-super-chat"
import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import {
  SUPPORT_FREE_COIN_STEPS,
  SUPPORT_PREMIUM_COIN_STEPS,
} from "~/routes/($lang)._main.posts.$post._index/components/work-comment-list-utils"
import type { WorkCommentListState } from "~/routes/($lang)._main.posts.$post._index/hooks/use-work-comment-list"
import {
  getSupportTier,
  isCreatorRewardRating,
  toSupportPt,
} from "~/utils/support-tier"

/**
 * コメントに付ける推しコインの入力欄
 */
export function WorkCommentSupportPanel(
  props: Pick<
    WorkCommentListState,
    | "coinBalances"
    | "comment"
    | "workRating"
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
  const authContext = useContext(AuthContext)
  const {
    coinBalances,
    comment,
    workRating,
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

  const previewPt = toSupportPt(
    currentFreeSupportCoinAmount,
    currentPremiumSupportCoinAmount,
  )

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
                <button
                  key={amount}
                  type="button"
                  aria-pressed={current === amount}
                  className={cn(
                    "h-9 min-w-0 flex-1 rounded-full px-0 text-sm",
                    supportAmountButtonClassName(
                      getSupportTier(
                        supportCoinType === "FREE" ? amount : amount * 10,
                      ),
                      current === amount,
                    ),
                  )}
                  disabled={amount > balance}
                  onClick={() =>
                    setSupportCoinAmount(
                      supportCoinType,
                      current === amount ? "0" : String(amount),
                    )
                  }
                >
                  {amount}
                </button>
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
      {previewPt > 0 && (
        // 送るとコメントがどう目立つかの見本（段階の色）
        <div className="space-y-1">
          <p className="text-[11px] text-muted-foreground">
            {t(
              "コメントはこう表示されます",
              "Your comment will look like this",
            )}
          </p>
          <SupportSuperChatCard
            support={{
              freeCoinAmount: currentFreeSupportCoinAmount,
              premiumCoinAmount: currentPremiumSupportCoinAmount,
              totalPt: previewPt,
            }}
            header={
              <span className="block truncate font-bold text-xs">
                {supportIsAnonymous
                  ? t("匿名", "Anonymous")
                  : (authContext.displayName ?? t("あなた", "You"))}
              </span>
            }
          >
            <p className="line-clamp-3 whitespace-pre-wrap break-words text-sm">
              {comment.trim() === ""
                ? t("（コメントなしでも送れます）", "(Comment is optional)")
                : comment}
            </p>
          </SupportSuperChatCard>
        </div>
      )}
      {isCreatorRewardRating(workRating) && <SupportRewardNote isWork />}
    </div>
  )
}
