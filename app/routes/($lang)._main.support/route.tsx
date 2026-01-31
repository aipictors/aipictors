import { AppLoadingPage } from "~/components/app/app-loading-page"
import { LoginPage } from "~/components/page/login-page"
import { AuthContext } from "~/contexts/auth-context"
import { Outlet } from "@remix-run/react"
import { useContext } from "react"

/**
 * メッセージの一覧
 */
export default function SupportLayout () {
  const authContext = useContext(AuthContext)

  if (authContext.isLoading) {
    return <AppLoadingPage />
  }

  if (authContext.isNotLoggedIn) {
    return <LoginPage />
  }

  return <Outlet />
}
