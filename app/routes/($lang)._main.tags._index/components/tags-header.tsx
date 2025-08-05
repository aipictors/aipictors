import { Search, TrendingUp, Hash, Tag, Image } from "lucide-react"
import { Input } from "~/components/ui/input"
import { Button } from "~/components/ui/button"
import { Switch } from "~/components/ui/switch"
import { Label } from "~/components/ui/label"
import { useTranslation } from "~/hooks/use-translation"
import { useState } from "react"
import { useNavigate, useSearchParams } from "@remix-run/react"
import { isSensitiveKeyword } from "~/utils/is-sensitive-keyword"
import { SensitiveToggle } from "~/components/sensitive/sensitive-toggle"

export function TagsHeader() {
  const t = useTranslation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState("")
  const [isTagMode, setIsTagMode] = useState(false) // false: 作品検索, true: タグページ遷移

  const handleSearch = () => {
    if (!searchQuery.trim()) return

    const trimmedQuery = searchQuery.trim()

    if (isTagMode) {
      // タグページに遷移
      if (isSensitiveKeyword(trimmedQuery)) {
        // タグページモードでセンシティブなワードの場合は/rに強制リダイレクト
        navigate(`/r/tags/${encodeURIComponent(trimmedQuery)}`)
      } else {
        navigate(`/tags/${encodeURIComponent(trimmedQuery)}`)
      }
    } else {
      // 作品検索（センシティブワードでも現在のページで検索結果を表示）
      const params = new URLSearchParams(searchParams)
      params.set("search", trimmedQuery)
      setSearchParams(params)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="space-y-8 text-center">
      {/* モダンなタイトル - シャープ記号を削除 */}
      <div className="space-y-4">
        <h1 className="bg-gradient-to-r from-slate-800 via-slate-600 to-slate-800 bg-clip-text font-semibold text-4xl text-transparent tracking-tight dark:from-white dark:via-gray-300 dark:to-white">
          {t("作品とタグを検索", "Search Works & Tags")}
        </h1>

        {/* クリーンなサブタイトル */}
        <p className="mx-auto max-w-2xl leading-relaxed text-lg text-muted-foreground">
          {t(
            "キーワードやタグで作品を見つけよう",
            "Discover artworks by keywords and tags",
          )}
        </p>
      </div>

      {/* 統計情報とR18ボタン */}
      <div className="flex flex-col items-center gap-4">
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

        {/* R18モード切り替えボタン */}
        <div className="flex items-center justify-center">
          <SensitiveToggle
            variant="compact"
            className="transition-transform hover:scale-105"
            showStatus={true}
          />
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
            {/** biome-ignore lint/nursery/useUniqueElementIds: 複数のSwitchが同じIDを使用している */}
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

        {/* 検索入力欄 - モダンでクリーンなデザイン */}
        <div className="group relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-blue-500" />
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
            className="rounded-lg border border-gray-200 bg-white py-3 pl-10 pr-20 transition-all duration-200 hover:border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
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
