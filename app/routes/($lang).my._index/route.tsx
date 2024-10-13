import { AppLoadingPage } from "~/components/app/app-loading-page"
import { DashboardHomeContents } from "~/routes/($lang).my._index/components/my-home-contents"
import { Suspense } from "react"
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { createMeta } from "~/utils/create-meta"
import { META } from "~/config"

export const meta: MetaFunction = (props) => {
  return createMeta(META.MY, undefined, props.params.lang)
}

export async function loader(props: LoaderFunctionArgs) {
  // const redirectResponse = checkLocaleRedirect(props.request)

  // if (redirectResponse) {
  //   return redirectResponse
  // }

  return {}
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
