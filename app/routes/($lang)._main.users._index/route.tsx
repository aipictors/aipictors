import { Outlet } from "@remix-run/react"
import { AppCommonLayout } from "~/components/app/app-common-layout"
import { SettingsNavigation } from "~/routes/($lang).settings._index/components/settings-navigation"

export default function Users() {
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
