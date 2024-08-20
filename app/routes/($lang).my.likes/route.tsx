import { AppLoadingPage } from "~/components/app/app-loading-page"
import { AuthContext } from "~/contexts/auth-context"
import { useQuery } from "@apollo/client/index"
import type { MetaFunction } from "@remix-run/cloudflare"
import { graphql } from "gql.tada"
import React from "react"
import { Suspense, useContext } from "react"
import { LikeListContainer } from "~/routes/($lang).my._index/components/like-list-container"

export const meta: MetaFunction = () => {
  const metaTitle = "Aipictors - ダッシュボード - いいね"

  const metaDescription = "ダッシュボード - いいね"

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
