import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { json } from "@remix-run/cloudflare"
import { useLoaderData } from "@remix-run/react"
import { Suspense } from "react"
import { AppLoadingPage } from "~/components/app/app-loading-page"
import { GalleryView } from "./components/gallery-view"
import { GalleryFilters } from "./components/gallery-filters"
import { GalleryToolbar } from "./components/gallery-toolbar"
import { useTranslation } from "~/hooks/use-translation"
import { checkLocaleRedirect } from "~/utils/check-locale-redirect"

type LoaderData = {
  rating: "G" | "R15" | "R18" | "R18G"
  workType: "WORK" | "NOVEL" | "VIDEO" | "COLUMN" | null
  sort: "DATE_CREATED" | "LIKES_COUNT" | "VIEWS_COUNT" | "COMMENTS_COUNT"
  style: "ILLUSTRATION" | "PHOTO" | "SEMI_REAL" | null
  isSensitive: boolean
}

export async function loader(props: LoaderFunctionArgs) {
  const redirectResponse = checkLocaleRedirect(props.request)
  if (redirectResponse) {
    return redirectResponse
  }

  const url = new URL(props.request.url)
  const searchParams = url.searchParams

  const rating = (searchParams.get("rating") ?? "G") as LoaderData["rating"]
  const workType = searchParams.get("workType") as LoaderData["workType"]
  const sort = (searchParams.get("sort") ??
    "DATE_CREATED") as LoaderData["sort"]
  const style = searchParams.get("style") as LoaderData["style"]
  const isSensitive = searchParams.get("sensitive") === "true"

  return json({
    rating,
    workType,
    sort,
    style,
    isSensitive,
  })
}

/**
 * ピンタレスト風ギャラリーページ
 */
export default function GalleryPage() {
  const data = useLoaderData<typeof loader>()
  const t = useTranslation()

  // リダイレクトレスポンスの場合は何も表示しない
  if ("status" in data) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* ヘッダー */}
      <div className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold text-2xl">
                {t("ギャラリー", "Gallery")}
              </h1>
              <p className="text-muted-foreground text-sm">
                {t(
                  "作品をピンタレスト風に探索",
                  "Explore artworks Pinterest-style",
                )}
              </p>
            </div>
            <GalleryToolbar />
          </div>
        </div>
      </div>

      {/* フィルター */}
      <div className="sticky top-[88px] z-30 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-4 py-3">
          <GalleryFilters
            initialRating={data.rating}
            initialWorkType={data.workType}
            initialSort={data.sort}
            initialStyle={data.style}
            initialIsSensitive={data.isSensitive}
          />
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 px-4 py-6">
        <Suspense fallback={<AppLoadingPage />}>
          <GalleryView
            rating={data.rating}
            workType={data.workType}
            sort={data.sort}
            style={data.style}
            isSensitive={data.isSensitive}
          />
        </Suspense>
      </div>
    </div>
  )
}
