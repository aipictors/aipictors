import { AppCommonLayout } from "~/components/app/app-common-layout"
import { AppLoadingPage } from "~/components/app/app-loading-page"
import { LoginPage } from "~/components/page/login-page"
import { AuthContext } from "~/contexts/auth-context"
import { MyContents } from "~/routes/($lang).my/components/my-contents"
import { Outlet } from "@remix-run/react"
import { Suspense, useContext } from "react"

export default function MyLayout() {
  const authContext = useContext(AuthContext)

  if (authContext.isLoading) {
    return null
  }

  // ログインしていないと真っ白だった
  if (authContext.isNotLoggedIn) {
    return <AppCommonLayout outlet={<LoginPage />} />
  }

  return (
    <Suspense fallback={<AppLoadingPage />}>
      {/* ページ送りとメニューを画面に固定するので、横のはみ出しは clip で止める */}
      <AppCommonLayout
        isStickyEnabled
        outlet={<MyContents outlet={<Outlet />} />}
      />
    </Suspense>
  )
}
