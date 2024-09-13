import { AppLoadingPage } from "~/components/app/app-loading-page"
import { AuthContext } from "~/contexts/auth-context"
import { useQuery } from "@apollo/client/index"
import type { MetaFunction } from "@remix-run/cloudflare"
import { graphql } from "gql.tada"
import React from "react"
import { Suspense, useContext } from "react"
import { ViewedListContainer } from "~/routes/($lang).my._index/components/viewed-list-container"

export const meta: MetaFunction = () => {
  const metaTitle = "Aipictors - ダッシュボード - 閲覧履歴"

  const metaDescription = "ダッシュボード - 閲覧履歴"

  const metaImage =
    "https://pub-c8b482e79e9f4e7ab4fc35d3eb5ecda8.r2.dev/aipictors-ogp.jpg"

  return [
    { title: metaTitle },
    { name: "description", content: metaDescription },
    { name: "robots", content: "noindex" },
    { name: "twitter:title", content: metaTitle },
    { name: "twitter:description", content: metaDescription },
    { name: "twitter:image", content: metaImage },
    { name: "twitter:card", content: "summary_large_image" },
    { property: "og:title", content: metaTitle },
    { property: "og:description", content: metaDescription },
    { property: "og:image", content: metaImage },
    { property: "og:site_name", content: metaTitle },
  ]
}

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
        <ViewedListContainer
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
