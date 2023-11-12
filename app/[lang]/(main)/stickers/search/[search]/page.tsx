import type {
  StickersQuery,
  StickersQueryVariables,
} from "__generated__/apollo"
import { StickersDocument } from "__generated__/apollo"
import { StickerList } from "app/[lang]/(main)/stickers/_components/sticker-list"
import { createClient } from "app/_contexts/client"
import type { Metadata } from "next"

import { Stack, Text } from "@chakra-ui/react"
import StickerSearchForm from "app/[lang]/(main)/stickers/_components/sticker-search-form"

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

  console.log(props.params.search)
  const stickersQuery = await client.query<
    StickersQuery,
    StickersQueryVariables
  >({
    query: StickersDocument,
    variables: {
      offset: 0,
      limit: 256,
      where: {
        search: decodeURIComponent(props.params.search),
      },
    },
  })

  return (
    <Stack>
      <StickerSearchForm text={decodeURIComponent(props.params.search)} />
      {stickersQuery.data.stickers.length === 0 ? (
        <Text>{"スタンプが見つかりませんでした"}</Text>
      ) : (
        <StickerList stickers={stickersQuery.data.stickers} />
      )}
    </Stack>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default StickersPage
