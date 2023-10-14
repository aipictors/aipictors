import { PlaceholderPage } from "app/components/Placeholder"
import type { Metadata } from "next"

const SensitiveCollectionPage = async () => {
  return <PlaceholderPage>{"コレクション"}</PlaceholderPage>
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default SensitiveCollectionPage
