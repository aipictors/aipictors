import { PlaceholderPage } from "@/app/_components/placeholder-page"
import type { Metadata } from "next"

const SensitiveAlbumsPage = async () => {
  return <PlaceholderPage>{"シリーズの一覧"}</PlaceholderPage>
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default SensitiveAlbumsPage
