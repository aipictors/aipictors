import { Heart, XIcon } from "lucide-react"
import { useContext } from "react"
import { CoinAmountStepper } from "~/components/coin-amount-stepper"
import { HideCoinSupportButton } from "~/components/hide-coin-support-button"
import {
  FreeSupportCoinIcon,
  PremiumSupportCoinIcon,
} from "~/components/support-coin-icons"
import {
  PremiumSupportOriginalOnlyNote,
  SupportRewardJoinedBadge,
  SupportRewardNote,
  SupportSuperChatCard,
  supportAmountButtonClassName,
} from "~/components/support-super-chat"
import { Button } from "~/components/ui/button"
import { Switch } from "~/components/ui/switch"
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
 * コメントに付ける推しコインの入力欄（コメントの入力枠の中に出す）
 * 1. コインの種類 → 2. 枚数（よく使う枚数 or −＋）→ 見本、の順に上から選ぶ。
 * 送信は入力枠の右下のボタン 1 つ（ここには置かない）
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
    | "isPremiumAllowedForWork"
    | "setIsPremiumPurchaseDialogOpen"
    | "setSupportCoinAmount"
    | "setSupportCoinType"
    | "setSupportIsAnonymous"
    | "supportCoinType"
    | "supportFreeCoinAmount"
    | "supportIsAnonymous"
    | "supportPremiumCoinAmount"
    | "supportTarget"
  > & { onClose: () => void },
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
    isPremiumAllowedForWork,
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
  const canSelectPremium = isPremiumAccepted && isPremiumAllowedForWork
  const isFreeReceiveAccepted = supportTarget?.freeReceiveAccepted !== false
  // 報酬の印と一言は、全年齢のオリジナル作品で、作者が報酬に参加していてプレミアムコインを受け取るときだけ
  const isRewardTarget =
    isCreatorRewardRating(workRating) &&
    supportTarget?.rewardJoined === true &&
    canSelectPremium

  const header = (
    <div className="flex items-center justify-between gap-2">
      <p className="flex min-w-0 items-center gap-1.5 font-bold text-sm">
        <Heart className="size-4 shrink-0 fill-rose-500 text-rose-500" />
        {t("コインで推す", "Support with coins")}
        {isRewardTarget && <SupportRewardJoinedBadge />}
      </p>
      <div className="-mr-1 flex shrink-0 items-center gap-1">
        {/* その場で推しを表示しない設定にする入口 */}
        <HideCoinSupportButton isShortOnMobile />
        <button
          type="button"
          onClick={props.onClose}
          aria-label={t("推しをやめる", "Cancel support")}
          className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <XIcon className="size-4" />
        </button>
      </div>
    </div>
  )

  // 作者が「推しを受け付けない」設定のときは、枚数を選ぶ欄の代わりにその旨だけ出す
  if (supportTarget?.supportAccepted === false) {
    return (
      <div className="space-y-2">
        {header}
        <p className="rounded-xl bg-muted p-3 text-muted-foreground text-sm">
          {t(
            "この作者は推しを受け付けていません",
            "This creator does not accept support",
          )}
        </p>
      </div>
    )
  }

  const isFree = supportCoinType === "FREE"
  const currentAmount = isFree
    ? currentFreeSupportCoinAmount
    : currentPremiumSupportCoinAmount
  const currentBalance = isFree
    ? coinBalances.freeBalance
    : coinBalances.premiumBalance
  const previewPt = toSupportPt(
    currentFreeSupportCoinAmount,
    currentPremiumSupportCoinAmount,
  )
  const needsPremiumPurchase =
    !isFree && !isLoadingCoinSummary && coinBalances.premiumBalance === 0

  const coinTypes = [
    {
      type: "FREE",
      icon: <FreeSupportCoinIcon className="size-5" />,
      label: t("フリー", "Free"),
      rate: t("1枚 = 1pt", "1 coin = 1pt"),
      balance: coinBalances.freeBalance,
      isDisabled: false,
    },
    {
      type: "PREMIUM",
      icon: <PremiumSupportCoinIcon className="size-5" />,
      label: t("プレミアム", "Premium"),
      rate: !isPremiumAllowedForWork
        ? t("オリジナル作品だけ", "Original works only")
        : isPremiumAccepted
          ? t("1枚 = 10pt", "1 coin = 10pt")
          : t("受け付けていません", "Not accepted"),
      balance: coinBalances.premiumBalance,
      isDisabled: !canSelectPremium,
    },
  ] as const

  const senderName = supportIsAnonymous
    ? t("匿名", "Anonymous")
    : (authContext.displayName ?? t("あなた", "You"))

  return (
    <div className="space-y-3">
      {header}

      {/* 1. コインの種類（残高と 1 枚あたりの pt を一緒に見せる） */}
      <div className="grid grid-cols-2 gap-2">
        {coinTypes.map((item) => {
          const isSelected = supportCoinType === item.type
          return (
            <button
              key={item.type}
              type="button"
              aria-pressed={isSelected}
              disabled={item.isDisabled}
              onClick={() => {
                setSupportCoinType(item.type)
                setSupportCoinAmount(item.type, "0")
              }}
              className={cn(
                "flex min-w-0 flex-col gap-1 rounded-xl border-2 bg-background px-2.5 py-2 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                isSelected
                  ? "border-rose-500 shadow-sm"
                  : "border-border/60 hover:border-rose-500/40",
              )}
            >
              <span className="flex min-w-0 items-center gap-1.5">
                <span className="shrink-0">{item.icon}</span>
                <span className="truncate font-bold text-xs">{item.label}</span>
              </span>
              <span className="flex items-baseline justify-between gap-1 text-[10px] text-muted-foreground">
                <span className="truncate">{item.rate}</span>
                <span className="shrink-0">
                  <span className="font-bold text-foreground text-sm tabular-nums">
                    {isLoadingCoinSummary ? "…" : item.balance.toLocaleString()}
                  </span>
                  {t("枚", "")}
                </span>
              </span>
            </button>
          )
        })}
      </div>
      {!isPremiumAllowedForWork ? (
        <PremiumSupportOriginalOnlyNote
          variant="work"
          className="text-[11px]"
        />
      ) : (
        !isPremiumAccepted && (
          <p className="text-[11px] text-muted-foreground">
            {t(
              "この作者はプレミアムコインでの応援を受け付けていません。フリーコインで推せます",
              "This creator does not accept support with premium coins. You can support with free coins",
            )}
          </p>
        )
      )}
      {!isFreeReceiveAccepted && isFree && (
        <p className="text-[11px] text-muted-foreground">
          {t(
            "この作者はフリーコインを受け取らない設定です。推しの pt は届きます",
            "This creator does not receive free coins. Your support points are still added",
          )}
        </p>
      )}

      {/* 2. 枚数 */}
      {needsPremiumPurchase ? (
        <div className="space-y-2 rounded-xl bg-background p-3 ring-1 ring-border">
          <p className="text-muted-foreground text-xs">
            {t(
              "プレミアムコインがありません。購入するとそのまま推せます",
              "You have no premium coins. Buy some to support",
            )}
          </p>
          <Button
            type="button"
            className="h-10 w-full rounded-full font-bold"
            onClick={() => setIsPremiumPurchaseDialogOpen(true)}
          >
            {t("プレミアムコインを購入する", "Buy premium coins")}
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-5 gap-1.5">
            {(isFree
              ? SUPPORT_FREE_COIN_STEPS
              : SUPPORT_PREMIUM_COIN_STEPS
            ).map((amount) => (
              <button
                key={amount}
                type="button"
                aria-pressed={currentAmount === amount}
                className={cn(
                  "h-10 min-w-0 rounded-xl px-0 text-xs sm:text-sm",
                  supportAmountButtonClassName(
                    getSupportTier({
                      freeCoinAmount: isFree ? amount : 0,
                      premiumCoinAmount: isFree ? 0 : amount,
                    }),
                    currentAmount === amount,
                  ),
                )}
                disabled={amount > currentBalance}
                onClick={() =>
                  setSupportCoinAmount(
                    supportCoinType,
                    currentAmount === amount ? "0" : String(amount),
                  )
                }
              >
                {amount.toLocaleString()}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <CoinAmountStepper
              className="min-w-0 flex-1"
              value={isFree ? supportFreeCoinAmount : supportPremiumCoinAmount}
              max={currentBalance}
              onChange={(value) => setSupportCoinAmount(supportCoinType, value)}
            />
            {/* 選んだ枚数が何 pt になるか */}
            <div
              aria-live="polite"
              className="w-20 shrink-0 text-right leading-tight"
            >
              <span className="block text-[10px] text-muted-foreground">
                {t("推しpt", "Points")}
              </span>
              <span
                className={cn(
                  "font-black text-lg tabular-nums",
                  previewPt > 0
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-muted-foreground",
                )}
              >
                {previewPt.toLocaleString()}
                <span className="ml-0.5 font-bold text-xs">pt</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 送るとコメントがどう表示されるかの見本（YouTube のスーパーサンクスのように、金額とメッセージは公開される） */}
      {previewPt > 0 && (
        <div className="space-y-1">
          <p className="text-[11px] text-muted-foreground">
            {t(
              "このように表示されます（金額とメッセージは公開）",
              "Preview (amount and message are public)",
            )}
          </p>
          <SupportSuperChatCard
            support={{
              freeCoinAmount: currentFreeSupportCoinAmount,
              premiumCoinAmount: currentPremiumSupportCoinAmount,
              totalPt: previewPt,
            }}
            header={
              <span className="block truncate font-bold text-sm">
                {senderName}
              </span>
            }
          >
            <p
              className={cn(
                "line-clamp-3 whitespace-pre-wrap break-words text-sm",
                comment.trim() === "" && "text-muted-foreground",
              )}
            >
              {comment.trim() === ""
                ? t("（メッセージなし）", "(No message)")
                : comment}
            </p>
          </SupportSuperChatCard>
        </div>
      )}

      <label
        htmlFor="support-anonymous-switch"
        className="flex cursor-pointer items-center justify-between gap-2 text-sm"
      >
        <span>
          {t("匿名で推す", "Support anonymously")}
          <span className="ml-1.5 text-[11px] text-muted-foreground">
            {t("名前を出さずに表示", "Hide your name")}
          </span>
        </span>
        <Switch
          id="support-anonymous-switch"
          checked={supportIsAnonymous}
          onCheckedChange={(checked) => setSupportIsAnonymous(checked)}
          className="data-[state=checked]:bg-rose-500"
        />
      </label>
      {isRewardTarget && <SupportRewardNote />}
    </div>
  )
}
