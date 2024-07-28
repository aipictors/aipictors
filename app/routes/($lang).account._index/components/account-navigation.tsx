import { useBreakpoint } from "@/hooks/use-breakpoint"
import { AccountRouteList } from "@/routes/($lang).account/components/account-route-list"

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
