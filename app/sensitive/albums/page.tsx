import type { Metadata } from "next"
import { PagePlaceholder } from "app/components/PagePlaceholder"

const SensitiveAlbumsPage = async () => {
  return <PagePlaceholder>{"シリーズの一覧"}</PagePlaceholder>
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default SensitiveAlbumsPage
