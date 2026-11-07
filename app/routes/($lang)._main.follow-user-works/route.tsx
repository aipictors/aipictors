export { headers, loader } from "~/routes/($lang)._main._index/route"

import type { MetaFunction } from "@remix-run/cloudflare"
import { META } from "~/config"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = (props) => {
  return createMeta(META.FOLLOW_FEED, undefined, props.params.lang)
}

import { HomeIndexPage } from "~/routes/($lang)._main._index/route"

export default function FollowUserWorksPage() {
  return <HomeIndexPage forcedTab="follow-user" />
}
