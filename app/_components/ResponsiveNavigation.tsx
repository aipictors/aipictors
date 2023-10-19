"use client"
import {
  Box,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  useBreakpoint,
} from "@chakra-ui/react"
import { NavigationDrawer } from "app/_components/NavigationDrawer"
import { StaticNavigation } from "app/_components/StaticNavigation"

type Props = {
  children: React.ReactNode
  isOpen: boolean
  isOpenDrawer: boolean
  onClose: () => void
}

export const ResponsiveNavigation: React.FC<Props> = (props) => {
  const breakPoint = useBreakpoint()

  const isMobile = breakPoint === "base" || breakPoint === "sm"

  return (
    <>
      {!isMobile && props.isOpen && (
        <StaticNavigation>{props.children}</StaticNavigation>
      )}
      {isMobile && (
        <NavigationDrawer isOpen={props.isOpenDrawer} onClose={props.onClose}>
          {props.children}
        </NavigationDrawer>
      )}
    </>
  )
}
