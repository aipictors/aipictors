"use client"

import { BetaHeader } from "@/app/[lang]/(beta)/_components/beta-header"
import { BetaNavigationList } from "@/app/[lang]/(beta)/_components/beta-navigation-list"
import { LoginModal } from "@/app/[lang]/(main)/_components/login-modal"
import { LogoutModal } from "@/app/[lang]/(main)/_components/logout-modal"
import { HomeFooter } from "@/app/_components/home-footer"
import { AppAside } from "@/components/app/app-aside"
import { AppColumnLayout } from "@/components/app/app-column-layout"
import { useBoolean } from "usehooks-ts"

type Props = {
  children: React.ReactNode
}

const BetaLayout = (props: Props) => {
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

  return (
    <>
      <BetaHeader onLogin={onOpenLogin} onLogout={onOpenLogout} />
      <AppColumnLayout>
        <AppAside>
          <BetaNavigationList onLogin={onOpenLogin} onLogout={onOpenLogout} />
        </AppAside>
        {props.children}
      </AppColumnLayout>
      <HomeFooter />
      <LoginModal />
      <LogoutModal
        isOpen={isOpenLogout}
        onClose={onCloseLogout}
        onOpen={onOpenLogout}
      />
    </>
  )
}

export default BetaLayout
