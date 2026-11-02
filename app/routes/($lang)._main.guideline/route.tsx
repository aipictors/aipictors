import type { HeadersFunction, MetaFunction } from "@remix-run/cloudflare"
import { config, META } from "~/config"
import { GuidelineArticle } from "~/routes/($lang)._main.guideline/components/guideline-article"
import { createMeta } from "~/utils/create-meta"

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneDay,
})

export const meta: MetaFunction = (props) => {
  return createMeta(META.GUIDELINE, undefined, props.params.lang)
}

/**
 * ガイドライン
 */
export default function Guideline () {
  return <GuidelineArticle />
}
