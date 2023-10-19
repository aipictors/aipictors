"use client"
import { Stack, useBreakpoint } from "@chakra-ui/react"
import { AccountRouteList } from "app/[lang]/account/_components/AccountRouteList"
import React from "react"

export const AccountNavigation: React.FC = () => {
  const breakpoint = useBreakpoint()

  if (breakpoint !== "base" && breakpoint !== "sm") {
    return null
  }

  return (
    <Stack as={"main"} w={"100%"}>
      <AccountRouteList />
    </Stack>
  )
}
