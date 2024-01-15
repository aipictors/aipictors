import { StickerList } from "@/app/[lang]/(beta)/stickers/_components/sticker-list"
import { StickerListHeader } from "@/app/[lang]/(beta)/stickers/_components/sticker-list-header"
import { StickerSearchForm } from "@/app/[lang]/(beta)/stickers/_components/sticker-search-form"
import { createClient } from "@/app/_contexts/client"
import type { StickersQuery } from "@/graphql/__generated__/graphql"
import { stickersQuery } from "@/graphql/queries/sticker/stickers"
import type { Metadata } from "next"

/**
 * スタンプの一覧
 * @returns
 */
const StickersPage = async () => {
  const client = createClient()

  const stickersResp = await client.query({
    query: stickersQuery,
    variables: {
      offset: 0,
      limit: 256,
      where: {},
    },
  })

  return (
    <main className="flex flex-col space-y-8 pb-16 px-4 md:pr-8">
      <StickerListHeader />
      <StickerSearchForm />
      <section className="flex flex-col gap-y-4">
        <h2 className="text-lg font-bold">{"新着"}</h2>
        <StickerList stickers={stickersResp.data.stickers} />
      </section>
    </main>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "AIイラストスタンプ広場",
  description:
    "作ったスタンプを公開したり、みんなの作ったスタンプをダウンロードして使ってみましょう！",
}

export const revalidate = 60

export default StickersPage
