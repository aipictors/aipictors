import { AppCommonLayout } from "~/components/app/app-common-layout"
import type { MetaFunction } from "@remix-run/cloudflare"
import { Outlet } from "@remix-run/react"

export const meta: MetaFunction = () => {
  return [{ title: "-" }]
}

export default function AlbumsLayout () {
  return <AppCommonLayout title="シリーズ" outlet={<Outlet />} />
}