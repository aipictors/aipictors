"use client"
import {
  Box,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  useBreakpoint,
} from "@chakra-ui/react"

type Props = {
  children: React.ReactNode
}

export const StaticNavigation: React.FC<Props> = (props) => {
  return (
    <Box
      as={"nav"}
      position={"sticky"}
      top={"64px"}
      h={"calc(100svh - 72px)"}
      minW={"12rem"}
      overflowY={"auto"}
      pb={4}
      pl={4}
    >
      {props.children}
    </Box>
  )
}
