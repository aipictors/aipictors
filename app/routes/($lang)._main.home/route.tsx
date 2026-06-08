export { headers, loader, meta } from "~/routes/($lang)._main._index/route"

import { useOutlet } from "@remix-run/react"
import { HomeIndexPage } from "~/routes/($lang)._main._index/route"

export default function HomePage() {
  const outlet = useOutlet()

  if (outlet) {
    return outlet
  }

  return <HomeIndexPage forcedTab="home" />
}
