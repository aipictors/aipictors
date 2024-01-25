"use client"

import { LoadingPage } from "@/app/_components/page/loading-page"
import { LoginPage } from "@/app/_components/page/login-page"
import { AuthContext } from "@/app/_contexts/auth-context"
import { useContext } from "react"

type Props = {
  children: React.ReactNode
}

/**
 * ログインが必要
 * @param props
 * @returns
 */
const GenerationHistoriesLayout = (props: Props) => {
  const context = useContext(AuthContext)

  if (context.isLoading) {
    return <LoadingPage />
  }

  if (context.isNotLoggedIn) {
    return <LoginPage />
  }

  return <>{props.children}</>
}

export default GenerationHistoriesLayout
