import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/cloudflare"
import { useLoaderData, useParams } from "@remix-run/react"
import { graphql } from "gql.tada"
import { parseUserWorksListParams } from "~/components/user-works/user-works-tab-layout"
import { config } from "~/config"
import { ParamsError } from "~/errors/params-error"
import { loaderClient } from "~/lib/loader-client"
import { createUserTabMeta } from "~/routes/($lang)._main.users.$user/user-tab-meta"
import {
  UserPostList,
  UserPostsItemFragment,
} from "~/routes/($lang)._main.users.$user.posts/components/user-post-list"

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

  const { page, sort, orderWhere } = parseUserWorksListParams(props.request.url)

  const worksResp = await loaderClient.query({
    query: userPostsQuery,
    variables: {
      offset: page * 32,
      limit: 32,
      where: {
        userId: userIdResp.data.user.id,
        ratings: ["G", "R15"],
        workType: "WORK",
        isNowCreatedAt: true,
        ...orderWhere,
      },
    },
  })

  return {
    works: worksResp.data.works,
    maxCount: worksResp.data.worksCount,
    page,
    sort,
    login: decodeURIComponent(props.params.user),
  }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneMinute,
})

export default function UserPosts() {
  const params = useParams()

  if (params.user === undefined) {
    throw new ParamsError()
  }

  const data = useLoaderData<typeof loader>()

  return (
    <div className="flex w-full flex-col justify-center">
      <UserPostList
        works={data.works}
        page={data.page}
        maxCount={data.maxCount}
        sort={data.sort}
        login={data.login}
      />
    </div>
  )
}

const userIdQuery = graphql(
  `query UserId($userId: ID!) {
    user(id: $userId) {
      id
    }
  }`,
)

export const userPostsQuery = graphql(
  `query UserWorks($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...UserPostsItem
    }
    worksCount(where: $where)
  }`,
  [UserPostsItemFragment],
)

export const meta = createUserTabMeta("画像作品", "Images")
