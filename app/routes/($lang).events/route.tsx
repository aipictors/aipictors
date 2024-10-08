import { AppCommonLayout } from "~/components/app/app-common-layout"
import { Outlet } from "@remix-run/react"

export default function EventsLayout() {
  return (
    <>
      <AppCommonLayout outlet={<Outlet />} />
    </>
  )
}
