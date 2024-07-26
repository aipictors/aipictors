import { AppCommonLayout } from "@/_components/app/app-common-layout"
import type { MetaFunction } from "@remix-run/cloudflare"
import { Outlet } from "@remix-run/react"

export const meta: MetaFunction = () => {
  return [{ name: "robots", content: "noindex" }]
}

export default function MainLayout() {
  return (
    <>
      <AppCommonLayout outlet={<Outlet />} />
    </>
  )
}
