import { Metadata } from "next"
import { PagePlaceholder } from "components/PagePlaceholder"

const AlbumPage = async () => {
  return <PagePlaceholder>{"シリーズ"}</PagePlaceholder>
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default AlbumPage
