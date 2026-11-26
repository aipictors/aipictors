import { useApolloClient, useMutation, useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { PauseCircle } from "lucide-react"
import { useContext, useState } from "react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog"
import { Button } from "~/components/ui/button"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { logoutFirebase } from "~/utils/auth-session-backup"
import { resetCookieLoginToken } from "~/utils/reset-cookie-login-token"
import { toTrialDateText } from "~/utils/to-trial-date-text"

/**
 * アカウントを一時停止している人がログインしたら「再開しますか？」を出す（閉じられない）。
 * 停止中は API が再開・退会など以外の操作を断るので、再開するかログアウトするかを選んでもらう
 */
export function AccountPauseWatcher() {
  const t = useTranslation()
  const authContext = useContext(AuthContext)
  const client = useApolloClient()
  const { data } = useQuery(accountPauseQuery, {
    skip: !authContext.isLoggedIn,
    fetchPolicy: "cache-first",
  })
  const [resume, { loading }] = useMutation(resumeAccountMutation)
  const [isLeaving, setIsLeaving] = useState(false)

  const pausedAt = data?.viewer?.accountPausedAt ?? null
  if (!authContext.isLoggedIn || data?.viewer?.isAccountPaused !== true) {
    return null
  }

  const onResume = async () => {
    try {
      await resume()
      toast(
        t(
          "おかえりなさい。アカウントを再開しました。",
          "Welcome back! Your account is active again.",
        ),
      )
      // 停止中の表示（作品・プロフィールの読み込み結果）を残さない
      await client.clearStore().catch(() => undefined)
      window.location.reload()
    } catch {
      toast(
        t(
          "再開できませんでした。時間をおいてもう一度お試しください。",
          "We couldn't reactivate your account. Please try again in a moment.",
        ),
      )
    }
  }

  const onLogout = async () => {
    setIsLeaving(true)
    resetCookieLoginToken()
    try {
      await logoutFirebase()
    } catch {
      // ログアウトに失敗しても、トップに戻せば再開の確認はまた出る
    }
    window.location.assign("/")
  }

  return (
    <AlertDialog open>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <PauseCircle className="size-5 text-sky-500" />
            {t("アカウントは一時停止中です", "Your account is paused")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("再開しますか？", "Would you like to reactivate it?")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2 text-muted-foreground text-sm">
          {pausedAt !== null && (
            <p>
              {t("停止した日", "Paused on")}:{" "}
              {toTrialDateText(pausedAt, t.isEnglish)}
            </p>
          )}
          <p>
            {t(
              "再開すると、プロフィール・作品・コメントがまたほかの人に見えるようになります（停止する前に非公開だった作品は非公開のままです）。",
              "When you reactivate, your profile, works and comments become visible to others again (works that were private before you paused stay private).",
            )}
          </p>
          <p>
            {t(
              "停止したままにする場合は、ログアウトしてください。",
              "To stay paused, log out.",
            )}
          </p>
        </div>
        <AlertDialogFooter>
          <Button
            variant="secondary"
            disabled={loading || isLeaving}
            onClick={onLogout}
          >
            {t("停止したままログアウト", "Stay paused and log out")}
          </Button>
          <Button disabled={loading || isLeaving} onClick={onResume}>
            {loading
              ? t("再開しています…", "Reactivating…")
              : t("再開する", "Reactivate")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

const accountPauseQuery = graphql(
  `query AccountPauseWatcher {
    viewer {
      id
      isAccountPaused
      accountPausedAt
    }
  }`,
)

const resumeAccountMutation = graphql(
  `mutation ResumeAccount {
    resumeAccount
  }`,
)
