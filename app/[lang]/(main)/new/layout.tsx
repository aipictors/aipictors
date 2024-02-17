"use client"

import { LoginPage } from "@/app/_components/page/login-page"
import { AuthContext } from "@/app/_contexts/auth-context"
import { AppLoadingPage } from "@/components/app/app-loading-page"
import { useContext } from "react"

type Props = {
  children: React.ReactNode
}

const NewLayout = (props: Props) => {
  const context = useContext(AuthContext)

  if (context.isLoading) {
    return <AppLoadingPage />
  }

  if (context.isNotLoggedIn) {
    return <LoginPage />
  }

  return <>{props.children}</>
}

export default NewLayout
