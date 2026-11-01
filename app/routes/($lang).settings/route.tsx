import { AppCommonLayout } from "~/components/app/app-common-layout"
import { AppLoadingPage } from "~/components/app/app-loading-page"
import { AuthContext } from "~/contexts/auth-context"
import { hasViewerRequestSession } from "~/lib/viewer-request-headers"
import { Outlet } from "@remix-run/react"
import { useContext } from "react"
import { SettingsLoginPrompt } from "~/routes/($lang).settings/components/settings-login-prompt"
import { SettingsNavigation } from "~/routes/($lang).settings._index/components/settings-navigation"

export function HydrateFallback () {
  return <AppLoadingPage />
}

export default function SettingsLayout () {
  const authContext = useContext(AuthContext)
  const hasViewerSession = hasViewerRequestSession()

  if (authContext.isLoading && !hasViewerSession) {
    return <AppLoadingPage />
  }

  if (authContext.isNotLoggedIn && !hasViewerSession) {
    return <AppCommonLayout outlet={<SettingsLoginPrompt />} />
  }

  return (
    <>
      <AppCommonLayout
        outlet={
          <div className="md:flex md:space-x-4">
            <div className="hidden md:block">
              <SettingsNavigation />
            </div>
            <Outlet />
          </div>
        }
      />
    </>
  )
}
