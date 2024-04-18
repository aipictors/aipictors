import { HomeHeader } from "@/[lang]/(main)/_components/home-header"
import { AppAside } from "@/_components/app/app-aside"
import { AppColumnLayout } from "@/_components/app/app-column-layout"
import { HomeFooter } from "@/_components/home-footer"
import { Separator } from "@/_components/ui/separator"
import { SensitiveRouteList } from "@/routes/($lang).sensitive/_components/sensitive-route-list"
import type { MetaFunction } from "@remix-run/cloudflare"
import { Outlet } from "@remix-run/react"

export const meta: MetaFunction = () => {
  return [{ name: "robots", content: "noindex" }, { title: "-" }]
}

export default function SensitiveLayout() {
  return (
    <>
      <HomeHeader />
      <AppColumnLayout>
        <AppAside>
          <SensitiveRouteList />
        </AppAside>
        <Outlet />
      </AppColumnLayout>
      <Separator />
      <HomeFooter />
    </>
  )
}
