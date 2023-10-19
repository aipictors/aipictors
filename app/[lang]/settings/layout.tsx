"use client"
import { Divider, HStack, useDisclosure } from "@chakra-ui/react"
import { BetaHeader } from "app/[lang]/(beta)/_components/BetaHeader"
import { BetaNavigationList } from "app/[lang]/(beta)/_components/BetaNavigationList"
import { LoginModal } from "app/[lang]/(main)/_components/LoginModal"
import { LogoutModal } from "app/[lang]/(main)/_components/LogoutModal"
import { SettingsRouteList } from "app/[lang]/settings/_components/SettingsRouteList"
import { HomeFooter } from "app/_components/HomeFooter"
import { NavigationDrawer } from "app/_components/NavigationDrawer"
import { StaticNavigation } from "app/_components/StaticNavigation"
import { AppContext } from "app/_contexts/appContext"
import React, { useContext } from "react"

type Props = {
  children: React.ReactNode
}

const SettingsLayout: React.FC<Props> = (props) => {
  const appContext = useContext(AppContext)

  const {
    isOpen: isOpenDrawer,
    onClose: onCloseDrawer,
    onToggle: onToggleDrawer,
  } = useDisclosure({
    defaultIsOpen: false,
  })

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

  if (appContext.isLoading) {
    return null
  }

  if (appContext.isNotLoggedIn) {
    return null
  }

  return (
    <>
      <BetaHeader title={"設定"} onOpenNavigation={onToggleDrawer} />
      <NavigationDrawer isOpen={isOpenDrawer} onClose={onCloseDrawer}>
        <BetaNavigationList onOpen={onOpenLogin} onOpenLogout={onOpenLogout} />
      </NavigationDrawer>
      <HStack alignItems={"flex-start"} spacing={0}>
        <StaticNavigation>
          <SettingsRouteList />
        </StaticNavigation>
        {props.children}
      </HStack>
      <LoginModal isOpen={isOpenLogin} onClose={onCloseLogin} />
      <LogoutModal
        isOpen={isOpenLogout}
        onClose={onCloseLogout}
        onOpen={onOpenLogout}
      />
    </>
  )
}

export default SettingsLayout
