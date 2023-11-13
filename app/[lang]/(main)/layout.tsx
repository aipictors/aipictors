"use client"

import { HomeHeader } from "@/app/[lang]/(main)/_components/home-header"
import { HomeNavigationList } from "@/app/[lang]/(main)/_components/home-navigation-list"
import { LoginModal } from "@/app/[lang]/(main)/_components/login-modal"
import { LogoutModal } from "@/app/[lang]/(main)/_components/logout-modal"
import { HomeFooter } from "@/app/_components/home-footer"
import { ResponsiveNavigation } from "@/app/_components/responsive-navigation"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { useDisclosure } from "@chakra-ui/react"
import { useEffect } from "react"

type Props = {
  children: React.ReactNode
}

const MainLayout: React.FC<Props> = (props) => {
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

  const { toast } = useToast()

  useEffect(() => {
    toast({
      description:
        "こちらは開発中のページです。何らかの不具合が発生する可能性があります。",
      duration: 60 * 4 * 1000,
    })
  }, [])

  return (
    <>
      <HomeHeader onLogin={onOpenLogin} onLogout={onOpenLogout} />
      <div className="flex items-start space-x-0">
        <ResponsiveNavigation>
          <HomeNavigationList onLogin={onOpenLogin} onLogout={onOpenLogout} />
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

export default MainLayout
