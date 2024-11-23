import { AppCommonLayout } from "~/components/app/app-common-layout"
import { Outlet } from "react-router";

export default function EventsLayout() {
  return (
    <>
      <AppCommonLayout outlet={<Outlet />} />
    </>
  )
}
