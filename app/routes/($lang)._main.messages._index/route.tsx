import { AppLoadingPage } from "~/components/app/app-loading-page"
import { LoginPage } from "~/components/page/login-page"
import { AuthContext } from "~/contexts/auth-context"
import { MessageThreadList } from "~/routes/($lang)._main.messages._index/components/message-thread-list"
import { Outlet } from "react-router"
import { useContext } from "react"

/**
 * メッセージの一覧
 */
export default function Messages() {
  const authContext = useContext(AuthContext)

  if (authContext.isLoading) {
    return <AppLoadingPage />
  }

  if (authContext.isNotLoggedIn) {
    return <LoginPage />
  }

  return (
    <>
      <MessageThreadList />
      <Outlet />
    </>
  )
}
