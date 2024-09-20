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
import { resetCookieLoginToken } from "~/utils/reset-cookie-login-token"
import { config } from "~/config"
import { HomeNavigationButton } from "~/routes/($lang)._main._index/components/home-navigation-button"
import { getAuth, signOut } from "firebase/auth"
import { LogOutIcon } from "lucide-react"
import { toast } from "sonner"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  text?: string
}

/**
 * ログアウトする
 */
export function NavigationLogoutDialogButton(props: Props) {
  const t = useTranslation()

  const handleLogout = async () => {
    await signOut(getAuth())
    resetCookieLoginToken()
    toast(t("ログアウトしました。", "Logged out"))
    const linkNode = document.createElement("a")
    linkNode.href = config.wordpressLink.logout
    linkNode.click()
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <HomeNavigationButton icon={LogOutIcon}>
          {props.text ?? t("ログアウト", "Logout")}
        </HomeNavigationButton>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t(
              "本当にログアウトしますか？",
              "Are you sure you want to log out?",
            )}
          </AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription>
          {t(
            "ログアウトすると、再度ログインするまでアップロードやコメントができなくなります。",
            "If you log out, you will not be able to upload or comment until you log in again",
          )}
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleLogout}>
            {t("はい", "Yes")}
          </AlertDialogAction>
          <AlertDialogCancel>{t("やめとく", "No")}</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
