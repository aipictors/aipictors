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
  isOpen: boolean
  onClose: () => void
}

export const NavigationDrawer: React.FC<Props> = (props) => {
  return (
    <Drawer isOpen={props.isOpen} onClose={props.onClose} placement="left">
      <DrawerOverlay />
      <DrawerContent>
        <Box overflow={"auto"} height={"100%"} py={4}>
          {props.children}
        </Box>
      </DrawerContent>
    </Drawer>
  )
}
