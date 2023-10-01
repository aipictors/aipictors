"use client"
import { useDisclosure } from "@chakra-ui/react"
import { FlexibleNavigation } from "app/(main)/components/FlexibleNavigation"

import { HomeNavigationList } from "app/(main)/components/HomeNavigationList"
import { LoginModal } from "app/(main)/components/LoginModal"
import { LogoutModal } from "app/(main)/components/LogoutModal"

type Props = {
  children: React.ReactNode
  isOpen: boolean
  onClose: () => void
}

export const HomeNavigation: React.FC = () => {
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
      <FlexibleNavigation isOpen={isOpenLogin} onClose={onCloseLogin}>
        <HomeNavigationList onOpen={onOpenLogin} onOpenLogout={onOpenLogout} />
      </FlexibleNavigation>
      <LoginModal isOpen={isOpenLogin} onClose={onCloseLogin} />
      <LogoutModal
        isOpen={isOpenLogout}
        onClose={onCloseLogout}
        onOpen={onOpenLogout}
      />
    </>
  )
}
