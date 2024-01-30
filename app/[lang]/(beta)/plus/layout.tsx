"use client"

import { LoginPage } from "@/app/_components/page/login-page"
import { AuthContext } from "@/app/_contexts/auth-context"
import { AppLoading } from "@/components/app/app-loading"
import { useContext } from "react"

type Props = {
  children: React.ReactNode
}

const PlusLayout = (props: Props) => {
  const context = useContext(AuthContext)

  if (context.isLoading) {
    return <AppLoading />
  }

  if (context.isNotLoggedIn) {
    return <LoginPage />
  }

  return props.children
}

export default PlusLayout
