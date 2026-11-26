import { isApolloError } from "@apollo/client/errors"
import { useMutation, useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { AlertTriangle, PauseCircle, Trash2 } from "lucide-react"
import { useId, useState } from "react"
import { toast } from "sonner"
import { LeaveSurveyFields } from "~/components/leave-survey-fields"
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog"
import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"
import { WithdrawAccountForm } from "~/routes/($lang).settings.account.withdrawal/components/withdraw-account-form"
import { logoutFirebase } from "~/utils/auth-session-backup"
import {
  emptyLeaveSurveyAnswer,
  isLeaveSurveyComplete,
  type LeaveSurveyAnswer,
  toLeaveSurveyDetails,
} from "~/utils/leave-survey"
import { resetCookieLoginToken } from "~/utils/reset-cookie-login-token"

type Step = "survey" | "choose" | "withdraw" | "paused"

/**
 * 退会の流れ: 理由のアンケート → 一時停止か退会かを選ぶ → （一時停止）課金の確認と停止 / （退会）今までの確認
 * 一時停止は system の pauseAccount（lib/account-pause.ts）。データは消さず、再びログインして再開できる
 */
export function AccountLeaveFlow(props: { initialStep?: Step }) {
  const t = useTranslation()
  const cancelSubscriptionId = useId()
  const [step, setStep] = useState<Step>(props.initialStep ?? "survey")
  const [answer, setAnswer] = useState<LeaveSurveyAnswer>(
    emptyLeaveSurveyAnswer,
  )
  const [agreeCancelSubscription, setAgreeCancelSubscription] = useState(false)
  const [isPauseConfirmOpen, setIsPauseConfirmOpen] = useState(false)
  const { data } = useQuery(accountLeaveViewerQuery)
  const [submitSurvey] = useMutation(submitAccountLeaveSurveyMutation)
  const [pauseAccount, { loading: isPausing }] =
    useMutation(pauseAccountMutation)

  const subscriptionState =
    data?.viewer?.accountPauseSubscriptionState ?? "NONE"
  const storeProvider = data?.viewer?.currentPass?.paymentProvider
  const needsCancel = subscriptionState === "STRIPE_ACTIVE"
  const canPause = !needsCancel || agreeCancelSubscription
  const isComplete = isLeaveSurveyComplete("account", answer)

  const sendSurvey = async (outcome: "pause" | "withdraw") => {
    if (!answer.reason) return
    await submitSurvey({
      variables: {
        input: {
          reason: answer.reason,
          outcome,
          note:
            answer.reason === "other" ? answer.text.trim().slice(0, 500) : null,
          details: JSON.stringify(toLeaveSurveyDetails("account", answer)),
        },
      },
    })
  }

  const onPause = async () => {
    try {
      await sendSurvey("pause").catch(() => undefined)
      await pauseAccount({
        variables: { input: { cancelSubscription: needsCancel } },
      })
      setIsPauseConfirmOpen(false)
      resetCookieLoginToken()
      try {
        await logoutFirebase()
      } catch {
        // 停止は済んでいる。次にログインしたときに再開の確認が出る
      }
      setStep("paused")
      window.scrollTo({ top: 0 })
    } catch (error) {
      toast(
        error instanceof Error && isApolloError(error)
          ? error.message
          : t(
              "一時停止できませんでした。時間をおいてもう一度お試しください。",
              "We couldn't pause your account. Please try again in a moment.",
            ),
      )
    }
  }

  if (step === "paused") {
    return (
      <div className="space-y-4 rounded-lg border p-6 text-sm">
        <p className="flex items-center gap-2 font-semibold text-base">
          <PauseCircle className="size-5 text-sky-500" />
          {t("アカウントを一時停止しました", "Your account is paused")}
        </p>
        <p className="text-muted-foreground">
          {t(
            "プロフィール・作品・コメントは、ほかの人から見えなくなりました。データはそのまま残っています。",
            "Your profile, works and comments are now hidden from others. Your data is kept as is.",
          )}
        </p>
        <p className="text-muted-foreground">
          {t(
            "再開するときは、同じ方法でもう一度ログインして「再開する」を押してください。",
            'To come back, log in again the same way and press "Reactivate".',
          )}
        </p>
        <Button asChild>
          <a href="/">{t("トップへ", "Go to the top page")}</a>
        </Button>
      </div>
    )
  }

  if (step === "survey") {
    return (
      <div className="space-y-4">
        <div className="space-y-1">
          <p className="font-semibold">
            {t(
              "退会する前に、理由を教えてください",
              "Before you go, could you tell us why?",
            )}
          </p>
          <p className="text-muted-foreground text-sm">
            {t(
              "これからの改善に使わせていただきます。退会の代わりに、データを残したまま「一時停止」することもできます。",
              "Your answer helps us improve. Instead of deleting your account, you can also pause it and keep your data.",
            )}
          </p>
        </div>
        <LeaveSurveyFields kind="account" value={answer} onChange={setAnswer} />
        <Button
          className="w-full"
          disabled={!isComplete}
          onClick={() => {
            setStep("choose")
            window.scrollTo({ top: 0 })
          }}
        >
          {t("次へ", "Next")}
        </Button>
      </div>
    )
  }

  if (step === "withdraw") {
    return (
      <div className="space-y-4">
        <button
          type="button"
          className="text-muted-foreground text-sm underline"
          onClick={() => setStep("choose")}
        >
          {t("← 一時停止にする", "← Pause instead")}
        </button>
        <WithdrawAccountForm beforeWithdraw={() => sendSurvey("withdraw")} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="font-semibold">
        {t(
          "退会の代わりに、一時停止もできます",
          "You can pause your account instead",
        )}
      </p>

      <div className="space-y-3 rounded-lg border border-sky-500/50 bg-sky-500/5 p-4 text-sm">
        <p className="flex items-center gap-2 font-semibold">
          <PauseCircle className="size-4 text-sky-500" />
          {t("一時停止する（おすすめ）", "Pause my account (recommended)")}
        </p>
        <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
          <li>
            {t(
              "プロフィール・作品・コメントが、ほかの人から見えなくなります（検索・ランキング・タイムライン・おすすめなどにも出ません）",
              "Your profile, works and comments are hidden from others (including search, rankings, timelines and recommendations)",
            )}
          </li>
          <li>
            {t(
              "フォロー・いいね・コメントなど、ほかの人からの操作も受け付けません",
              "Others can't follow you, like or comment on your works",
            )}
          </li>
          <li>
            {t(
              "作品・コイン・パスなどのデータは消えません。もう一度ログインすれば、いつでも元に戻せます（停止する前に非公開だった作品は非公開のまま）",
              "Your works, coins and passes are kept. Log in again any time to restore everything (works that were private stay private)",
            )}
          </li>
        </ul>

        {needsCancel && (
          <div className="space-y-2 rounded-md border border-amber-400/60 bg-amber-50/70 p-3 dark:bg-amber-950/20">
            <p className="font-medium">
              {t(
                "有料プランが自動で更新されます",
                "Your paid plan renews automatically",
              )}
            </p>
            <p className="text-muted-foreground">
              {t(
                "停止中に料金がかからないよう、一時停止と同時にプランの解約を予約します。今の期間の終わりまではプランの特典が残り、それ以降の請求はありません。コインやパスはそのまま残ります。",
                "So you aren't charged while paused, your plan will be set to cancel when you pause. You keep your plan until the end of the current period and won't be charged after that. Coins and passes are kept.",
              )}
            </p>
            <label
              htmlFor={cancelSubscriptionId}
              className="flex items-start gap-2"
            >
              <Checkbox
                id={cancelSubscriptionId}
                checked={agreeCancelSubscription}
                onCheckedChange={(checked) =>
                  setAgreeCancelSubscription(checked === true)
                }
              />
              <span className="leading-6">
                {t(
                  "プランの解約を予約して一時停止する",
                  "Cancel my plan at the end of the period and pause",
                )}
              </span>
            </label>
          </div>
        )}
        {subscriptionState === "STRIPE_CANCEL_SCHEDULED" && (
          <p className="text-muted-foreground">
            {t(
              "有料プランは解約予約済みです。今の期間の終わりで終了し、停止中に請求はありません。",
              "Your plan is already set to cancel at the end of the period, so you won't be charged while paused.",
            )}
          </p>
        )}
        {subscriptionState === "STORE" && (
          <Alert variant="destructive">
            <AlertTriangle className="size-4" />
            <AlertTitle>
              {t(
                "アプリで購入したプランは、ストアで解約してください",
                "Cancel your app subscription in the store",
              )}
            </AlertTitle>
            <AlertDescription>
              {storeProvider === "GOOGLE_PLAY"
                ? t(
                    "一時停止しても Google Play の定期購入は止まりません。Google Play ストアの［お支払いと定期購入］→［定期購入］から解約してください。",
                    "Pausing doesn't stop your Google Play subscription. Cancel it in Google Play → Payments & subscriptions → Subscriptions.",
                  )
                : t(
                    "一時停止しても App Store の定期購入は止まりません。iPhone の［設定］→［Apple ID］→［サブスクリプション］から解約してください。",
                    "Pausing doesn't stop your App Store subscription. Cancel it in Settings → Apple ID → Subscriptions on your iPhone.",
                  )}
            </AlertDescription>
          </Alert>
        )}

        <Button
          className="w-full"
          disabled={!canPause || isPausing}
          onClick={() => setIsPauseConfirmOpen(true)}
        >
          {t("一時停止する", "Pause my account")}
        </Button>
      </div>

      <div className={cn("space-y-2 rounded-lg border p-4 text-sm")}>
        <p className="flex items-center gap-2 font-semibold">
          <Trash2 className="size-4 text-destructive" />
          {t("退会する", "Delete my account")}
        </p>
        <p className="text-muted-foreground">
          {t(
            "アカウント情報を削除し、作品は非公開になります。元には戻せません。",
            "Your account information is deleted and your works become private. This can't be undone.",
          )}
        </p>
        <Button
          variant="outline"
          className="w-full border-destructive/50 text-destructive"
          onClick={() => {
            setStep("withdraw")
            window.scrollTo({ top: 0 })
          }}
        >
          {t("退会の手続きに進む", "Continue to delete my account")}
        </Button>
      </div>

      <p className="text-center text-muted-foreground text-xs">
        {t("やめる場合は", "Changed your mind?")}{" "}
        <Link to="/" className="underline">
          {t("トップに戻る", "Back to the top page")}
        </Link>
      </p>

      <AlertDialog
        open={isPauseConfirmOpen}
        onOpenChange={(open) => !isPausing && setIsPauseConfirmOpen(open)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("アカウントを一時停止しますか？", "Pause your account?")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                "停止するとログアウトします。再開するときは、もう一度ログインしてください。",
                "You'll be logged out. To come back, just log in again.",
              )}
              {needsCancel &&
                t(
                  " 有料プランは今の期間の終わりで終了します。",
                  " Your paid plan will end at the end of the current period.",
                )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPausing}>
              {t("やめる", "Cancel")}
            </AlertDialogCancel>
            <Button disabled={isPausing} onClick={onPause}>
              {isPausing
                ? t("停止しています…", "Pausing…")
                : t("一時停止する", "Pause")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

const accountLeaveViewerQuery = graphql(
  `query AccountLeaveViewer {
    viewer {
      id
      accountPauseSubscriptionState
      currentPass {
        id
        paymentProvider
      }
    }
  }`,
)

const submitAccountLeaveSurveyMutation = graphql(
  `mutation SubmitAccountLeaveSurvey($input: SubmitAccountLeaveSurveyInput!) {
    submitAccountLeaveSurvey(input: $input)
  }`,
)

const pauseAccountMutation = graphql(
  `mutation PauseAccount($input: PauseAccountInput) {
    pauseAccount(input: $input)
  }`,
)
