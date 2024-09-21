import { LoginDialogContent } from "~/components/login-dialog-content"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import { HomeNavigationButton } from "~/routes/($lang)._main._index/components/home-navigation-button"
import { LogInIcon } from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"

/**
 * ログイン
 */
export function LoginNavigationButton() {
  const t = useTranslation()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <HomeNavigationButton icon={LogInIcon}>
          {t("ログイン", "Login")}
        </HomeNavigationButton>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("ログイン", "Login")}</DialogTitle>
          <DialogDescription>
            {t(
              "ここから先はログインが必要みたい。",
              "It seems you need to log in to proceed.",
            )}
          </DialogDescription>
        </DialogHeader>
        <LoginDialogContent />
      </DialogContent>
    </Dialog>
  )
}
