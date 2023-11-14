"use client"

import { BetaHeader } from "@/app/[lang]/(beta)/_components/beta-header"
import { BetaNavigationList } from "@/app/[lang]/(beta)/_components/beta-navigation-list"
import { LoginModal } from "@/app/[lang]/(main)/_components/login-modal"
import { LogoutModal } from "@/app/[lang]/(main)/_components/logout-modal"
import { HomeFooter } from "@/app/_components/home-footer"
import { ResponsiveNavigation } from "@/app/_components/responsive-navigation"
import { Separator } from "@/components/ui/separator"
import { useDisclosure } from "@chakra-ui/react"

type Props = {
  children: React.ReactNode
}

const BetaLayout = (props: Props) => {
  const {
    isOpen: isOpenLogin,
    onOpen: onOpenLogin,
    onClose: onCloseLogin,
  } = useDisclosure()

  const {
    isOpen: isOpenLogout,
    onOpen: onOpenLogout,
    onClose: onCloseLogout,
  } = useDisclosure()

  return (
    <>
      <BetaHeader onLogin={onOpenLogin} onLogout={onOpenLogout} />
      <div className="flex items-start space-x-0">
        <ResponsiveNavigation>
          <BetaNavigationList onLogin={onOpenLogin} onLogout={onOpenLogout} />
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

export default BetaLayout
