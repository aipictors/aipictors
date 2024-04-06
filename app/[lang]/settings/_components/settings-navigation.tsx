"use client"

import { SettingsRouteList } from "@/[lang]/settings/_components/settings-route-list"
import { useBreakpoint } from "@/_hooks/use-breakpoint"

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
