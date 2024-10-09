import { ParamsError } from "~/errors/params-error"
import { loaderClient } from "~/lib/loader-client"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { json, useParams } from "@remix-run/react"
import { useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"
import { UserStickersItemFragment } from "~/routes/($lang)._main.users.$user.stickers/components/user-stickers-content-body"
import { UserProfileIconFragment } from "~/routes/($lang)._main.users.$user._index/components/user-profile-name-icon"
import { UserContentHeader } from "~/routes/($lang)._main.users.$user._index/components/user-content-header"
import { UserSensitiveStickersContentBody } from "~/routes/($lang).r.users.$user.stickers/components/user-stickers-content-body"

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

  const stickersResp = await loaderClient.query({
    query: userStickersQuery,
    variables: {
      userId: userIdResp.data.user.id,
      offset: 0,
      limit: 256,
    },
  })

  if (stickersResp.data.user === null) {
    throw new Response(null, { status: 404 })
  }

  return json({
    page,
    user: stickersResp.data.user,
    stickers: stickersResp.data.user.stickers,
  })
}

export default function UserSensitivePosts() {
  const params = useParams()

  if (params.user === undefined) {
    throw ParamsError()
  }

  const data = useLoaderData<typeof loader>()

  return (
    <div className="flex w-full flex-col justify-center">
      <UserContentHeader user={data.user} />
      <UserSensitiveStickersContentBody
        user={data.user}
        stickers={data.stickers}
        page={data.page}
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

const userStickersQuery = graphql(
  `query UserStickers($userId: ID!, $offset: Int!, $limit: Int!) {
    user(id: $userId) {
      ...UserProfileIcon
    }
    user(id: $userId) {
      id
      stickers(offset: $offset, limit: $limit) {
        ...StickerItem
      }
    }
  }`,
  [UserStickersItemFragment, UserProfileIconFragment],
)
