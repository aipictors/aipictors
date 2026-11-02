export { headers, loader } from "~/routes/($lang)._main._index/route"

import type { MetaFunction } from "@remix-run/cloudflare"
import { useOutlet } from "@remix-run/react"
import { META } from "~/config"
import { HomeIndexPage } from "~/routes/($lang)._main._index/route"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = (props) => {
  return createMeta(META.HOME_FEED, undefined, props.params.lang)
}

export default function HomePage() {
  const outlet = useOutlet()

  if (outlet) {
    return outlet
  }

  return <HomeIndexPage forcedTab="home" />
}
