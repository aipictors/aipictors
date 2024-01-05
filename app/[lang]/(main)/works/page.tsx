import { PlaceholderPage } from "@/app/_components/page/placeholder-page"
import type { Metadata } from "next"

/**
 * 作品一覧ページ
 */
const WorksPage = async () => {
  return <PlaceholderPage>{"作品の一覧"}</PlaceholderPage>
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default WorksPage
