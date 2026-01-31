import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog"
import { getAuth, signOut } from "firebase/auth"
import { resetCookieLoginToken } from "~/utils/reset-cookie-login-token"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"

/**
 * ログアウト
 */
export function LogoutDialogButton (): React.ReactNode {
  const onLogout = async () => {
    await signOut(getAuth())
    resetCookieLoginToken()
    toast("ログアウトしました。")
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={"secondary"}>{"ログアウト"}</Button>
      </AlertDialogTrigger>
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
          <AlertDialogCancel>{"やめとく"}</AlertDialogCancel>
          <AlertDialogAction onClick={onLogout}>{"はい"}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
