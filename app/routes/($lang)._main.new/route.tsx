import { AppLoadingPage } from "~/components/app/app-loading-page"
import { LoginPage } from "~/components/page/login-page"
import { AuthContext } from "~/contexts/auth-context"
import { Outlet } from "@remix-run/react"
import { useContext } from "react"

/**
 * 新規投稿
 */
export default function New() {
  const authContext = useContext(AuthContext)

  if (authContext.isLoading) {
    return <AppLoadingPage />
  }

  if (authContext.isNotLoggedIn) {
    return <LoginPage />
  }

  return <Outlet />
}
