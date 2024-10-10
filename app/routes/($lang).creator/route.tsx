import { Outlet } from "react-router"
import { CreatorFooter } from "~/routes/($lang).creator/components/creator-footer"
import { CreatorHeader } from "~/routes/($lang).creator/components/creator-header"

export default function Route() {
  return (
    <>
      <CreatorHeader />
      <Outlet />
      <CreatorFooter />
    </>
  )
}
