import { PlaceholderPage } from "app/components/Placeholder"
import type { Metadata } from "next"

const SensitiveAlbumPage = async () => {
  return <PlaceholderPage>{"シリーズ"}</PlaceholderPage>
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default SensitiveAlbumPage
