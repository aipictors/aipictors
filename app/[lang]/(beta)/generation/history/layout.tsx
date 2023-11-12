"use client"

import { LoadingPage } from "@/app/_components/page/loading-page"
import { LoginPage } from "@/app/_components/page/login-page"
import { AppContext } from "@/app/_contexts/app-context"
import { useContext } from "react"

type Props = {
  children: React.ReactNode
}

/**
 * ログインが必要
 * @param props
 * @returns
 */
const GenerationHistoriesLayout: React.FC<Props> = (props) => {
  const context = useContext(AppContext)

  if (context.isLoading) {
    return <LoadingPage />
  }

  if (context.isNotLoggedIn) {
    return <LoginPage />
  }

  return <>{props.children}</>
}

export default GenerationHistoriesLayout
