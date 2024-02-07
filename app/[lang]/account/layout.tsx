"use client"

import { BetaHeader } from "@/app/[lang]/(beta)/_components/beta-header"
import { LoginModal } from "@/app/[lang]/(main)/_components/login-modal"
import { LogoutModal } from "@/app/[lang]/(main)/_components/logout-modal"
import { AccountRouteList } from "@/app/[lang]/account/_components/account-route-list"
import { AuthContext } from "@/app/_contexts/auth-context"
import { AppAside } from "@/components/app/app-aside"
import { AppColumnLayout } from "@/components/app/app-column-layout"
import React, { useContext } from "react"
import { useBoolean } from "usehooks-ts"

type Props = {
  children: React.ReactNode
}

const SettingsLayout = (props: Props) => {
  const appContext = useContext(AuthContext)

  const {
    value: isOpenLogin,
    setTrue: onOpenLogin,
    setFalse: onCloseLogin,
  } = useBoolean()

  const {
    value: isOpenLogout,
    setTrue: onOpenLogout,
    setFalse: onCloseLogout,
  } = useBoolean()

  if (appContext.isLoading) {
    return null
  }

  if (appContext.isNotLoggedIn) {
    return null
  }

  return (
    <>
      <BetaHeader
        title={"アカウント"}
        onLogin={onOpenLogin}
        onLogout={onOpenLogout}
      />
      <AppColumnLayout>
        <AppAside>
          <AccountRouteList />
        </AppAside>
        {props.children}
      </AppColumnLayout>
      <LoginModal />
      <LogoutModal
        isOpen={isOpenLogout}
        onClose={onCloseLogout}
        onOpen={onOpenLogout}
      />
    </>
  )
}

export default SettingsLayout
