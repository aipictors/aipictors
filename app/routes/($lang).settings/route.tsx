import { AppCommonLayout } from "~/components/app/app-common-layout"
import { AppLoadingPage } from "~/components/app/app-loading-page"
import { AuthContext } from "~/contexts/auth-context"
import { Outlet } from "react-router"
import { useContext } from "react"
import { SettingsNavigation } from "~/routes/($lang).settings._index/components/settings-navigation"

export function HydrateFallback() {
  return <AppLoadingPage />
}

export default function SettingsLayout() {
  const authContext = useContext(AuthContext)

  if (authContext.isLoading) {
    return null
  }

  if (authContext.isNotLoggedIn) {
    return null
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
