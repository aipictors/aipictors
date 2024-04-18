import { useBreakpoint } from "@/_hooks/use-breakpoint"
import { SettingsRouteList } from "@/routes/($lang).settings/_components/settings-route-list"

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
