import { ContributorsView } from "~/routes/($lang)._main.contributors/components/contributors-view"
import type { MetaFunction } from "@remix-run/cloudflare"
import { META } from "~/config"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = (props) => {
  return createMeta(META.CONTRIBUTORS, undefined, props.params.lang)
}

/**
 * コントリビュータ一覧ページ
 */
export default function Contributors() {
  return <ContributorsView />
}
