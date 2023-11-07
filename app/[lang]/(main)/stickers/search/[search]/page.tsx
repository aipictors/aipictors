import type {
  StickersQuery,
  StickersQueryVariables,
} from "__generated__/apollo"
import { StickersDocument } from "__generated__/apollo"
import { StickerList } from "app/[lang]/(main)/stickers/_components/StickerList"
import { createClient } from "app/_contexts/client"
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

  return <StickerList stickers={stickersQuery.data.stickers} />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default StickersPage
