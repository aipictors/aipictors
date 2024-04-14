import { AccountRouteList } from "@/[lang]/account/_components/account-route-list"
import { useBreakpoint } from "@/_hooks/use-breakpoint"

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
