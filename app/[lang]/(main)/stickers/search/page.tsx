import { Stack, Text } from "@chakra-ui/react"
import { StickersDocument, StickersQuery } from "__generated__/apollo"
import { StickerList } from "app/[lang]/(main)/stickers/_components/StickerList"
import StickerSearchForm from "app/[lang]/(main)/stickers/_components/StickerSearchForm"
import { createClient } from "app/_contexts/client"
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
    <Stack>
      <Text>{"キーワードでスタンプを検索できます"}</Text>
      <StickerSearchForm />
      <StickerList stickers={stickersQuery.data.stickers} />
    </Stack>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default StickersSearchPage
