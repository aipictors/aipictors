"use client"

import { LoadingPage } from "app/_components/page/loading-page"
import { LoginPage } from "app/_components/page/login-page"
import { AppContext } from "app/_contexts/app-context"
import React, { useContext } from "react"

type Props = {
  children: React.ReactNode
}

const SupportLayout: React.FC<Props> = (props) => {
  const appContext = useContext(AppContext)

  if (appContext.isLoading) {
    return <LoadingPage />
  }

  if (appContext.isNotLoggedIn) {
    return <LoginPage />
  }

  return <>{props.children}</>
}

export default SupportLayout
