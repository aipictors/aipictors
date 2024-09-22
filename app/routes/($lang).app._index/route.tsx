import { AppAboutHeader } from "~/routes/($lang).app._index/components/app-about-header"
import { AppFooter } from "~/routes/($lang).app._index/components/app-footer"
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { META } from "~/config"
import { createMeta } from "~/utils/create-meta"
import { checkLocaleRedirect } from "~/utils/check-locale-redirect"

/**
 * アプリの紹介ページ
 */
export default function Route() {
  return (
    <>
      <AppAboutHeader />
      <AppFooter />
    </>
  )
}

export async function loader(props: LoaderFunctionArgs) {
  const redirectResponse = checkLocaleRedirect(props.request)
  if (redirectResponse) {
    return redirectResponse
  }
  return {}
}

export const meta: MetaFunction = (props) => {
  return createMeta(META.APP, undefined, props.params.lang)
}
