import { ParamsError } from "~/errors/params-error"
import { loaderClient } from "~/lib/loader-client"
import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/cloudflare"
import { useParams } from "@remix-run/react"
import { useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"
import {
  UserNoteList,
  UserNotesItemFragment,
} from "~/routes/($lang)._main.users.$user.notes/components/user-note-list"
import { config } from "~/config"

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
    query: userNotesQuery,
    variables: {
      offset: page * 32,
      limit: 32,
      where: {
        userId: userIdResp.data.user.id,
        ratings: ["G", "R15"],
        workType: "COLUMN",
        isNowCreatedAt: true,
      },
    },
  })

  return {
    works: worksResp.data.works,
    maxCount: worksResp.data.worksCount,
    page,
  }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneHour,
})

export default function UserNotes() {
  const params = useParams()

  if (params.user === undefined) {
    throw new ParamsError()
  }

  const data = useLoaderData<typeof loader>()

  return (
    <div className="flex w-full flex-col justify-center">
      <UserNoteList
        works={data.works}
        page={data.page}
        maxCount={data.maxCount}
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

export const userNotesQuery = graphql(
  `query UserWorks($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...UserNotesItem
    }
    worksCount(where: $where)
  }`,
  [UserNotesItemFragment],
)
