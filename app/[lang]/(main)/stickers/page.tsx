import type { StickersQuery } from "__generated__/apollo"
import { StickersDocument } from "__generated__/apollo"
import { StickerList } from "app/[lang]/(main)/stickers/components/StickerList"
import { createClient } from "app/client"
import type { Metadata } from "next"

/**
 * https://www.aipictors.com/stamp-space/
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

  return <StickerList stickersQuery={stickersQuery.data} />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default StickersPage
