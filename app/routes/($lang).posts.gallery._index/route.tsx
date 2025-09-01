import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { json } from "@remix-run/cloudflare"
import { useLoaderData, useSearchParams } from "@remix-run/react"
import { Suspense, useEffect } from "react"
import { AppLoadingPage } from "~/components/app/app-loading-page"
import { GalleryView } from "./components/gallery-view"
import { GalleryFilters } from "./components/gallery-filters"
import { GalleryHeader } from "~/components/gallery-header"
import { checkLocaleRedirect } from "~/utils/check-locale-redirect"

type LoaderData = {
  rating: "G" | "R15" | "R18" | "R18G"
  workType: "WORK" | "NOVEL" | "VIDEO" | "COLUMN" | null
  sort: "DATE_CREATED" | "LIKES_COUNT" | "VIEWS_COUNT" | "COMMENTS_COUNT"
  style: "ILLUSTRATION" | "PHOTO" | "SEMI_REAL" | null
  isSensitive: boolean
  searchText: string
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
  const searchText = searchParams.get("q") ?? ""

  console.log("Gallery loader - search text:", searchText)

  return json({
    rating,
    workType,
    sort,
    style,
    isSensitive,
    searchText,
  })
}

/**
 * ピンタレスト風ギャラリーページ
 */
export default function GalleryPage() {
  const data = useLoaderData<typeof loader>()
  const [searchParams] = useSearchParams()

  // リダイレクトレスポンスの場合は何も表示しない
  if ("status" in data) {
    return null
  }

  // 検索パラメータの変更を監視
  useEffect(() => {
    console.log("Gallery page - search params changed:", searchParams.get("q"))
  }, [searchParams])

  // 現在の検索テキストを取得（リアルタイム）
  const currentSearchText = searchParams.get("q") ?? ""
  
  return (
    <div className="flex min-h-screen flex-col">
      {/* ヘッダー */}
      <GalleryHeader />

      {/* メインコンテンツ */}
      <div className="flex-1 px-4 py-6">
        <Suspense fallback={<AppLoadingPage />}>
          <GalleryView
            rating={data.rating}
            workType={data.workType}
            sort={data.sort}
            style={data.style}
            isSensitive={data.isSensitive}
            searchText={currentSearchText}
          />
        </Suspense>
      </div>
    </div>
  )
}
