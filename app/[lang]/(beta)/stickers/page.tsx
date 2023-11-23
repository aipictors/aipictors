import type { StickersQuery } from "@/__generated__/apollo"
import { StickersDocument } from "@/__generated__/apollo"
import { StickerList } from "@/app/[lang]/(beta)/stickers/_components/sticker-list"
import { StickerListHeader } from "@/app/[lang]/(beta)/stickers/_components/sticker-list-header"
import { StickerSearchForm } from "@/app/[lang]/(beta)/stickers/_components/sticker-search-form"
import { createClient } from "@/app/_contexts/client"
import type { Metadata } from "next"

/**
 * スタンプの一覧
 * @returns
 */
const StickersPage = async () => {
  const client = createClient()

  const stickersQuery = await client.query<StickersQuery>({
    query: StickersDocument,
    variables: {
      offset: 0,
      limit: 256,
    },
  })

  return (
    <main className="flex flex-col space-y-8 pb-16 px-4 md:pr-8">
      <StickerListHeader />
      <StickerSearchForm />
      <section className="flex flex-col gap-y-4">
        <h2 className="text-lg font-bold">{"新着"}</h2>
        <StickerList stickers={stickersQuery.data.stickers} />
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
