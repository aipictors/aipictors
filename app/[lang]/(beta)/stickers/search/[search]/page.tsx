import { StickerList } from "@/app/[lang]/(beta)/stickers/_components/sticker-list"
import { StickerListHeader } from "@/app/[lang]/(beta)/stickers/_components/sticker-list-header"
import { StickerSearchForm } from "@/app/[lang]/(beta)/stickers/_components/sticker-search-form"
import { createClient } from "@/app/_contexts/client"
import { stickersQuery } from "@/graphql/queries/sticker/stickers"
import type { Metadata } from "next"

type Props = {
  params: {
    search: string
  }
}

/**
 * スタンプの一覧
 * @returns
 *
 */
const StickersPage = async (props: Props) => {
  const client = createClient()

  const stickersResp = await client.query({
    query: stickersQuery,
    variables: {
      offset: 0,
      limit: 256,
      where: {
        search: decodeURIComponent(props.params.search),
      },
    },
  })

  const isEmpty = stickersResp.data.stickers.length === 0

  return (
    <main className="flex flex-col space-y-8 pb-16 px-4 md:pr-8">
      <StickerListHeader />
      <StickerSearchForm text={decodeURIComponent(props.params.search)} />
      {isEmpty ? (
        <p>{"スタンプが見つかりませんでした"}</p>
      ) : (
        <StickerList stickers={stickersResp.data.stickers} />
      )}
    </main>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default StickersPage
