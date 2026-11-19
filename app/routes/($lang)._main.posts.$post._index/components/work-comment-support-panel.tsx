import { Heart, Loader2Icon } from "lucide-react"
import { useContext } from "react"
import { CoinAmountStepper } from "~/components/coin-amount-stepper"
import {
  FreeSupportCoinIcon,
  PremiumSupportCoinIcon,
} from "~/components/support-coin-icons"
import {
  SupportRewardJoinedBadge,
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
    | "currentSupportDraft"
    | "isCreatingWorkComment"
    | "onWorkComment"
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
    | "supportTarget"
  >,
) {
  const t = useTranslation()
  const authContext = useContext(AuthContext)
  const {
    coinBalances,
    comment,
    currentSupportDraft,
    isCreatingWorkComment,
    onWorkComment,
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
    supportTarget,
  } = props
  const isPremiumAccepted = supportTarget?.premiumAccepted !== false
  // 報酬の印と一言は、全年齢の作品で、作者が報酬に参加していてプレミアムコインを受け取るときだけ
  const isRewardTarget =
    isCreatorRewardRating(workRating) &&
    supportTarget?.rewardJoined === true &&
    isPremiumAccepted

  const previewPt = toSupportPt(
    currentFreeSupportCoinAmount,
    currentPremiumSupportCoinAmount,
  )

  const previewMessage = (
    <p
      className={cn(
        "line-clamp-3 whitespace-pre-wrap break-words text-sm",
        comment.trim() === "" && "text-muted-foreground",
      )}
    >
      {comment.trim() === ""
        ? t(
            "金額とメッセージは公開されます（コメントなしでも送れます）",
            "The amount and message are public (comment is optional)",
          )
        : comment}
    </p>
  )

  const needsPremiumPurchase =
    supportCoinType === "PREMIUM" &&
    !isLoadingCoinSummary &&
    coinBalances.premiumBalance === 0

  return (
    <div className="space-y-3 rounded-2xl bg-rose-500/5 p-3 ring-1 ring-rose-500/20 md:ml-13">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 font-bold text-sm">
          <Heart className="size-4 fill-rose-500 text-rose-500" />
          {t("コインで推す", "Support with coins")}
        </p>
        {isRewardTarget && <SupportRewardJoinedBadge />}
      </div>
      {/* 送るとコメントがどう表示されるかの見本（YouTube のスーパーサンクスのように、金額とメッセージは公開される） */}
      {previewPt > 0 ? (
        <SupportSuperChatCard
          support={{
            freeCoinAmount: currentFreeSupportCoinAmount,
            premiumCoinAmount: currentPremiumSupportCoinAmount,
            totalPt: previewPt,
          }}
          header={
            <span className="block truncate font-bold text-sm">
              {supportIsAnonymous
                ? t("匿名", "Anonymous")
                : (authContext.displayName ?? t("あなた", "You"))}
            </span>
          }
        >
          {previewMessage}
        </SupportSuperChatCard>
      ) : (
        <div className="space-y-2 rounded-2xl bg-background/70 px-3 py-2.5 ring-1 ring-border">
          <span className="block truncate font-bold text-sm">
            {supportIsAnonymous
              ? t("匿名", "Anonymous")
              : (authContext.displayName ?? t("あなた", "You"))}
          </span>
          {previewMessage}
        </div>
      )}
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
            disabled={item.type === "PREMIUM" && !isPremiumAccepted}
            onClick={() => {
              setSupportCoinType(item.type)
              setSupportCoinAmount(item.type, "0")
            }}
            className={cn(
              "flex min-w-0 items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50",
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
      {!isPremiumAccepted && (
        <p className="text-[11px] text-muted-foreground">
          {t(
            "この作者はプレミアムコインでの応援を受け付けていません。フリーコインで推せます",
            "This creator does not accept support with premium coins. You can support with free coins",
          )}
        </p>
      )}
      {needsPremiumPurchase ? (
        <p className="text-muted-foreground text-xs">
          {t(
            "プレミアムコインがありません。購入するとそのまま推せます",
            "You have no premium coins. Buy some to support",
          )}
        </p>
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
                      getSupportTier({
                        freeCoinAmount: supportCoinType === "FREE" ? amount : 0,
                        premiumCoinAmount:
                          supportCoinType === "PREMIUM" ? amount : 0,
                      }),
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
                  {amount.toLocaleString()}
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
      {/* 送る・買うの大きなボタン（YouTube の「購入して送信」のように、押すと何が起きるか分かる言い方） */}
      {needsPremiumPurchase ? (
        <Button
          type="button"
          className="h-11 w-full rounded-full font-bold"
          onClick={() => setIsPremiumPurchaseDialogOpen(true)}
        >
          {t("プレミアムコインを購入する", "Buy premium coins")}
        </Button>
      ) : (
        <Button
          type="button"
          disabled={currentSupportDraft === null || isCreatingWorkComment}
          className="h-11 w-full gap-1.5 rounded-full border-0 bg-gradient-to-r from-pink-500 to-rose-500 font-bold text-white hover:opacity-90"
          onClick={() => void onWorkComment()}
        >
          {isCreatingWorkComment ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : currentSupportDraft === null ? (
            t("金額を選んでください", "Choose an amount")
          ) : (
            <>
              {supportCoinType === "FREE" ? (
                <FreeSupportCoinIcon className="size-5 rounded-full bg-white/90 p-px" />
              ) : (
                <PremiumSupportCoinIcon className="size-5 rounded-full bg-white/90 p-px" />
              )}
              {t(
                `${(supportCoinType === "FREE" ? currentFreeSupportCoinAmount : currentPremiumSupportCoinAmount).toLocaleString()}枚で推して送信`,
                `Send with ${(supportCoinType === "FREE" ? currentFreeSupportCoinAmount : currentPremiumSupportCoinAmount).toLocaleString()} coins`,
              )}
            </>
          )}
        </Button>
      )}
      {isRewardTarget && <SupportRewardNote />}
    </div>
  )
}
