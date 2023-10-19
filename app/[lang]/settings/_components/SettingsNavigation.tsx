"use client"
import { Box, Stack, Text, useBreakpoint } from "@chakra-ui/react"
import { SettingsRouteList } from "app/[lang]/settings/_components/SettingsRouteList"
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
