import { isApolloError } from "@apollo/client/errors"
import { useMutation, useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { AlertTriangle } from "lucide-react"
import { useId, useState } from "react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog"
import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
import { Input } from "~/components/ui/input"
import { useTranslation } from "~/hooks/use-translation"
import { logoutFirebase } from "~/utils/auth-session-backup"
import { resetCookieLoginToken } from "~/utils/reset-cookie-login-token"

export function WithdrawAccountForm(props: {
  /** 退会の直前に呼ぶ（理由のアンケートを送る。失敗しても退会は続ける） */
  beforeWithdraw?: () => Promise<void>
}) {
  const t = useTranslation()
  const { data, loading: isUserLoading } = useQuery(viewerUserQuery)
  const irreversibleConfirmId = useId()
  const signOutConfirmId = useId()
  const finalConfirmId = useId()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loginPrefixInput, setLoginPrefixInput] = useState("")
  const [hasConfirmedIrreversible, setHasConfirmedIrreversible] =
    useState(false)
  const [hasConfirmedSignOut, setHasConfirmedSignOut] = useState(false)
  const [hasConfirmedFinalStep, setHasConfirmedFinalStep] = useState(false)

  const [mutation, { loading }] = useMutation(withdrawAccountMutation)

  const accountLogin = data?.viewer?.user?.login ?? ""
  // アプリで買ったプランは Apple / Google が管理しているので、退会しても止まらない
  const storeProvider = data?.viewer?.currentPass?.paymentProvider
  const isStorePass =
    storeProvider === "APP_STORE" || storeProvider === "GOOGLE_PLAY"
  const requiredPrefix = accountLogin.slice(0, Math.min(accountLogin.length, 6))
  const isPrefixMatched =
    requiredPrefix.length > 0 && loginPrefixInput.trim() === requiredPrefix
  const canStartWithdrawal =
    !isUserLoading &&
    isPrefixMatched &&
    hasConfirmedIrreversible &&
    hasConfirmedSignOut

  const resetFinalConfirmationState = () => {
    setHasConfirmedFinalStep(false)
  }

  const handleWithdraw = async () => {
    if (!canStartWithdrawal) {
      toast(
        t(
          "確認項目とアカウントID先頭6文字を入力してください",
          "Complete the confirmations and enter the first 6 characters of your account ID",
        ),
      )
      return
    }

    if (!hasConfirmedFinalStep) {
      toast(
        t(
          "最終確認にチェックを入れてください",
          "Please complete the final confirmation",
        ),
      )
      return
    }

    try {
      await props.beforeWithdraw?.().catch(() => undefined)
      await mutation()
      resetCookieLoginToken()

      try {
        await logoutFirebase()
      } catch {
        // Firebase セッションが残っていても、ローカル側の退会処理は完了している。
      }

      window.location.assign("/")
    } catch (error) {
      if (error instanceof Error && isApolloError(error)) {
        toast(error.message)
        return
      }

      toast(t("退会処理に失敗しました", "Failed to withdraw your account"))
    }
  }

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open)

    if (!open) {
      resetFinalConfirmationState()
    }
  }

  return (
    <div className="space-y-6">
      <Alert className="border-amber-300 bg-amber-50/80 text-amber-950 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-100">
        <AlertTriangle className="size-4" />
        <AlertTitle>
          {t(
            "誤操作防止のため複数の確認が必要です",
            "Multiple confirmations are required",
          )}
        </AlertTitle>
        <AlertDescription>
          {t(
            "退会前に、アカウントIDの先頭6文字の入力と確認項目への同意が必要です。",
            "Before withdrawing, you must enter the first 6 characters of your account ID and complete the confirmation steps.",
          )}
        </AlertDescription>
      </Alert>

      {isStorePass && (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertTitle>
            {t(
              "アプリで購入したプランは、先にストアで解約してください",
              "Cancel your app subscription in the store first",
            )}
          </AlertTitle>
          <AlertDescription>
            {storeProvider === "APP_STORE"
              ? t(
                  "このプランは iPhone アプリ（App Store）で購入されたため、退会しても自動では解約されません。［設定］→［Apple ID］→［サブスクリプション］から解約してから退会してください。",
                  "This plan was bought in the iPhone app (App Store), so withdrawing won't cancel it. Cancel it in Settings → Apple ID → Subscriptions before withdrawing.",
                )
              : t(
                  "このプランは Android アプリ（Google Play）で購入されたため、退会しても自動では解約されません。Google Play ストアの［お支払いと定期購入］→［定期購入］から解約してから退会してください。",
                  "This plan was bought in the Android app (Google Play), so withdrawing won't cancel it. Cancel it in Google Play → Payments & subscriptions → Subscriptions before withdrawing.",
                )}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
        <p className="font-semibold text-foreground">
          {t("退会すると元に戻せません", "This action cannot be undone")}
        </p>
        <p className="text-muted-foreground">
          {t(
            "退会すると、アカウント情報は削除され、作品は非公開になります。スタンプ履歴は残りますが、どのユーザのものかは表示されなくなります。ウェブで加入中の有料プランは退会と同時に解約され、以降の請求は発生しません。",
            "Withdrawing removes your account information and makes your works private. Sticker history remains, but it will no longer show which user it belonged to. Any plan you subscribed to on the web is canceled at the same time, and you will not be charged again.",
          )}
        </p>
        <p className="text-muted-foreground">
          {t(
            "同じSNS連携を使って再登録する場合は、新しいアカウントとして作成されます。",
            "If you register again with the same social account later, it will be created as a new account.",
          )}
        </p>
      </div>

      <div className="space-y-4 rounded-lg border p-4">
        <div className="space-y-2">
          <p className="font-medium text-sm">
            {t("現在のアカウントID", "Current account ID")}
          </p>
          <Input
            readOnly
            value={accountLogin}
            placeholder={t("読み込み中", "Loading")}
          />
        </div>

        <div className="space-y-2">
          <p className="font-medium text-sm">
            {t(
              "確認のため、アカウントIDの先頭6文字を入力してください",
              "To confirm, enter the first 6 characters of your account ID",
            )}
          </p>
          <Input
            value={loginPrefixInput}
            onChange={(event) => setLoginPrefixInput(event.target.value.trim())}
            maxLength={6}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            className={
              loginPrefixInput.length > 0 && !isPrefixMatched
                ? "border-red-500 focus-visible:ring-red-500"
                : ""
            }
            placeholder={t("先頭6文字を入力", "Enter the first 6 characters")}
          />
          <p className="text-muted-foreground text-xs">
            {t(
              "アカウントIDが6文字未満の場合は、その全文字を入力してください。",
              "If your account ID is shorter than 6 characters, enter the full ID.",
            )}
          </p>
        </div>

        <label
          htmlFor={irreversibleConfirmId}
          className="flex items-start gap-3"
        >
          <Checkbox
            id={irreversibleConfirmId}
            checked={hasConfirmedIrreversible}
            onCheckedChange={(checked) =>
              setHasConfirmedIrreversible(checked === true)
            }
          />
          <span className="text-sm leading-6">
            {t(
              "退会するとアカウント情報は元に戻せず、作品は非公開になることを理解しました。",
              "I understand that withdrawing is irreversible and my works will become private.",
            )}
          </span>
        </label>

        <label htmlFor={signOutConfirmId} className="flex items-start gap-3">
          <Checkbox
            id={signOutConfirmId}
            checked={hasConfirmedSignOut}
            onCheckedChange={(checked) =>
              setHasConfirmedSignOut(checked === true)
            }
          />
          <span className="text-sm leading-6">
            {t(
              "退会後はログインが解除され、同じSNS連携で再登録しても新しいアカウントになることを理解しました。",
              "I understand that I will be signed out and re-registering with the same social account will create a new account.",
            )}
          </span>
        </label>
      </div>

      <AlertDialog open={isDialogOpen} onOpenChange={handleOpenChange}>
        <AlertDialogTrigger asChild>
          <Button
            variant="destructive"
            disabled={loading || !canStartWithdrawal}
          >
            {t("退会する", "Withdraw Account")}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("本当に退会しますか？", "Are you sure you want to withdraw?")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                "退会後は、アカウント情報を元に戻せません。作品は非公開になり、ログインも解除されます。",
                "After withdrawal, your account information cannot be restored. Your works will become private and you will be signed out.",
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3">
            <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm">
              {t(
                "最終確認です。退会を実行すると、この操作は取り消せません。",
                "Final confirmation. Once you proceed, this action cannot be undone.",
              )}
            </div>
            <label htmlFor={finalConfirmId} className="flex items-start gap-3">
              <Checkbox
                id={finalConfirmId}
                checked={hasConfirmedFinalStep}
                onCheckedChange={(checked) =>
                  setHasConfirmedFinalStep(checked === true)
                }
              />
              <span className="text-sm leading-6">
                {t(
                  "上記を確認し、本当に退会することに同意します。",
                  "I have reviewed the above and want to withdraw my account.",
                )}
              </span>
            </label>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("やめる", "Cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={loading || !hasConfirmedFinalStep}
              onClick={handleWithdraw}
            >
              {t("退会する", "Withdraw Account")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

const viewerUserQuery = graphql(
  `query WithdrawAccountViewerUser {
    viewer {
      id
      user {
        id
        login
      }
      currentPass {
        id
        paymentProvider
      }
    }
  }`,
)

const withdrawAccountMutation = graphql(
  `mutation WithdrawAccount {
    withdrawAccount
  }`,
)
