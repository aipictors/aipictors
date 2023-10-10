import type { Metadata } from "next"
import { PlaceholderPage } from "app/components/Placeholder"

const SensitiveAlbumsPage = async () => {
  return <PlaceholderPage>{"シリーズの一覧"}</PlaceholderPage>
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default SensitiveAlbumsPage
