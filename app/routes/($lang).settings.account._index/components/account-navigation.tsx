import { useBreakpoint } from "~/hooks/use-breakpoint"
import { AccountRouteList } from "~/routes/($lang).settings.account/components/account-route-list"

export function AccountNavigation() {
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
