export { headers, loader } from "~/routes/($lang)._main._index/route"

import type { MetaFunction } from "@remix-run/cloudflare"
import { META } from "~/config"
import { HomeIndexPage } from "~/routes/($lang)._main._index/route"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = (props) => {
  return createMeta(META.NEW_WORKS, undefined, props.params.lang)
}

export default function NewWorksPage() {
  return <HomeIndexPage forcedTab="new" isNewWorksPage />
}
