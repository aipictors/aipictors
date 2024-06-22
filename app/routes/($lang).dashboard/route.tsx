import { AppAside } from "@/_components/app/app-aside"
import { AppColumnLayout } from "@/_components/app/app-column-layout"
import { ConstructionAlert } from "@/_components/header-develop-banner"
import { HomeFooter } from "@/_components/home-footer"
import { AuthContext } from "@/_contexts/auth-context"
import HomeHeader from "@/routes/($lang)._main._index/_components/home-header"
import { HomeRouteList } from "@/routes/($lang)._main._index/_components/home-route-list"
import type { MetaFunction } from "@remix-run/cloudflare"
import { Outlet } from "@remix-run/react"
import { useContext } from "react"

export const meta: MetaFunction = () => {
  return [{ name: "robots", content: "noindex" }, { title: "-" }]
}

export default function DashboardLayout() {
  const authContext = useContext(AuthContext)

  return (
    <>
      <HomeHeader />
      <ConstructionAlert
        type="WARNING"
        message="このページは現在開発中です。不具合が起きる可能性があります。"
        fallbackURL={`https://www.aipictors.com/dashboard?id=${authContext.userId}`}
        date={"2024-07-30"}
      />
      <AppColumnLayout>
        <AppAside>
          <HomeRouteList />
        </AppAside>
        <Outlet />
      </AppColumnLayout>
      <HomeFooter />
    </>
  )
}
