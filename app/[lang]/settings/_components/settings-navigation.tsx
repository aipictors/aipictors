"use client"

import { SettingsRouteList } from "@/app/[lang]/settings/_components/settings-route-list"
import { useBreakpoint } from "@chakra-ui/react"
import React from "react"

export const SettingsNavigation = () => {
  const breakpoint = useBreakpoint()

  if (breakpoint !== "base" && breakpoint !== "sm") {
    return null
  }

  return (
    <div className="w-full">
      <SettingsRouteList />
    </div>
  )
}
