import { LoginDialogContent } from "@/components/login-dialog-content"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { HomeNavigationButton } from "@/routes/($lang)._main._index/components/home-navigation-button"
import { LogInIcon } from "lucide-react"

/**
 * ログイン
 */
export function LoginNavigationButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <HomeNavigationButton icon={LogInIcon}>
          {"ログイン"}
        </HomeNavigationButton>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{"ログイン"}</DialogTitle>
          <DialogDescription>
            {"ここから先はログインが必要みたい。"}
          </DialogDescription>
        </DialogHeader>
        <LoginDialogContent />
      </DialogContent>
    </Dialog>
  )
}
