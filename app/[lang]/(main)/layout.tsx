"use client"

import { HomeHeader } from "@/app/[lang]/(main)/_components/home-header"
import { HomeNavigationList } from "@/app/[lang]/(main)/_components/home-navigation-list"
import { LoginModal } from "@/app/[lang]/(main)/_components/login-modal"
import { LogoutModal } from "@/app/[lang]/(main)/_components/logout-modal"
import { HomeFooter } from "@/app/_components/home-footer"
import { AppAside } from "@/components/app/app-aside"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { useEffect } from "react"
import { useBoolean } from "usehooks-ts"

type Props = {
  children: React.ReactNode
}

const MainLayout = (props: Props) => {
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
      <HomeHeader onLogin={onOpenLogin} onLogout={onOpenLogout} />
      <div className="flex items-start space-x-0 max-w-screen-xl w-full mx-auto">
        <AppAside>
          <HomeNavigationList onLogin={onOpenLogin} onLogout={onOpenLogout} />
        </AppAside>
        {props.children}
      </div>
      <HomeFooter />
      <LoginModal isOpen={isOpenLogin} onClose={onCloseLogin} />
      <LogoutModal
        isOpen={isOpenLogout}
        onClose={onCloseLogout}
        onOpen={onOpenLogout}
      />
    </>
  )
}

export default MainLayout
