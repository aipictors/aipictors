import { AppContents } from "@/_components/app/app-contents"
import { HomeFooter } from "@/_components/home-footer"
import { AuthContext } from "@/_contexts/auth-context"
import HomeHeader from "@/routes/($lang)._main._index/_components/home-header"
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
      <AppContents outlet={<Outlet />} footer={<HomeFooter />} />
    </>
  )
}
