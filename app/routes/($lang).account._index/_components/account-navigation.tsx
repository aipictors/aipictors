import { useBreakpoint } from "@/_hooks/use-breakpoint"
import { AccountRouteList } from "@/routes/($lang).account/_components/account-route-list"

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
