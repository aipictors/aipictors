import { AppLoadingPage } from "~/components/app/app-loading-page"
import { DashboardHomeContents } from "~/routes/($lang).my._index/components/my-home-contents"
import type { HeadersFunction, MetaFunction } from "@remix-run/cloudflare"
import { Suspense } from "react"
import { createMeta } from "~/utils/create-meta"
import { META } from "~/config"

export const headers: HeadersFunction = () => {
  return {
    "Cache-Control": "max-age=0, s-maxage=0",
  }
}

export const meta: MetaFunction = () => {
  return createMeta(META.MY_RECOMMENDED)
}

export default function MyHome() {
  return (
    <>
      <Suspense fallback={<AppLoadingPage />}>
        <DashboardHomeContents />
      </Suspense>
    </>
  )
}
