import WorkPageLoading from "@/app/[lang]/(main)/works/loading"
import { AppPlaceholder } from "@/components/app/app-placeholder"
import type { Metadata } from "next"
import { Suspense } from "react"

/**
 * 作品一覧ページ
 */
const WorksPage = async () => {
  return (
    <Suspense fallback={<WorkPageLoading />}>
      <AppPlaceholder>{"作品の一覧"}</AppPlaceholder>
    </Suspense>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default WorksPage
