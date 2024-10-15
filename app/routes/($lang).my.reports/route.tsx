import { AppLoadingPage } from "~/components/app/app-loading-page"
import { AuthContext } from "~/contexts/auth-context"
import { useQuery } from "@apollo/client/index"
import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { graphql } from "gql.tada"
import React from "react"
import { Suspense, useContext } from "react"
import { ModerationReportsContainer } from "~/routes/($lang).my._index/components/reported-list-container"
import { config, META } from "~/config"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = (props) => {
  return createMeta(META.MY_REPORTS, undefined, props.params.lang)
}

export async function loader(props: LoaderFunctionArgs) {
  // const redirectResponse = checkLocaleRedirect(props.request)

  // if (redirectResponse) {
  //   return redirectResponse
  // }

  return {}
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneHour,
})

export default function MyViews() {
  const [ViewedPage, setViewedPage] = React.useState(0)

  const authContext = useContext(AuthContext)

  if (!authContext.isLoggedIn) {
    return <AppLoadingPage />
  }

  const { data: userResp, refetch } = useQuery(userQuery, {
    skip: authContext.isLoading,
    variables: {
      userId: decodeURIComponent(authContext.userId),
    },
  })

  const ViewedMaxCount = userResp?.user?.createdViewsCount
    ? userResp.user.createdViewsCount > 400
      ? 400
      : userResp.user.createdViewsCount
    : 0

  return (
    <>
      <Suspense fallback={<AppLoadingPage />}>
        <ModerationReportsContainer
          page={ViewedPage}
          maxCount={ViewedMaxCount}
          setPage={setViewedPage}
        />
      </Suspense>
    </>
  )
}

const userQuery = graphql(
  `query User(
    $userId: ID!,
  ) {
    user(id: $userId) {
      id
      createdViewsCount
    }
  }`,
)
