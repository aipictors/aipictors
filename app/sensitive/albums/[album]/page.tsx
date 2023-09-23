import type { Metadata } from "next"
import { PagePlaceholder } from "app/components/PagePlaceholder"

const SensitiveAlbumPage = async () => {
  return <PagePlaceholder>{"シリーズ"}</PagePlaceholder>
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default SensitiveAlbumPage
