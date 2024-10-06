import { AppCommonLayout } from "~/components/app/app-common-layout"
import type { MetaFunction } from "@remix-run/cloudflare"
import { Outlet } from "react-router"

export const meta: MetaFunction = () => {
  return [{ name: "robots", content: "noindex" }, { title: "-" }]
}

export default function FollowerLayout() {
  return (
    <>
      <AppCommonLayout outlet={<Outlet />} />
    </>
  )
}
