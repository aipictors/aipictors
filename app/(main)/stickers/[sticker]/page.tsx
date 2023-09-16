import { Metadata } from "next"
import { PagePlaceholder } from "components/PagePlaceholder"

const StickerPage = async () => {
  return <PagePlaceholder>{"スタンプ"}</PagePlaceholder>
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default StickerPage
