"use client"

import { LoadingPage } from "@/app/_components/page/loading-page"
import { LoginPage } from "@/app/_components/page/login-page"
import { AuthContext } from "@/app/_contexts/auth-context"
import React, { useContext } from "react"

type Props = {
  children: React.ReactNode
}

const SupportLayout = (props: Props) => {
  const appContext = useContext(AuthContext)

  if (appContext.isLoading) {
    return <LoadingPage />
  }

  if (appContext.isNotLoggedIn) {
    return <LoginPage />
  }

  return <>{props.children}</>
}

export default SupportLayout
