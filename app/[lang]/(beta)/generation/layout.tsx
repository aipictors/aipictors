"use client"

import { LoginPage } from "@/app/_components/page/login-page"
import { AuthContext } from "@/app/_contexts/auth-context"
import { useContext } from "react"

type Props = {
  children: React.ReactNode
}

const GenerationLayout = (props: Props) => {
  const context = useContext(AuthContext)

  if (context.isNotLoggedIn) {
    return <LoginPage />
  }

  return <div className="pb-4 overflow-x-hidden">{props.children}</div>
}

export default GenerationLayout
