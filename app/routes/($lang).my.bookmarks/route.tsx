import { AppLoadingPage } from "~/components/app/app-loading-page"
import { AuthContext } from "~/contexts/auth-context"
import { partialWorkFieldsFragment } from "~/graphql/fragments/partial-work-fields"
import { BookmarkListContainer } from "~/routes/($lang).my._index/components/bookmark-list-container"
import { useQuery } from "@apollo/client/index"
import type { HeadersFunction, MetaFunction } from "@remix-run/cloudflare"
import { graphql } from "gql.tada"
import React from "react"
import { Suspense, useContext } from "react"
import { createMeta } from "~/utils/create-meta"
import { META } from "~/config"

export const headers: HeadersFunction = () => {
  return {
    "Cache-Control": "max-age=0, s-maxage=0",
  }
}

export const meta: MetaFunction = () => {
  return createMeta(META.MY_BOOKMARKS)
}

export default function MyBookmarks() {
  const [bookmarkPage, setBookmarkPage] = React.useState(0)

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

  const bookmarkMaxCount = userResp?.user?.createdBookmarksCount
    ? userResp.user.createdBookmarksCount > 400
      ? 400
      : userResp.user.createdBookmarksCount
    : 0

  return (
    <>
      <Suspense fallback={<AppLoadingPage />}>
        <BookmarkListContainer
          page={bookmarkPage}
          maxCount={bookmarkMaxCount}
          setPage={setBookmarkPage}
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
      createdBookmarksCount
    }
  }`,
  [partialWorkFieldsFragment],
)
