"use client"

import { LoginPage } from "@/_components/page/login-page"
import { AuthContext } from "@/_contexts/auth-context"
import type React from "react"
import { useContext } from "react"

type Props = {
  children: React.ReactNode
}

const SupportLayout = (props: Props) => {
  const appContext = useContext(AuthContext)

  if (appContext.isNotLoggedIn) {
    return <LoginPage />
  }

  return <>{props.children}</>
}

export default SupportLayout
