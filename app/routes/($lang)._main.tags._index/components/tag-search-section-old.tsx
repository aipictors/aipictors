import { useState } from "react"
import { useSearchParams } from "@remix-run/react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Search, X } from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"
import { ResponsivePhotoWorksAlbum } from "~/components/responsive-photo-works-album"
import type { FragmentOf } from "gql.tada"
import type { PhotoAlbumWorkFragment } from "~/components/responsive-photo-works-album"

type Props = {
  isSensitive?: boolean
  searchWorks?: FragmentOf<typeof PhotoAlbumWorkFragment>[] | null
  searchTerm?: string | null
}

export function TagSearchSection({ searchWorks, searchTerm }: Props) {
  const t = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchValue, setSearchValue] = useState(
    searchTerm || searchParams.get("search") || "",
  )

  const handleSearch = () => {
    if (searchValue.trim()) {
      const params = new URLSearchParams(searchParams)
      params.set("search", searchValue.trim())
      setSearchParams(params)
    }
  }

  const handleClearSearch = () => {
    setSearchValue("")
    const params = new URLSearchParams(searchParams)
    params.delete("search")
    setSearchParams(params)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <section className="space-y-6">
      {/* 検索ヘッダー */}
      <div className="space-y-3 text-center">
        <h2 className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text font-semibold text-2xl text-transparent">
          {t("タグ検索", "Tag Search")}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t("タグで作品を検索してみよう", "Search works by tags")}
        </p>
      </div>

      {/* 検索フォーム */}
      <div className="mx-auto max-w-2xl">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t("タグを入力...", "Enter tags...")}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch} disabled={!searchValue.trim()}>
            {t("検索", "Search")}
          </Button>
          {searchTerm && (
            <Button onClick={handleClearSearch} variant="outline" size="icon">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* 検索結果 */}
      {searchTerm && (
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-muted-foreground text-sm">
              {t(
                `"${searchTerm}" の検索結果`,
                `Search results for "${searchTerm}"`,
              )}
            </p>
          </div>

          {searchWorks && searchWorks.length > 0 && (
            <ResponsivePhotoWorksAlbum
              works={searchWorks}
              isShowProfile={true}
            />
          )}

          {searchWorks && searchWorks.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">
                {t("該当する作品が見つかりませんでした", "No works found")}
              </p>
            </div>
          )}

          {searchWorks === null && (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          )}
        </div>
      )}
    </section>
  )
}
