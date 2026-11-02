import { AppCommonLayout } from "~/components/app/app-common-layout"
import { AppLoadingPage } from "~/components/app/app-loading-page"
import { AuthContext } from "~/contexts/auth-context"
import { hasViewerRequestSession } from "~/lib/viewer-request-headers"
import { Outlet, useLocation } from "@remix-run/react"
import { useTranslation } from "~/hooks/use-translation"
import { useContext } from "react"
import { SettingsLoginPrompt } from "~/routes/($lang).settings/components/settings-login-prompt"
import { SettingsNavigation } from "~/routes/($lang).settings._index/components/settings-navigation"
import { findSettingsPage } from "~/routes/($lang).settings._index/utils/settings-pages"

export function HydrateFallback () {
  return <AppLoadingPage />
}

export default function SettingsLayout () {
  const authContext = useContext(AuthContext)
  const hasViewerSession = hasViewerRequestSession()
  const t = useTranslation()
  const location = useLocation()
  const page = findSettingsPage(location.pathname)

  if (authContext.isLoading && !hasViewerSession) {
    return <AppLoadingPage />
  }

  if (authContext.isNotLoggedIn && !hasViewerSession) {
    return <AppCommonLayout outlet={<SettingsLoginPrompt />} />
  }

  return (
    <AppCommonLayout
      isStickyEnabled
      outlet={
        <div className="md:flex md:gap-6">
          <div className="hidden w-52 shrink-0 md:block">
            <div className="sticky top-20 max-h-[calc(100dvh-6rem)] overflow-y-auto pr-1">
              <SettingsNavigation />
            </div>
          </div>
          <div className="mx-auto w-full min-w-0 max-w-3xl flex-1">
            {page && (
              <h1 className="mb-4 hidden font-bold text-2xl md:block">
                {t(page.ja, page.en)}
              </h1>
            )}
            <Outlet />
          </div>
        </div>
      }
    />
  )
}
