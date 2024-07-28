import { AppLoadingPage } from "@/components/app/app-loading-page"
import { AppPlaceholder } from "@/components/app/app-placeholder"
import { Suspense } from "react"

/**
 * 作品一覧ページ
 */
export default function Works() {
  return (
    <Suspense fallback={<AppLoadingPage />}>
      <AppPlaceholder>{"作品の一覧"}</AppPlaceholder>
    </Suspense>
  )
}
