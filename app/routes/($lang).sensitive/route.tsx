import { HomeHeader } from "@/[lang]/(main)/_components/home-header"
import { SensitiveRouteList } from "@/[lang]/sensitive/_components/sensitive-route-list"
import { AppAside } from "@/_components/app/app-aside"
import { HomeFooter } from "@/_components/home-footer"
import { Separator } from "@/_components/ui/separator"
import { Outlet } from "@remix-run/react"

export default function SensitiveLayout() {
  return (
    <>
      <HomeHeader />
      <div className="flex items-start space-x-0">
        <AppAside>
          <SensitiveRouteList />
        </AppAside>
        <Outlet />
      </div>
      <Separator />
      <HomeFooter />
    </>
  )
}