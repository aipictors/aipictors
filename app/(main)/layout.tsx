"use client"
import "@splidejs/react-splide/css"
import { Divider, HStack, useDisclosure } from "@chakra-ui/react"
import { FlexibleNavigation } from "app/(main)/components/FlexibleNavigation"
import { HomeHeader } from "app/(main)/components/HomeHeader"
import { HomeNavigationList } from "app/(main)/components/HomeNavigationList"
import { LoginModal } from "app/(main)/components/LoginModal"
import { LogoutModal } from "app/(main)/components/LogoutModal"
import { FooterHome } from "app/components/FooterHome"

type Props = {
  children: React.ReactNode
}

const MainLayout: React.FC<Props> = (props) => {
  const { isOpen, onClose, onToggle } = useDisclosure()

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
      <FooterHome />
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
