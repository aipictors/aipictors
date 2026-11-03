import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/cloudflare"
import { useLoaderData, useParams } from "@remix-run/react"
import { graphql } from "gql.tada"
import { config } from "~/config"
import { ParamsError } from "~/errors/params-error"
import { loaderClient } from "~/lib/loader-client"
import { createUserTabMeta } from "~/routes/($lang)._main.users.$user/user-tab-meta"
import { UserStickerList } from "~/routes/($lang)._main.users.$user.stickers/components/user-sticker-list"
import { loadUserStickers } from "~/routes/($lang)._main.users.$user.stickers/utils/load-user-stickers"

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

  return await loadUserStickers(userIdResp.data.user.id, props.request)
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

  return <UserStickerList data={data} />
}

const userIdQuery = graphql(
  `query UserId($userId: ID!) {
    user(id: $userId) {
      id
    }
  }`,
)

export const meta = createUserTabMeta("スタンプ", "Stickers")
