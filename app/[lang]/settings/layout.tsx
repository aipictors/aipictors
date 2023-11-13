"use client"

import { BetaHeader } from "@/app/[lang]/(beta)/_components/beta-header"
import { BetaNavigationList } from "@/app/[lang]/(beta)/_components/beta-navigation-list"
import { LoginModal } from "@/app/[lang]/(main)/_components/login-modal"
import { LogoutModal } from "@/app/[lang]/(main)/_components/logout-modal"
import { SettingsRouteList } from "@/app/[lang]/settings/_components/settings-route-list"
import { HStack, useDisclosure } from "@chakra-ui/react"

import { NavigationDrawer } from "@/app/_components/navigation-drawer"
import { StaticNavigation } from "@/app/_components/static-navigation"
import { AppContext } from "@/app/_contexts/app-context"
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
      <BetaHeader title={"設定"} />
      <NavigationDrawer isOpen={isOpenDrawer} onClose={onCloseDrawer}>
        <BetaNavigationList />
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
