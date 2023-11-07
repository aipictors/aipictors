import { Stack } from "@chakra-ui/react"
import type { StickersQuery } from "__generated__/apollo"
import { StickersDocument } from "__generated__/apollo"
import { StickerList } from "app/[lang]/(main)/stickers/_components/StickerList"
import { StickerListHeader } from "app/[lang]/(main)/stickers/_components/StickerListHeader"
import StickerSearchForm from "app/[lang]/(main)/stickers/_components/StickerSearchForm"
import { createClient } from "app/_contexts/client"
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
    <Stack>
      <StickerListHeader />
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

export default StickersPage
