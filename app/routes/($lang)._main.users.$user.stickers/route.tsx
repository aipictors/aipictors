import { UserWorkListActions } from "@/[lang]/(main)/users/[user]/_components/user-work-list-actions"
import { UserStickerList } from "@/[lang]/(main)/users/[user]/stickers/_components/user-sticker-list"
import { userStickersQuery } from "@/_graphql/queries/user/user-stickers"
import { createClient } from "@/_lib/client"
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
  return {
    stickers: stickersResp.data.user?.stickers ?? [],
  }
}

export default function UserStickers() {
  const params = useParams()

  if (params.stickers === undefined) {
    throw new Error()
  }

  const data = useLoaderData<typeof loader>()

  return (
    <>
      <UserWorkListActions />
      <UserStickerList stickers={data.stickers} />
    </>
  )
}
