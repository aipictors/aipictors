import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog"
import { resetCookieLoginToken } from "~/utils/reset-cookie-login-token"
import { getAuth, signOut } from "firebase/auth"
import { toast } from "sonner"

type Props = {
  isOpen: boolean
  onClose(): void
  onOpen(): void
}

/**
 * ログアウト・ダイアログ
 */
export function LogoutDialogLegacy (props: Props): React.ReactNode {
  const handleLogout = async () => {
    await signOut(getAuth())
    props.onClose()
    resetCookieLoginToken()
    toast("ログアウトしました。")
  }

  return (
    <AlertDialog open={props.isOpen} onOpenChange={props.onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{"本当にログアウトしますか？"}</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription>
          {
            "ログアウトすると、再度ログインするまでアップロードやコメントができなくなります。"
          }
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={props.onClose}>
            {"やめとく"}
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleLogout}>{"はい"}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
