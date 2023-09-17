import type { Metadata } from "next"
import { PagePlaceholder } from "app/components/PagePlaceholder"

const GuidelinePage = async () => {
  return <PagePlaceholder>{"ガイドライン"}</PagePlaceholder>
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default GuidelinePage
