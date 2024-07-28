import { ParamsError } from "~/errors/params-error"
import { partialStickerFieldsFragment } from "~/graphql/fragments/partial-sticker-fields"
import { createClient } from "~/lib/client"
import { UserStickerList } from "~/routes/($lang)._main.users.$user.stickers/components/user-sticker-list"
import { UserWorkListActions } from "~/routes/($lang)._main.users.$user/components/user-work-list-actions"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { json, useParams } from "@remix-run/react"
import { useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.user === undefined) {
    throw new Response(null, { status: 404 })
  }

  const client = createClient()

  const stickersResp = await client.query({
    query: userStickersQuery,
    variables: {
      userId: props.params.user,
      offset: 0,
      limit: 256,
    },
  })

  if (stickersResp.data.user === null) {
    throw new Response(null, { status: 404 })
  }

  return json({
    stickers: stickersResp.data.user.stickers,
  })
}

export default function UserStickers() {
  const params = useParams()

  if (params.user === undefined) {
    throw new ParamsError()
  }

  const data = useLoaderData<typeof loader>()

  return (
    <>
      <UserWorkListActions />
      <UserStickerList stickers={data.stickers} />
    </>
  )
}

const userStickersQuery = graphql(
  `query UserStickers($userId: ID!, $offset: Int!, $limit: Int!) {
    user(id: $userId) {
      id
      stickers(offset: $offset, limit: $limit) {
        ...PartialStickerFields
      }
    }
  }`,
  [partialStickerFieldsFragment],
)
