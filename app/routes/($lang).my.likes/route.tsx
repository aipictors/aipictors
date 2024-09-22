import { AppLoadingPage } from "~/components/app/app-loading-page"
import { AuthContext } from "~/contexts/auth-context"
import { useQuery } from "@apollo/client/index"
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { graphql } from "gql.tada"
import React from "react"
import { Suspense, useContext } from "react"
import { LikeListContainer } from "~/routes/($lang).my._index/components/like-list-container"
import { META } from "~/config"
import { createMeta } from "~/utils/create-meta"
import { checkLocaleRedirect } from "~/utils/check-locale-redirect"

export const meta: MetaFunction = (props) => {
  return createMeta(META.MY_LIKES, undefined, props.params.lang)
}

export async function loader(props: LoaderFunctionArgs) {
  const redirectResponse = checkLocaleRedirect(props.request)

  if (redirectResponse) {
    return redirectResponse
  }

  return {}
}

export default function MyLikes() {
  const [likedPage, setLikedPage] = React.useState(0)

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

  const likedMaxCount = userResp?.user?.createdLikesCount
    ? userResp.user.createdLikesCount > 400
      ? 400
      : userResp.user.createdLikesCount
    : 0

  return (
    <>
      <Suspense fallback={<AppLoadingPage />}>
        <LikeListContainer
          page={likedPage}
          maxCount={likedMaxCount}
          setPage={setLikedPage}
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
      createdLikesCount
    }
  }`,
)
