import { stickersQuery } from "@/_graphql/queries/sticker/stickers"
import { createClient } from "@/_lib/client"
import { StickerList } from "@/routes/($lang)._main.stickers._index/_components/sticker-list"
import { StickerListHeader } from "@/routes/($lang)._main.stickers._index/_components/sticker-list-header"
import { StickerSearchForm } from "@/routes/($lang)._main.stickers._index/_components/sticker-search-form"
import type { MetaFunction } from "@remix-run/cloudflare"
import { useLoaderData } from "@remix-run/react"

export const meta: MetaFunction = () => {
  return [
    { title: "AIイラストスタンプ広場" },
    {
      description:
        "作ったスタンプを公開したり、みんなの作ったスタンプをダウンロードして使ってみましょう！",
    },
  ]
}

export async function loader() {
  const client = createClient()

  const stickersResp = await client.query({
    query: stickersQuery,
    variables: {
      offset: 0,
      limit: 256,
      where: {},
    },
  })
  return {
    stickers: stickersResp.data.stickers,
  }
}

export default function StickersPage() {
  const data = useLoaderData<typeof loader>()

  return (
    <main className="flex flex-col space-y-8 pb-16">
      <StickerListHeader />
      <StickerSearchForm />
      <section className="flex flex-col gap-y-4">
        <h2 className="font-bold text-lg">{"新着"}</h2>
        <StickerList stickers={data.stickers} />
      </section>
    </main>
  )
}
