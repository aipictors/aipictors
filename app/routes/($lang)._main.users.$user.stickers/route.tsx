import { UserWorkListActions } from "@/[lang]/(main)/users/[user]/_components/user-work-list-actions"
import { UserStickerList } from "@/[lang]/(main)/users/[user]/stickers/_components/user-sticker-list"
import { userStickersQuery } from "@/_graphql/queries/user/user-stickers"
import { createClient } from "@/_lib/client"
import { ClientParamsError } from "@/errors/client-params-error"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { useParams } from "@remix-run/react"
import { useLoaderData } from "@remix-run/react"

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

  return {
    stickers: stickersResp.data.user.stickers,
  }
}

export default function UserStickers() {
  const params = useParams()

  if (params.user === undefined) {
    throw new ClientParamsError()
  }

  const data = useLoaderData<typeof loader>()

  return (
    <>
      <UserWorkListActions />
      <UserStickerList stickers={data.stickers} />
    </>
  )
}
