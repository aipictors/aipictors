import { ParamsError } from "~/errors/params-error"
import { loaderClient } from "~/lib/loader-client"
import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/cloudflare"
import { useParams } from "@remix-run/react"
import { useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"
import {
  UserStickerList,
  UserStickersItemFragment,
} from "~/routes/($lang)._main.users.$user.stickers/components/user-sticker-list"
import { config } from "~/config"
import { AuthContext } from "~/contexts/auth-context"
import { useContext } from "react"
import { useQuery } from "@apollo/client/index"

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

  return {
    page,
    stickers: stickersResp.data.user.stickers,
    userId: userIdResp.data.user.id,
  }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneHour,
})

export default function UserPosts () {
  const params = useParams()

  if (params.user === undefined) {
    throw new ParamsError()
  }

  const appContext = useContext(AuthContext)

  const data = useLoaderData<typeof loader>()

  const { data: stickers } = useQuery(userStickersQuery, {
    skip: appContext.isLoading || appContext.isNotLoggedIn,
    variables: {
      userId: data.userId,
      offset: 0,
      limit: 256,
    },
  })

  const userStickers = data.stickers ?? stickers?.user?.stickers

  return (
    <div className="flex w-full flex-col justify-center">
      <UserStickerList stickers={userStickers} page={data.page} />
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
      stickers(offset: $offset, limit: $limit) {
        ...StickerItem
      }
    }
  }`,
  [UserStickersItemFragment],
)
