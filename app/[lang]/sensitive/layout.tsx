"use client"

import { HomeHeader } from "@/app/[lang]/(main)/_components/home-header"
import { LoginModal } from "@/app/[lang]/(main)/_components/login-modal"
import { LogoutModal } from "@/app/[lang]/(main)/_components/logout-modal"
import { SensitiveNavigationList } from "@/app/[lang]/sensitive/_components/sensitive-navigation"
import { HomeFooter } from "@/app/_components/home-footer"
import { ResponsiveNavigation } from "@/app/_components/responsive-navigation"
import { Separator } from "@/components/ui/separator"
import { useBoolean } from "usehooks-ts"

type Props = {
  children: React.ReactNode
}

const SensitiveLayout = (props: Props) => {
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
      <div className="flex items-start space-x-0">
        <ResponsiveNavigation>
          <SensitiveNavigationList />
        </ResponsiveNavigation>
        {props.children}
      </div>
      <Separator />
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

export default SensitiveLayout
