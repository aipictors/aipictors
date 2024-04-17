import WorksPageLoading from "@/[lang]/(main)/works/loading"
import { AppPlaceholder } from "@/_components/app/app-placeholder"
import { Suspense } from "react"

/**
 * 作品一覧ページ
 */
export default function Works() {
  return (
    <Suspense fallback={<WorksPageLoading />}>
      <AppPlaceholder>{"作品の一覧"}</AppPlaceholder>
    </Suspense>
  )
}
