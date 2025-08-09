import { useTranslation } from "~/hooks/use-translation"
import { ResponsivePhotoWorksAlbum } from "~/components/responsive-photo-works-album"
import type { FragmentOf } from "gql.tada"
import type { PhotoAlbumWorkFragment } from "~/components/responsive-photo-works-album"

type Props = {
  searchWorks?: FragmentOf<typeof PhotoAlbumWorkFragment>[] | null
  searchTerm?: string | null
}

export function TagSearchSection({ searchWorks, searchTerm }: Props) {
  const t = useTranslation()

  // 検索結果がない場合は何も表示しない
  if (!searchTerm) {
    return null
  }

  return (
    <section className="space-y-6">
      {/* 検索結果ヘッダー */}
      <div className="text-center">
        <h2 className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text font-semibold text-2xl text-transparent dark:from-purple-400 dark:to-pink-400">
          {t("検索結果", "Search Results")}
        </h2>
        <p className="mt-2 text-muted-foreground text-sm">
          {t(
            `"${searchTerm}" の検索結果`,
            `Search results for "${searchTerm}"`,
          )}
        </p>
      </div>

      {/* 検索結果 */}
      <div className="space-y-4">
        {searchWorks && searchWorks.length > 0 && (
          <ResponsivePhotoWorksAlbum works={searchWorks} isShowProfile={true} />
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
    </section>
  )
}
