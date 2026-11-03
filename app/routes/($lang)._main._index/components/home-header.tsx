import { useQuery } from "@apollo/client/index"
import { EMPTY_UNREAD_COUNTS } from "~/routes/($lang)._main._index/components/home-notifications-panel-utils"
import {
  Link,
  useLocation,
  useNavigate,
  useNavigation,
  useSearchParams,
} from "@remix-run/react"
import { graphql } from "gql.tada"
import {
  ImagePlusIcon,
  Loader2Icon,
  MenuIcon,
  MoveLeft,
  Search,
  WandSparklesIcon,
  X,
} from "lucide-react"
import { lazy, Suspense, useContext, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { useBoolean } from "usehooks-ts"
import { AppHeader } from "~/components/app/app-header"
import { LoginDialogButton } from "~/components/login-dialog-button"
import { LogoutDialogLegacy } from "~/components/logout-dialog-legacy"
import { SearchRateLimitDialog } from "~/components/search/search-rate-limit-dialog"
import { SensitiveKeywordWarning } from "~/components/search/sensitive-keyword-warning"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { ScrollArea } from "~/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet"
import { AuthContext } from "~/contexts/auth-context"
import { useContentMode } from "~/hooks/use-content-mode"
import { useSearchRateLimit } from "~/hooks/use-search-rate-limit"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { HomeHeaderContentToggle } from "~/routes/($lang)._main._index/components/home-header-content-toggle"
import { HomeHeaderNotLoggedInMenu } from "~/routes/($lang)._main._index/components/home-header-not-logged-in-menu"
import { debugLog } from "~/utils/debug-logger"
import { isSensitiveKeyword } from "~/utils/is-sensitive-keyword"
import {
  buildSearchPath,
  getSearchTermFromPathname,
  isSearchPathname,
} from "~/utils/search-route"
import {
  analyzeSensitiveSearch,
  generateSensitiveUrl,
} from "~/utils/sensitive-keyword-helpers"

const HomeMenuRouteList = lazy(() =>
  import("~/routes/($lang)._main._index/components/home-menu-route-list").then(
    (module) => ({
      default: module.HomeMenuRouteList,
    }),
  ),
)

// ログイン時だけ表示するメニューは、表示するときに読み込む
import {
  HomeHeaderAuthPlaceholder,
  HomeHeaderAvatarPlaceholder,
} from "~/routes/($lang)._main._index/components/home-header-auth-placeholder"

const HomeNotificationsMenu = lazy(() =>
  import(
    "~/routes/($lang)._main._index/components/home-notifications-menu"
  ).then((module) => ({
    default: module.HomeNotificationsMenu,
  })),
)

const FastUserNavigationMenu = lazy(() =>
  import(
    "~/routes/($lang)._main._index/components/fast-user-navigation-menu"
  ).then((module) => ({
    default: module.FastUserNavigationMenu,
  })),
)

type Props = {
  title?: string
  onToggleSideMenu?: () => void
  alwaysShowTitle?: boolean
  showPcSheetMenu?: boolean // PC版でもシートメニューを表示するかどうか
  /** PC版のロゴはサイドバー側に固定で出す（ヘッダーのロゴは場所だけ取る） */
  hasSidebarBrand?: boolean
}

function HomeHeader(props: Props) {
  const navigation = useNavigation()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const authContext = useContext(AuthContext)
  const [searchText, setSearchText] = useState("")
  const [showSensitiveWarning, setShowSensitiveWarning] = useState(false)
  const [pendingSearchData, setPendingSearchData] = useState<{
    sanitizedText: string
    targetUrl: string
  } | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()
  const previousLocationRef = useRef("/")
  const isNavigatingRef = useRef(false)
  const isManualNavigationRef = useRef(false) // 手動ナビゲーションフラグを追加
  const sensitivePath = /\/r($|\/)/.test(location.pathname)
  const isR18Mode = useContentMode() === "r18"
  const {
    isRateLimitDialogOpen,
    executeSearchWithRateLimit,
    closeSearchRateLimitDialog,
  } = useSearchRateLimit()
  const getSensitiveLink = (path: string, forceSensitive = false) => {
    // すでに /r 付与済みならそのまま返す
    if (path.startsWith("/r/") || path === "/r") return path
    // 現在のページが R18 か、もしくは引数で強制する場合
    if (sensitivePath || forceSensitive) return `/r${path}`
    return path
  }
  // ページ遷移の検出
  useEffect(() => {
    const currentPath = location.pathname
    const previousPath = previousLocationRef.current

    // ページが変更された場合
    if (currentPath !== previousPath) {
      // フラグをリセット
      isNavigatingRef.current = false
      isManualNavigationRef.current = false
      previousLocationRef.current = currentPath
    }
  }, [location.pathname])

  // 初期化時とURL変更時に検索テキストを設定
  useEffect(() => {
    const currentPath = location.pathname

    // 手動ナビゲーション中の場合は検索テキストの更新をスキップ
    if (isManualNavigationRef.current) {
      return
    }

    if (isSearchPathname(currentPath)) {
      const pathSearchTerm = getSearchTermFromPathname(currentPath)
      const query =
        searchParams.get("tag") ?? searchParams.get("q") ?? pathSearchTerm ?? ""
      setSearchText(query)
    } else {
      // その他のページの場合は検索テキストをクリア
      setSearchText("")
    }
  }, [location.pathname, searchParams])

  const isSensitiveTag = (tag: string): boolean => {
    return isSensitiveKeyword(tag)
  }

  // 検索テキスト変更時のリアルタイム検索（デバウンス付き）
  const _performSearch = (text: string) => {
    // ナビゲーション中またはマニュアルナビゲーション中は検索を実行しない
    if (isNavigatingRef.current || isManualNavigationRef.current) {
      return
    }

    const trimmedText = text.trim()

    // 空文字の場合は何もしない
    if (trimmedText === "") {
      return
    }

    const sanitizedText = trimmedText.replace(/#/g, "")

    // 禁止文字チェック
    const invalidChars = ["%", "/", "¥"]
    const hasInvalidChar = invalidChars.some((char) =>
      sanitizedText.includes(char),
    )

    if (hasInvalidChar) {
      return // 禁止文字が含まれている場合は何もしない
    }

    // タグ検索ページへ遷移
    const baseUrl = buildSearchPath(sanitizedText)
    navigate(getSensitiveLink(baseUrl, isSensitiveTag(sanitizedText)), {
      replace: true,
    })
  }

  const onSearch = () => {
    const trimmedText = searchText.trim()

    if (trimmedText === "") {
      navigate(getSensitiveLink("/search", isR18Mode))
      return
    }

    // Analyze if this is a sensitive search
    const { isSensitive, shouldShowWarning, sanitizedText } =
      analyzeSensitiveSearch(trimmedText)

    // 禁止文字チェック
    const invalidChars = ["%", "/", "¥"]
    const hasInvalidChar = invalidChars.some((char) =>
      sanitizedText.includes(char),
    )

    if (hasInvalidChar) {
      toast("入力された検索文字列には使用できない文字が含まれています。")
      return
    }

    const baseUrl = buildSearchPath(sanitizedText)
    // R18 に切り替えている間は、ヘッダーの検索も R18 で探す
    const targetUrl = generateSensitiveUrl(
      baseUrl,
      isSensitive || isR18Mode,
    )

    if (shouldShowWarning && !isR18Mode) {
      // Show warning dialog
      setPendingSearchData({ sanitizedText, targetUrl })
      setShowSensitiveWarning(true)
    } else {
      // Navigate directly
      executeSearchWithRateLimit(() => {
        navigate(targetUrl, { replace: true })
      })
    }
  }

  const handleSensitiveConfirm = () => {
    if (pendingSearchData) {
      executeSearchWithRateLimit(() => {
        navigate(pendingSearchData.targetUrl, { replace: true })
      })
    }
    setShowSensitiveWarning(false)
    setPendingSearchData(null)
  }

  const handleSensitiveCancel = () => {
    setShowSensitiveWarning(false)
    setPendingSearchData(null)
  }

  // 全年齢か R18 かはヘッダーの切り替えで分かるので、タイトルは変えない
  const title = props.title ?? "Aipictors"

  const isGenerationPage = location.pathname.includes("/generation")

  // 画像生成画面など、特別なページではサイドバーのマージンを適用しない
  const isSpecialPage =
    location.pathname.includes("/generation") ||
    location.pathname.includes("/new/") ||
    props.alwaysShowTitle

  // サイドバーがないページ（画像生成）は、ヘッダーに三本線とロゴを出す
  const hasOwnBrand = isSpecialPage && props.hasSidebarBrand !== true

  const unreadNotificationData = useQuery(viewerUnreadNotificationCountsQuery, {
    skip: !authContext.isLoggedIn || authContext.isLoading, // ログイン確定かつloading終了している場合のみ実行
    errorPolicy: "all",
    fetchPolicy: "cache-and-network", // キャッシュがあれば使い、バックグラウンドで更新
  })
  const unreadNotificationCounts =
    unreadNotificationData.data?.viewer?.unreadNotificationCounts ??
    EMPTY_UNREAD_COUNTS

  const [isSearchFormOpen, setIsSearchFormOpen] = useState(false)

  // 開きっぱなしのタブに戻ってきたら、未読の数を取り直す
  useEffect(() => {
    if (!authContext.isLoggedIn || authContext.isLoading) return
    let lastFetchedAt = Date.now()
    const onVisibilityChange = () => {
      if (document.visibilityState !== "visible") return
      if (Date.now() - lastFetchedAt < 60 * 1000) return
      lastFetchedAt = Date.now()
      void unreadNotificationData.refetch().catch(() => {})
    }
    document.addEventListener("visibilitychange", onVisibilityChange)
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange)
    }
  }, [
    authContext.isLoggedIn,
    authContext.isLoading,
    unreadNotificationData.refetch,
  ])

  const _handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      onSearch()
    }
  }
  const onToggleSearchForm = () => setIsSearchFormOpen((prev) => !prev)
  const onChangeSearchText = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newText = event.target.value
    setSearchText(newText)

    // debounce 処理でパフォーマンス最適化
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // 500ms 後に実行予約（現在は手動検索のみなので実際の処理は不要）
    timeoutRef.current = setTimeout(() => {
      // 自動検索をしたい場合は、ここに処理を追加
    }, 500)
  }

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const {
    value: isOpenLogoutDialog,
    setTrue: onOpenLogoutDialog,
    setFalse: onCloseLogoutDialog,
  } = useBoolean()

  const [isOpen, setIsOpen] = useState(false)
  const close = () => {
    // マニュアルナビゲーション中フラグを設定
    isManualNavigationRef.current = true
    setIsOpen(false)
  }
  const t = useTranslation()

  const _onSubmitSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault() // Enterキーでのフォーム送信を防ぐ
      onSearch()
    }
  }

  // ナビゲーション関数を修正
  const handleNavigate = (path: string) => {
    // タイマーをクリア
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // マニュアルナビゲーション中フラグを設定
    isManualNavigationRef.current = true

    // 検索テキストをクリア（検索関連ページ以外への遷移時）
    const isSearchRelatedPath = isSearchPathname(path)
    if (!isSearchRelatedPath) {
      setSearchText("")
    }

    navigate(getSensitiveLink(path))
  }

  // モバイル端末でのログイン状態デバッグ用ログ
  const isMobile =
    typeof navigator !== "undefined" &&
    /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    )

  debugLog.mobile("HomeHeader render:", {
    isMobile,
    viewport:
      typeof window !== "undefined"
        ? { width: window.innerWidth, height: window.innerHeight }
        : "SSR",
    authState: {
      isLoggedIn: authContext.isLoggedIn,
      isNotLoggedIn: authContext.isNotLoggedIn,
      isLoading: authContext.isLoading,
      userId: authContext.userId,
      hasDisplayName: !!authContext.displayName,
      hasAvatarURL: !!authContext.avatarPhotoURL,
    },
    timestamp: new Date().toISOString(),
  })

  // コンポーネント内
  const composingRef = useRef(false)

  const onCompStart = () => {
    composingRef.current = true
  }
  const onCompEnd = () => {
    composingRef.current = false
  }

  const onEnterKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 変換中は無視（isComposing or keyCode 229 で保険）
    // Safari/Android 向けに ref と nativeEvent の両方で判定
    if (
      composingRef.current ||
      e.nativeEvent.isComposing ||
      e.nativeEvent.keyCode === 229
    )
      return

    if (e.key === "Enter") {
      e.preventDefault()
      onSearch()
    }
  }

  return (
    <AppHeader isSmallLeftPadding={isSpecialPage} isBrandAligned={hasOwnBrand}>
      <div
        className={cn(
          "flex min-w-0 items-center gap-x-0.5",
          hasOwnBrand ? "md:gap-x-1" : "md:gap-x-2",
          props.alwaysShowTitle ? "" : "lg:hidden",
        )}
      >
        {/* Mobile menu - show on mobile, and on PC only if showPcSheetMenu is true */}
        <div className="hidden w-8 md:hidden" />

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("メニュー", "Menu")}
              className={
                props.showPcSheetMenu
                  ? "size-9 rounded-lg hover:bg-muted md:size-10" // PC版でも表示（Buttonのinline-flexを潰さない）
                  : "size-9 md:hidden" // PC版では非表示
              }
            >
              <MenuIcon className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            className={cn(
              "w-[216px] max-w-[216px] overflow-x-hidden p-0",
              isGenerationPage ? "" : "",
            )}
            side="left"
          >
            <ScrollArea className="h-full overflow-x-hidden p-4">
              <Suspense fallback={null}>
                <HomeMenuRouteList onClickMenuItem={close} />
              </Suspense>
            </ScrollArea>
          </SheetContent>
        </Sheet>

        {/* Mobile search toggle (avoid overlap by placing near menu) */}
        {!isSearchFormOpen && (
          <Button
            className="size-9 md:hidden"
            onClick={onToggleSearchForm}
            variant="ghost"
            size="icon"
            aria-label={t("検索", "Search")}
          >
            <Search className="m-auto w-auto" />
          </Button>
        )}
        {/* 画像生成画面のロゴ。サイドバーのロゴ（home-route-list）と同じ大きさ・同じ位置にする */}
        {hasOwnBrand && (
          <Link
            to={getSensitiveLink("/")}
            onClick={() => setSearchText("")}
            className="hidden h-10 shrink-0 items-center gap-2 rounded-lg px-2 transition-colors hover:bg-muted md:flex"
          >
            {navigation.state === "loading" ? (
              <Loader2Icon className="size-8 animate-spin" />
            ) : (
              <img
                src="/icon.svg"
                className="size-8 rounded-full"
                alt=""
                width={40}
                height={40}
              />
            )}
            {/* 長いタイトルなので、幅が狭いと検索欄が右のボタンに重なる */}
            <span className="hidden whitespace-nowrap font-bold text-xl lg:inline">
              {title}
            </span>
          </Link>
        )}
        <div
          className={cn(
            "hidden items-center md:ml-12",
            !hasOwnBrand && "md:flex",
          )}
        >
          {/* サイドバーのロゴがあるページでは、同じ幅の余白だけ取る */}
          {isSpecialPage && (
            <Button
              variant="ghost"
              className={cn(
                "hidden shrink-0 items-center space-x-2 pl-4 md:flex",
                props.hasSidebarBrand && "md:invisible",
              )}
              onClick={() => handleNavigate("/")}
            >
              {navigation.state === "loading" ? (
                <div className="flex size-8 items-center justify-center">
                  <Loader2Icon className="size-8 animate-spin" />
                </div>
              ) : (
                <img
                  src="/icon.svg"
                  className="size-8 shrink-0 rounded-full"
                  alt=""
                  width={40}
                  height={40}
                />
              )}
              <div className="flex items-center">
                <span className="whitespace-nowrap font-bold text-xl">
                  {title}
                </span>
              </div>
            </Button>
          )}
        </div>
      </div>
      <div className="flex min-w-0 flex-1 items-center justify-end gap-1 md:gap-2">
        {/* 検索バーは YouTube のように空いている幅の真ん中に置く */}
        <div className="hidden min-w-0 flex-1 items-center justify-center px-2 md:flex lg:px-6">
          <div className="flex w-full min-w-0 max-w-[640px] items-center">
            <div className="relative flex w-full min-w-0 flex-col">
              <Search className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3.5 size-4 text-muted-foreground" />
              <Input
                value={searchText}
                onChange={onChangeSearchText}
                onKeyDown={onEnterKey}
                onCompositionStart={onCompStart}
                onCompositionEnd={onCompEnd}
                placeholder={t(
                  "キーワード・タグで作品を検索",
                  "Search works by keyword or tag",
                )}
                aria-label={t("作品を検索", "Search works")}
                className="h-10 rounded-full border-transparent bg-muted pr-10 pl-10 shadow-none transition-colors focus-visible:border-border focus-visible:bg-background"
              />
              <div className="-translate-y-1/2 absolute top-1/2 right-1 flex items-center gap-1">
                {searchText && (
                  <Button
                    onClick={() => setSearchText("")}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    aria-label={t("検索をクリア", "Clear search")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
        {isSearchFormOpen ? (
          <div className="flex w-full space-x-2 md:hidden">
            <Button
              className="block md:hidden"
              onClick={onToggleSearchForm}
              variant="ghost"
              size="icon"
              aria-label={t("検索を閉じる", "Close search")}
            >
              <MoveLeft className="w-8" />
            </Button>
            <div className="relative flex-1">
              <Input
                value={searchText}
                onChange={onChangeSearchText}
                onKeyDown={onEnterKey}
                onCompositionStart={onCompStart}
                onCompositionEnd={onCompEnd}
                placeholder={t("キーワード・タグで検索", "Search")}
                aria-label={t("作品を検索", "Search works")}
                className="h-10 w-full rounded-full border-transparent bg-muted pr-10 pl-4 shadow-none"
              />
              <div className="-translate-y-1/2 absolute top-1/2 right-1 flex items-center gap-1">
                {searchText && (
                  <Button
                    onClick={() => setSearchText("")}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    aria-label={t("検索をクリア", "Clear search")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* 生成と投稿は分けて並べる（「作成」の中にまとめると投稿の入口が見つけにくかった） */}
            <div className="hidden shrink-0 items-center gap-2 md:flex">
              <HomeHeaderContentToggle />
              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  className="h-9 gap-1.5 rounded-full px-3.5 text-muted-foreground hover:text-foreground"
                  onClick={() => handleNavigate("/generation")}
                >
                  <WandSparklesIcon className="size-4" />
                  {t("生成", "Generate")}
                </Button>
                <Button
                  // 未ログインのときはログインボタンを主役にする
                  variant={authContext.isLoggedIn ? "default" : "secondary"}
                  className="h-9 gap-1.5 rounded-full px-4 shadow-sm"
                  onClick={() => handleNavigate("/new/image")}
                >
                  <ImagePlusIcon className="size-4" />
                  {t("投稿", "Post")}
                </Button>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1 md:hidden">
              <HomeHeaderContentToggle />
              {/* スマホは幅が足りないので、生成・投稿をアイコンで並べる */}
              <div className="flex items-center rounded-full bg-muted p-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-full hover:bg-background"
                  aria-label={t("画像を生成", "Generate")}
                  title={t("画像を生成", "Generate")}
                  onClick={() => handleNavigate("/generation")}
                >
                  <WandSparklesIcon className="size-4" />
                </Button>
                <Button
                  size="icon"
                  className="size-8 rounded-full"
                  aria-label={t("作品を投稿", "Post a work")}
                  title={t("作品を投稿", "Post a work")}
                  onClick={() => handleNavigate("/new/image")}
                >
                  <ImagePlusIcon className="size-4" />
                </Button>
              </div>
            </div>
          </>
        )}
        {isSearchFormOpen && (
          <div className="hidden space-x-2 md:flex">
            <Button
              variant="ghost"
              onClick={() => handleNavigate("/generation")}
            >
              {t("生成", "Generate")}
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleNavigate("/new/image")}
            >
              {t("投稿", "Post")}
            </Button>
          </div>
        )}
        {/* お知らせアイコンとプロフィールアイコン */}
        {!isSearchFormOpen &&
          (authContext.isLoading ? (
            // ログイン判定中。閲覧ページは hydration を操作まで待つので、サーバーの HTML ではこの状態が長く続く。
            // 前回のアイコンやログインボタンを描画前に出して、待っている感じをなくす
            <HomeHeaderAuthPlaceholder />
          ) : authContext.isLoggedIn ? (
            // ログイン時のUI（Suspenseでスムーズなローディング）
            <div className="flex shrink-0 items-center gap-1.5">
              <Suspense
                fallback={
                  <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
                }
              >
                <HomeNotificationsMenu
                  unreadCounts={unreadNotificationCounts}
                  onMarkedAsRead={() => {
                    void unreadNotificationData.refetch().catch(() => {})
                  }}
                />
              </Suspense>
              <Suspense fallback={<HomeHeaderAvatarPlaceholder />}>
                <FastUserNavigationMenu onLogout={onOpenLogoutDialog} />
              </Suspense>
            </div>
          ) : (
            // 未ログイン時のUI
            <div className="flex items-center gap-0.5 md:ml-1 md:gap-1">
              <HomeHeaderNotLoggedInMenu />
              <LoginDialogButton className="h-9 px-3 md:h-10 md:px-4" />
            </div>
          ))}

        {/* 検索フォーム時の検索ボタン（スマホのみ） */}
        {isSearchFormOpen && (
          <Button
            className="md:hidden"
            onClick={onSearch}
            variant="ghost"
            size="icon"
            aria-label={t("検索", "Search")}
          >
            <Search className="w-16" />
          </Button>
        )}
        <LogoutDialogLegacy
          isOpen={isOpenLogoutDialog}
          onClose={onCloseLogoutDialog}
          onOpen={onOpenLogoutDialog}
        />

        {/* Sensitive keyword warning dialog */}
        <SensitiveKeywordWarning
          isOpen={showSensitiveWarning}
          onConfirm={handleSensitiveConfirm}
          onCancel={handleSensitiveCancel}
          keyword={pendingSearchData?.sanitizedText || ""}
          targetUrl={pendingSearchData?.targetUrl || ""}
        />

        <SearchRateLimitDialog
          isOpen={isRateLimitDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              closeSearchRateLimitDialog()
            }
          }}
        />
      </div>
    </AppHeader>
  )
}

const viewerUnreadNotificationCountsQuery = graphql(
  `query ViewerUnreadNotificationCounts {
    viewer {
      id
      unreadNotificationCounts {
        liked
        comment
        reply
        follow
        award
        message
        moderation
      }
    }
  }`,
)

export default HomeHeader
