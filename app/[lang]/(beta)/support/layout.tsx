"use client"
import { LoadingPage } from "app/components/LoadingPage"
import { LoginPage } from "app/components/LoginPage"
import { AppContext } from "app/contexts/appContext"
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
