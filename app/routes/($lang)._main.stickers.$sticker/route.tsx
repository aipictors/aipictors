import { StickerArticle } from "~/routes/($lang)._main.stickers.$sticker/components/sticker-article"
import { json, type LoaderFunctionArgs } from "@remix-run/cloudflare"
import { createClient } from "~/lib/client"
import { useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"
import { StickerList } from "~/routes/($lang)._main.stickers._index/components/sticker-list"
import { partialStickerFieldsFragment } from "~/graphql/fragments/partial-sticker-fields"
import { config } from "~/config"

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

  const favoritedStickersResp = await client.query({
    query: stickersQuery,
    variables: {
      offset: 0,
      limit: 40,
      where: {
        orderBy: "DATE_DOWNLOADED",
        sort: "DESC",
      },
    },
  })

  return json(
    {
      sticker: stickerResp.data.sticker,
      stickers: favoritedStickersResp.data.stickers,
    },
    {
      headers: {
        "Cache-Control": config.cacheControl.oneDay,
      },
    },
  )
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
      <section className="flex flex-col gap-y-4">
        <h2 className="font-bold text-lg">{"人気"}</h2>
        <StickerList stickers={data.stickers} />
      </section>
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

const stickersQuery = graphql(
  `query Stickers($offset: Int!, $limit: Int!, $where: StickersWhereInput) {
    stickers(offset: $offset, limit: $limit, where: $where) {
      ...PartialStickerFields
    }
  }`,
  [partialStickerFieldsFragment],
)
