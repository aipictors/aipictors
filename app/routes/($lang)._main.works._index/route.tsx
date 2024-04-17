import { AppLoadingPage } from "@/_components/app/app-loading-page"
import { AppPlaceholder } from "@/_components/app/app-placeholder"
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
