import { AppPlaceholder } from "@/components/app/app-placeholder"
import type { Metadata } from "next"

/**
 * 作品一覧ページ
 */
const WorksPage = async () => {
  return <AppPlaceholder>{"作品の一覧"}</AppPlaceholder>
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default WorksPage
