import type { Metadata } from "next"
import { PagePlaceholder } from "app/components/PagePlaceholder"

const TagPage = async () => {
  return <PagePlaceholder>{"タグ"}</PagePlaceholder>
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default TagPage
