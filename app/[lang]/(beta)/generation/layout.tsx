"use client"

import { LoadingPage } from "@/app/_components/page/loading-page"
import { LoginPage } from "@/app/_components/page/login-page"
import { AppContext } from "@/app/_contexts/app-context"
import { useContext } from "react"

type Props = {
  children: React.ReactNode
}

const GenerationLayout = (props: Props) => {
  const context = useContext(AppContext)

  if (context.isLoading) {
    return <LoadingPage />
  }

  if (context.isNotLoggedIn) {
    return <LoginPage />
  }

  return <div className="pb-4 overflow-x-hidden">{props.children}</div>
}

export default GenerationLayout
