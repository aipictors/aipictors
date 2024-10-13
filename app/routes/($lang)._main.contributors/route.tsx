import { ContributorsView } from "~/routes/($lang)._main.contributors/components/contributors-view"
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { META } from "~/config"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = (props) => {
  return createMeta(META.CONTRIBUTORS, undefined, props.params.lang)
}

export async function loader(props: LoaderFunctionArgs) {
  // const redirectResponse = checkLocaleRedirect(props.request)

  // if (redirectResponse) {
  //   return redirectResponse
  // }

  return {}
}

/**
 * コントリビュータ一覧ページ
 */
export default function Contributors() {
  return <ContributorsView />
}
