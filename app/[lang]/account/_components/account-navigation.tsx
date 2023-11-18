"use client"

import { AccountRouteList } from "@/app/[lang]/account/_components/account-route-list"
import { useBreakpoint } from "@chakra-ui/react"

export const AccountNavigation = () => {
  const breakpoint = useBreakpoint()

  if (breakpoint !== "base" && breakpoint !== "sm") {
    return null
  }

  return (
    <main className="w-full">
      <AccountRouteList />
    </main>
  )
}
