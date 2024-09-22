import { AppLoadingPage } from "~/components/app/app-loading-page"
import { AuthContext } from "~/contexts/auth-context"
import { FollowingList } from "~/routes/($lang).following._index/components/following-list"
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { Suspense, useContext } from "react"
import { META } from "~/config"
import { checkLocaleRedirect } from "~/utils/check-locale-redirect"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = (props) => {
  return createMeta(META.FOLLOWINGS, undefined, props.params.lang)
}

export async function loader(props: LoaderFunctionArgs) {
  const redirectResponse = checkLocaleRedirect(props.request)

  if (redirectResponse) {
    return redirectResponse
  }

  return {}
}

export default function FollowingLayout() {
  const authContext = useContext(AuthContext)

  return (
    <>
      <Suspense fallback={<AppLoadingPage />}>
        {authContext.isLoggedIn && <FollowingList />}
      </Suspense>
    </>
  )
}
