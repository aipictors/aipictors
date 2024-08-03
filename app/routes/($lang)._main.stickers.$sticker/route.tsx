import { StickerArticle } from "~/routes/($lang)._main.stickers.$sticker/components/sticker-article"
import { json, type LoaderFunctionArgs } from "@remix-run/cloudflare"
import { createClient } from "~/lib/client"
import { useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.sticker === undefined) {
    throw new Response(null, { status: 404 })
  }

  const client = createClient()

  const stickerResp = await client.query({
    query: stickerQuery,
    variables: {
      id: props.params.sticker,
    },
  })

  if (
    stickerResp.data.sticker === null ||
    stickerResp.data.sticker === undefined ||
    stickerResp.data.sticker.accessType !== "PUBLIC"
  ) {
    throw new Response(null, { status: 404 })
  }

  console.log(stickerResp.data.sticker)

  return json({
    sticker: stickerResp.data.sticker,
  })
}

/**
 * スタンプの詳細
 */
export default function Sticker() {
  const data = useLoaderData<typeof loader>()

  return (
    <>
      <StickerArticle
        sticker={{
          id: data.sticker.id,
          title: data.sticker.title,
          imageUrl: data.sticker.imageUrl ?? "",
          userId: data.sticker.userId,
          downloadsCount: data.sticker.downloadsCount,
          usesCount: data.sticker.usesCount,
          likesCount: data.sticker.likesCount,
          accessType: data.sticker.accessType,
          createdAt: data.sticker.createdAt,
          user: {
            login: data.sticker.user.login,
            name: data.sticker.user.name,
            iconUrl: data.sticker.user.iconUrl ?? "",
          },
        }}
      />
    </>
  )
}

const stickerQuery = graphql(`
  query Sticker($id: ID!) {
    sticker(id: $id) {
      id
      title
      imageUrl
      userId
      downloadsCount
      usesCount
      likesCount
      accessType
      createdAt
      user {
        login
        name
        iconUrl
      }
    }
  }
`)
