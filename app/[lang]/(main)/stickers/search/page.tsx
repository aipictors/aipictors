import { StickersDocument, StickersQuery } from "@/__generated__/apollo"
import { StickerList } from "@/app/[lang]/(main)/stickers/_components/sticker-list"
import { StickerSearchForm } from "@/app/[lang]/(main)/stickers/_components/sticker-search-form"
import { createClient } from "@/app/_contexts/client"
import type { Metadata } from "next"

/**
 * スタンプの検索画面
 * @returns
 */
const StickersSearchPage = async () => {
  const client = createClient()

  const stickersQuery = await client.query<StickersQuery>({
    query: StickersDocument,
    variables: {
      offset: 0,
      limit: 64,
    },
  })

  return (
    <div className="flex flex-col">
      <h1>{"キーワードでスタンプを検索できます"}</h1>
      <StickerSearchForm />
      <StickerList stickers={stickersQuery.data.stickers} />
    </div>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default StickersSearchPage
