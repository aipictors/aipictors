"use client"
import "@splidejs/react-splide/css"
import { Divider, HStack, useDisclosure } from "@chakra-ui/react"
import { useEffect } from "react"
import { FlexibleNavigation } from "app/(main)/components/FlexibleNavigation"
import { HomeHeader } from "app/(main)/components/HomeHeader"
import { HomeNavigationList } from "app/(main)/components/HomeNavigationList"
import { LoginModal } from "app/(main)/components/LoginModal"
import { LogoutModal } from "app/(main)/components/LogoutModal"
import { HomeFooter } from "app/components/HomeFooter"

type Props = {
  children: React.ReactNode
}

const MainLayout: React.FC<Props> = (props) => {
  const { isOpen, onClose, onOpen, onToggle } = useDisclosure({
    defaultIsOpen: false,
  })

  useEffect(() => {
    if (typeof window === "undefined") return
    if (window.innerWidth < 768) return
    onOpen()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
      <HomeHeader onOpenNavigation={onToggle} />
      <HStack alignItems={"flex-start"} spacing={0}>
        <FlexibleNavigation isOpen={isOpen} onClose={onClose}>
          <HomeNavigationList
            onOpen={onOpenLogin}
            onOpenLogout={onOpenLogout}
          />
        </FlexibleNavigation>
        {props.children}
      </HStack>
      <Divider />
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
