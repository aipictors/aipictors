"use client"

import { BetaHeader } from "@/app/[lang]/(beta)/_components/beta-header"
import { HomeFooter } from "@/app/_components/home-footer"
import { LoginPage } from "@/app/_components/page/login-page"
import { AuthContext } from "@/app/_contexts/auth-context"
import { AppColumnLayout } from "@/components/app/app-column-layout"
import { AppLoadingPage } from "@/components/app/app-loading-page"
import { useContext } from "react"

type Props = {
  children: React.ReactNode
}

const GenerationLayout = (props: Props) => {
  const context = useContext(AuthContext)

  if (context.isLoading) {
    return <AppLoadingPage />
  }

  if (context.isNotLoggedIn) {
    return <LoginPage />
  }

  return (
    <>
      <BetaHeader />
      <AppColumnLayout isFullWidth={true}>{props.children}</AppColumnLayout>
      {/* <HomeFooter /> */}
    </>
  )
}

export default GenerationLayout
