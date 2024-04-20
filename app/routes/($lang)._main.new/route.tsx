import { AppLoadingPage } from "@/_components/app/app-loading-page"
import { LoginPage } from "@/_components/page/login-page"
import { AuthContext } from "@/_contexts/auth-context"
import { MessageThreadList } from "@/routes/($lang)._main.messages._index/_components/message-thread-list"
import { Outlet } from "@remix-run/react"
import React, { useContext } from "react"

/**
 * メッセージの一覧
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
