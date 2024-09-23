import { AppAboutHeader } from "~/routes/($lang).app._index/components/app-about-header"
import { AppFooter } from "~/routes/($lang).app._index/components/app-footer"
import { config, META } from "~/config"
import { createMeta } from "~/utils/create-meta"
import { json } from "@remix-run/react"
import type { MetaFunction } from "@remix-run/cloudflare"

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

export async function loader() {
  return json({}, { headers: { "Cache-Control": config.cacheControl.oneDay } })
}

export const meta: MetaFunction = (props) => {
  return createMeta(META.APP, undefined, props.params.lang)
}
