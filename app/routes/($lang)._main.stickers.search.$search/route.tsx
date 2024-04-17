import { StickerList } from "@/[lang]/(main)/stickers/_components/sticker-list"
import { StickerListHeader } from "@/[lang]/(main)/stickers/_components/sticker-list-header"
import { StickerSearchForm } from "@/[lang]/(main)/stickers/_components/sticker-search-form"
import { stickersQuery } from "@/_graphql/queries/sticker/stickers"
import { createClient } from "@/_lib/client"
import { ParamsError } from "@/errors/params-error"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { useParams } from "@remix-run/react"
import { useLoaderData } from "@remix-run/react"

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.search === undefined) {
    throw new Response(null, { status: 404 })
  }

  const client = createClient()

  const stickers = await client.query({
    query: stickersQuery,
    variables: {
      offset: 0,
      limit: 256,
      where: {
        search: decodeURIComponent(props.params.search),
      },
    },
  })

  const isEmpty = stickers.data.stickers.length === 0
  return {
    stickers: stickers.data.stickers,
    isEmpty,
    search: props.params.search,
  }
}

/**
 * スタンプの検索画面
 * @returns
 */
export default function Stickers() {
  const params = useParams()

  if (params.search === undefined) {
    throw new ParamsError()
  }

  const data = useLoaderData<typeof loader>()

  return (
    <main className="flex flex-col space-y-8 pb-16">
      <StickerListHeader />
      <StickerSearchForm text={decodeURIComponent(data.search)} />
      {data.isEmpty ? (
        <p>{"スタンプが見つかりませんでした"}</p>
      ) : (
        <StickerList stickers={data.stickers} />
      )}
    </main>
  )
}
