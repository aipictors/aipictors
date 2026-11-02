import type { MetaFunction } from "@remix-run/cloudflare"
import { META } from "~/config"
import { createMeta } from "~/utils/create-meta"
import { GuidelineArticle } from "~/routes/($lang)._main.guideline/components/guideline-article"

export const meta: MetaFunction = (props) => {
  return createMeta(META.GUIDELINE, undefined, props.params.lang)
}

/**
 * ガイドライン
 */
export default function Guideline () {
  return <GuidelineArticle />
}
