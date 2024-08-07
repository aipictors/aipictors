import { AppCommonLayout } from "~/components/app/app-common-layout"
import { AppLoadingPage } from "~/components/app/app-loading-page"
import { AuthContext } from "~/contexts/auth-context"
import { createMeta } from "~/utils/create-meta"
import { MyContents } from "~/routes/($lang).my/components/my-contents"
import { Outlet } from "@remix-run/react"
import { Suspense, useContext } from "react"

export const meta = () => {
  return createMeta({
    title: "Aipictors - ダッシュボード",
    description: "ダッシュボード",
  })
}

export default function MyLayout() {
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
