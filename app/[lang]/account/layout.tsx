"use client"

import { HomeHeader } from "@/app/[lang]/(main)/_components/home-header"
import { AccountRouteList } from "@/app/[lang]/account/_components/account-route-list"
import { AuthContext } from "@/app/_contexts/auth-context"
import { AppAside } from "@/components/app/app-aside"
import { AppColumnLayout } from "@/components/app/app-column-layout"
import type React from "react"
import { useContext } from "react"

type Props = {
  children: React.ReactNode
}

const SettingsLayout = (props: Props) => {
  const authContext = useContext(AuthContext)

  if (authContext.isLoading) {
    return null
  }

  if (authContext.isNotLoggedIn) {
    return null
  }

  return (
    <>
      <HomeHeader title={"アカウント"} />
      <AppColumnLayout>
        <AppAside>
          <AccountRouteList />
        </AppAside>
        {props.children}
      </AppColumnLayout>
    </>
  )
}

export default SettingsLayout
