import { Search, TrendingUp, Hash, Tag, Image } from "lucide-react"
import { Input } from "~/components/ui/input"
import { Button } from "~/components/ui/button"
import { Switch } from "~/components/ui/switch"
import { Label } from "~/components/ui/label"
import { useTranslation } from "~/hooks/use-translation"
import { useState } from "react"
import { useNavigate, useSearchParams } from "@remix-run/react"

export function TagsHeader() {
  const t = useTranslation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState("")
  const [isTagMode, setIsTagMode] = useState(false) // false: 作品検索, true: タグページ遷移

  const handleSearch = () => {
    if (!searchQuery.trim()) return

    if (isTagMode) {
      // タグページに遷移
      navigate(`/tags/${encodeURIComponent(searchQuery.trim())}`)
    } else {
      // 作品検索
      const params = new URLSearchParams(searchParams)
      params.set("search", searchQuery.trim())
      setSearchParams(params)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="space-y-6 text-center">
      {/* アニメーション付きタイトル */}
      <div className="relative">
        <h1 className="animate-pulse bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text font-bold text-6xl text-transparent">
          <Hash className="mr-4 inline-block h-12 w-12 text-blue-500" />
          {t("タグ", "Tags")}
        </h1>
        <div className="-inset-1 absolute animate-pulse rounded-lg bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 blur-xl" />
      </div>

      {/* サブタイトル */}
      <p className="mx-auto max-w-2xl text-muted-foreground text-xl">
        {t(
          "人気のタグを発見して、お気に入りの作品を見つけよう",
          "Discover popular tags and find your favorite artworks",
        )}
      </p>

      {/* 統計情報 */}
      <div className="flex items-center justify-center gap-8 text-muted-foreground text-sm">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-green-500" />
          <span>{t("トレンド更新中", "Trending Now")}</span>
        </div>
        <div className="flex items-center gap-2">
          <Hash className="h-4 w-4 text-blue-500" />
          <span>{t("10,000+ タグ", "10,000+ Tags")}</span>
        </div>
      </div>

      {/* 検索バー */}
      <div className="mx-auto max-w-lg space-y-4">
        {/* 検索モード切り替え */}
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center space-x-2">
            <Image className="h-4 w-4 text-blue-500" />
            <Label htmlFor="search-mode" className="text-sm">
              {t("作品検索", "Search Works")}
            </Label>
            {/** biome-ignore lint/nursery/useUniqueElementIds: <explanation> */}
            <Switch
              id="search-mode"
              checked={isTagMode}
              onCheckedChange={setIsTagMode}
            />
            <Label htmlFor="search-mode" className="text-sm">
              {t("タグページ", "Tag Page")}
            </Label>
            <Tag className="h-4 w-4 text-purple-500" />
          </div>
        </div>

        {/* 検索入力欄 */}
        <div className="group relative">
          <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground transition-colors group-focus-within:text-blue-500" />
          <Input
            type="text"
            placeholder={
              isTagMode
                ? t(
                    "タグ名を入力してページに移動...",
                    "Enter tag name to navigate...",
                  )
                : t("キーワードで作品を検索...", "Search works by keywords...")
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="rounded-xl border-2 border-gray-200 bg-white/70 py-3 pr-20 pl-10 backdrop-blur-sm transition-all duration-300 hover:bg-white/90 focus:border-blue-500 focus:bg-white"
          />
          <div className="-translate-y-1/2 absolute top-1/2 right-2 flex transform items-center gap-1">
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="h-6 w-6 rounded-full p-0 hover:bg-gray-200"
              >
                ×
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleSearch}
              disabled={!searchQuery.trim()}
              className="h-8 px-3"
            >
              {isTagMode ? t("移動", "Go") : t("検索", "Search")}
            </Button>
          </div>
        </div>

        {/* 説明テキスト */}
        <p className="text-center text-muted-foreground text-xs">
          {isTagMode
            ? t("タグページに直接移動します", "Navigate directly to tag page")
            : t("このページで作品を検索します", "Search works on this page")}
        </p>
      </div>
    </div>
  )
}
