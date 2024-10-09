import { ParamsError } from "~/errors/params-error"
import { loaderClient } from "~/lib/loader-client"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { json, useParams } from "@remix-run/react"
import { useLoaderData } from "@remix-run/react"
import { UserProfileIconFragment } from "~/routes/($lang)._main.users.$user._index/components/user-profile-name-icon"
import { graphql } from "gql.tada"
import { UserPostsItemFragment } from "~/routes/($lang)._main.users.$user.posts/components/user-posts-content-body"
import { UserPostsPage } from "~/routes/($lang)._main.users.$user.posts/components/user-posts-page"

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.user === undefined) {
    throw new Response(null, { status: 404 })
  }

  const userIdResp = await loaderClient.query({
    query: userIdQuery,
    variables: {
      userId: decodeURIComponent(props.params.user),
    },
  })

  if (userIdResp.data.user === null) {
    throw new Response(null, { status: 404 })
  }

  const url = new URL(props.request.url)

  const page = url.searchParams.get("page")
    ? Number.parseInt(url.searchParams.get("page") as string) > 100
      ? 0
      : Number.parseInt(url.searchParams.get("page") as string)
    : 0

  const worksResp = await loaderClient.query({
    query: worksAndUserProfileQuery,
    variables: {
      offset: page * 32,
      limit: 32,
      userId: userIdResp.data.user.id,
      where: {
        userId: userIdResp.data.user.id,
        ratings: ["G", "R15"],
        workType: "WORK",
        isNowCreatedAt: true,
      },
    },
  })

  if (worksResp.data.user === null) {
    throw new Response(null, { status: 404 })
  }

  return json({
    user: worksResp.data.user,
    works: worksResp.data.works,
    maxCount: worksResp.data.worksCount,
    page,
  })
}

export default function UserPosts() {
  const params = useParams()

  if (params.user === undefined) {
    throw ParamsError()
  }

  const data = useLoaderData<typeof loader>()

  return (
    <>
      <UserPostsPage
        user={data.user}
        posts={data.works}
        page={data.page}
        maxCount={data.maxCount}
      />
    </>
  )
}

const userIdQuery = graphql(
  `query UserId($userId: ID!) {
    user(id: $userId) {
      id
    }
  }`,
)

export const worksAndUserProfileQuery = graphql(
  `query UserWorks($userId: ID!, $offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    user(id: $userId) {
      ...UserProfileIcon
    }
    works(offset: $offset, limit: $limit, where: $where) {
      ...UserPostsItem
    }
    worksCount(where: $where)
  }`,
  [UserPostsItemFragment, UserProfileIconFragment],
)
