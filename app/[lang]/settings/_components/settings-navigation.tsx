"use client"

import { SettingsRouteList } from "@/app/[lang]/settings/_components/settings-route-list"
import { Stack, useBreakpoint } from "@chakra-ui/react"
import React from "react"

export const SettingsNavigation: React.FC = () => {
  const breakpoint = useBreakpoint()

  if (breakpoint !== "base" && breakpoint !== "sm") {
    return null
  }

  return (
    <Stack as={"main"} w={"100%"}>
      <SettingsRouteList />
    </Stack>
  )
}
