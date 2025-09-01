import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet"
import { ScrollArea } from "~/components/ui/scroll-area"
import { MenuIcon, Search, X, Grid3X3 } from "lucide-react"
import { useState, Suspense, lazy, useEffect } from "react"
import {
  useNavigate,
  Link,
  useLocation,
  useSearchParams,
} from "@remix-run/react"
import { useTranslation } from "~/hooks/use-translation"

// Lazy load メニューコンポーネント
const HomeMenuRouteList = lazy(() =>
  import("~/routes/($lang)._main._index/components/home-menu-route-list").then(
    (module) => ({
      default: module.HomeMenuRouteList,
    }),
  ),
)

/**
 * ギャラリー用ヘッダー
 */
export function GalleryHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchText, setSearchText] = useState("")
  const [isMobile, setIsMobile] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const t = useTranslation()

  // 現在の検索テキストをURLパラメータから初期化
  useEffect(() => {
    const currentSearchText = searchParams.get("q") || ""
    setSearchText(currentSearchText)
  }, [searchParams])

  // モバイル判定
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const handleSearch = () => {
    if (searchText.trim()) {
      // 現在のページがギャラリーページの場合は、このページ内で検索
      if (location.pathname.includes("/posts/gallery")) {
        const newSearchParams = new URLSearchParams(searchParams)
        newSearchParams.set("q", searchText.trim())
        navigate(`${location.pathname}?${newSearchParams.toString()}`)
      } else {
        // その他のページの場合は検索ページに遷移
        navigate(`/search?q=${encodeURIComponent(searchText.trim())}`)
      }
    } else {
      // 検索テキストが空の場合は検索パラメータを削除
      if (location.pathname.includes("/posts/gallery")) {
        const newSearchParams = new URLSearchParams(searchParams)
        newSearchParams.delete("q")
        navigate(`${location.pathname}?${newSearchParams.toString()}`)
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const closeMenu = () => setIsMenuOpen(false)

  // ギャラリーのサブページかどうかを判定
  const isGallerySubPage =
    location.pathname.includes("/posts/gallery") &&
    location.pathname !== "/posts/gallery"

  // ギャラリーページ（メインページ含む）かどうかを判定
  const isGalleryPage = location.pathname.includes("/posts/gallery")

  return (
    <div className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* 左側: ロゴ、ギャラリートップボタン、メニュー */}
          <div className="flex items-center gap-4">
            {/* ロゴ（常に表示） */}
            <Link to="/" className="flex items-center gap-2">
              <img
                src="/icon.svg"
                alt="Aipictors"
                className="size-8 rounded-full"
                width={32}
                height={32}
              />
              <span className="hidden font-bold text-xl sm:inline">
                Aipictors
              </span>
            </Link>

            {/* ギャラリートップに戻るボタン（ギャラリーサブページで表示、スマホではギャラリーページ全体で表示） */}
            {(isGallerySubPage || (isGalleryPage && isMobile)) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/posts/gallery")}
                className="flex items-center gap-2"
                title={t("ギャラリートップに戻る", "Back to gallery")}
              >
                <Grid3X3 className="size-4" />
                <span className="hidden sm:inline">
                  {t("ギャラリー", "Gallery")}
                </span>
              </Button>
            )}

            {/* メニューボタン（ギャラリーページ以外で表示） */}
            {!isGalleryPage && (
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <MenuIcon className="size-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent className="p-0" side="left">
                  <ScrollArea className="h-full p-4">
                    <Suspense fallback={null}>
                      <HomeMenuRouteList onClickMenuItem={closeMenu} />
                    </Suspense>
                  </ScrollArea>
                </SheetContent>
              </Sheet>
            )}
          </div>

          {/* 中央: 検索バー（デスクトップのみ） */}
          <div className="mx-8 hidden max-w-md flex-1 md:block">
            <div className="relative">
              <Input
                type="text"
                placeholder={t("作品を検索...", "Search artworks...")}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pr-10"
              />
              <Button
                onClick={handleSearch}
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 transform"
              >
                <Search className="size-4" />
              </Button>
            </div>
          </div>

          {/* 右側: ツールバーと検索ボタン */}
          <div className="flex items-center gap-2">
            {/* 検索ボタン（モバイル用） */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="md:hidden"
            >
              {isSearchOpen ? (
                <X className="size-5" />
              ) : (
                <Search className="size-5" />
              )}
            </Button>
          </div>
        </div>

        {/* モバイル検索バー */}
        {isSearchOpen && (
          <div className="mt-4 md:hidden">
            <div className="relative">
              <Input
                type="text"
                placeholder={t("作品を検索...", "Search artworks...")}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pr-10"
                autoFocus
              />
              <Button
                onClick={handleSearch}
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 transform"
              >
                <Search className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
