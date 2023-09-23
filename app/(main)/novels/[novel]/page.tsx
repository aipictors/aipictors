import type { Metadata } from "next"
import { PagePlaceholder } from "app/components/PagePlaceholder"

const NovelPage = async () => {
  return <PagePlaceholder>{"小説の詳細"}</PagePlaceholder>
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default NovelPage
