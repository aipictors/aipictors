import { AppLoadingPage } from "~/components/app/app-loading-page"
import { LoginPage } from "~/components/page/login-page"
import { AuthContext } from "~/contexts/auth-context"
import { Outlet, useLocation } from "@remix-run/react"
import { useContext } from "react"

/**
 * メッセージの一覧
 */
export default function PlusLayout () {
  const authContext = useContext(AuthContext)
  const location = useLocation()

  // プランの一覧（/plus）は未ログインでも見られるようにする
  const isPlanListPage = /\/plus\/?$/.test(location.pathname)

  if (authContext.isLoading) {
    return <AppLoadingPage />
  }

  if (authContext.isNotLoggedIn && !isPlanListPage) {
    return <LoginPage />
  }

  return <Outlet />
}
