import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/cloudflare"
import { useLoaderData, useParams } from "@remix-run/react"
import { graphql } from "gql.tada"
import { parseUserWorksListParams } from "~/components/user-works/user-works-tab-layout"
import { config } from "~/config"
import { ParamsError } from "~/errors/params-error"
import { loaderClient } from "~/lib/loader-client"
import { createUserTabMeta } from "~/routes/($lang)._main.users.$user/user-tab-meta"
import {
  UserNovelList,
  UserNovelsItemFragment,
} from "~/routes/($lang)._main.users.$user.novels/components/user-novel-list"

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
    query: userNovelsQuery,
    variables: {
      offset: page * 32,
      limit: 32,
      where: {
        userId: userIdResp.data.user.id,
        ratings: ["G", "R15"],
        workType: "NOVEL",
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
  "Cache-Control": config.cacheControl.oneHour,
})

export default function UserPosts() {
  const params = useParams()

  if (params.user === undefined) {
    throw new ParamsError()
  }

  const data = useLoaderData<typeof loader>()

  return (
    <div className="flex w-full flex-col justify-center">
      <UserNovelList
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

export const userNovelsQuery = graphql(
  `query UserWorks($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...UserNovelsItem
    }
    worksCount(where: $where)
  }`,
  [UserNovelsItemFragment],
)

export const meta = createUserTabMeta("小説", "Novels")
