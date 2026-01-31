import { AppCommonLayout } from "~/components/app/app-common-layout"
import { AppLoadingPage } from "~/components/app/app-loading-page"
import { AuthContext } from "~/contexts/auth-context"
import { MyContents } from "~/routes/($lang).my/components/my-contents"
import { Outlet } from "@remix-run/react"
import { Suspense, useContext } from "react"

export default function MyLayout () {
  const authContext = useContext(AuthContext)

  if (authContext.isLoading || authContext.isNotLoggedIn) {
    return null
  }

  return (
    <Suspense fallback={<AppLoadingPage />}>
      <AppCommonLayout outlet={<MyContents outlet={<Outlet />} />} />
    </Suspense>
  )
}
