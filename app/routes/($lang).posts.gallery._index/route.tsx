import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { json } from "@remix-run/cloudflare"
import { useLoaderData, useSearchParams } from "@remix-run/react"
import { Suspense } from "react"
import { AppLoadingPage } from "~/components/app/app-loading-page"
import { GalleryView } from "./components/gallery-view"
import { GalleryHeader } from "~/components/gallery-header"
import { GallerySearchFilters } from "~/components/gallery-search-filters"
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

  // 現在の検索テキストとフィルターパラメータを取得（リアルタイム）
  const currentSearchText = searchParams.get("q") ?? ""
  const promptText = searchParams.get("prompt") ?? ""
  const workTypeParam = searchParams.get("workType") as
    | "WORK"
    | "NOVEL"
    | "VIDEO"
    | "COLUMN"
    | null
  const sortParam = searchParams.get("sort") as
    | "DATE_CREATED"
    | "LIKES_COUNT"
    | "VIEWS_COUNT"
    | "COMMENTS_COUNT"
    | null
  const ratingsParam = searchParams.get("ratings")
  const hasPrompt = searchParams.get("hasPrompt") === "true"

  // レーティングを配列に変換
  const ratings: ("G" | "R15" | "R18" | "R18G")[] = ratingsParam
    ? ratingsParam
        .split(",")
        .filter((r): r is "G" | "R15" | "R18" | "R18G" =>
          ["G", "R15", "R18", "R18G"].includes(
            r as "G" | "R15" | "R18" | "R18G",
          ),
        )
    : ["G"]

  return (
    <div className="flex min-h-screen flex-col">
      {/* ヘッダー */}
      <GalleryHeader />

      {/* 詳細検索フィルター */}
      <GallerySearchFilters />

      {/* メインコンテンツ */}
      <div className="flex-1 px-4 py-6">
        <Suspense fallback={<AppLoadingPage />}>
          <GalleryView
            rating={data.rating}
            workType={workTypeParam || data.workType}
            sort={sortParam || data.sort}
            style={data.style}
            isSensitive={data.isSensitive}
            searchText={currentSearchText}
            promptText={promptText}
            ratings={ratings}
            hasPrompt={hasPrompt}
          />
        </Suspense>
      </div>
    </div>
  )
}
