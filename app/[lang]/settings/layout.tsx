"use client"

import { BetaHeader } from "@/app/[lang]/(beta)/_components/beta-header"
import { LogoutDialogLegacy } from "@/app/[lang]/_components/logout-dialog-legacy"
import { SettingsRouteList } from "@/app/[lang]/settings/_components/settings-route-list"
import { AuthContext } from "@/app/_contexts/auth-context"
import { AppAside } from "@/components/app/app-aside"
import { AppColumnLayout } from "@/components/app/app-column-layout"
import React, { useContext } from "react"
import { useBoolean } from "usehooks-ts"

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
      <BetaHeader title={"設定"} />
      <AppColumnLayout>
        <AppAside>
          <SettingsRouteList />
        </AppAside>
        {props.children}
      </AppColumnLayout>
    </>
  )
}

export default SettingsLayout
