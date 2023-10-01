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

export const FlexibleNavigation: React.FC<Props> = (props) => {
  const breakPoint = useBreakpoint()

  const isMobile = breakPoint === "base" || breakPoint === "sm"

  return (
    <>
      {!isMobile && props.isOpen && (
        <Box
          as={"nav"}
          position={"sticky"}
          top={"64px"}
          h={"calc(100svh - 64px)"}
          minW={"12rem"}
          overflowY={"auto"}
          pb={4}
          pl={4}
        >
          {props.children}
        </Box>
      )}
      {isMobile && (
        <Drawer isOpen={props.isOpen} onClose={props.onClose} placement="left">
          <DrawerOverlay />
          <DrawerContent>
            <Box overflow={"auto"} height={"100%"} py={4}>
              {props.children}
            </Box>
          </DrawerContent>
        </Drawer>
      )}
    </>
  )
}
