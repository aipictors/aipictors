import { ApolloError, useMutation } from "@apollo/client/index"
import { getAuth, signOut } from "firebase/auth"
import { graphql } from "gql.tada"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
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
import { useTranslation } from "~/hooks/use-translation"
import { resetCookieLoginToken } from "~/utils/reset-cookie-login-token"

export function WithdrawAccountForm() {
  const t = useTranslation()

  const [mutation, { loading }] = useMutation(withdrawAccountMutation)

  const handleWithdraw = async () => {
    try {
      await mutation()
      resetCookieLoginToken()

      try {
        await signOut(getAuth())
      } catch {
        // Firebase セッションが残っていても、ローカル側の退会処理は完了している。
      }

      window.location.assign("/")
    } catch (error) {
      if (error instanceof ApolloError) {
        toast(error.message)
        return
      }

      toast(t("退会処理に失敗しました", "Failed to withdraw your account"))
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
        <p className="font-semibold text-foreground">
          {t("退会すると元に戻せません", "This action cannot be undone")}
        </p>
        <p className="text-muted-foreground">
          {t(
            "退会すると、アカウント情報は削除され、作品は非公開になります。スタンプ履歴は残りますが、どのユーザのものかは表示されなくなります。",
            "Withdrawing removes your account information and makes your works private. Sticker history remains, but it will no longer show which user it belonged to.",
          )}
        </p>
        <p className="text-muted-foreground">
          {t(
            "同じSNS連携を使って再登録する場合は、新しいアカウントとして作成されます。",
            "If you register again with the same social account later, it will be created as a new account.",
          )}
        </p>
      </div>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" disabled={loading}>
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
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t("やめる", "Cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={loading}
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

const withdrawAccountMutation = graphql(
  `mutation WithdrawAccount {
    withdrawAccount
  }`,
)
