import { useQuery } from "@apollo/client/index"
import {
  useLocation,
  useNavigate,
  useNavigation,
  useSearchParams,
} from "@remix-run/react"
import { graphql } from "gql.tada"
import { Loader2Icon, MenuIcon, MoveLeft, Plus, Search, X } from "lucide-react"
import { lazy, Suspense, useContext, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { useBoolean } from "usehooks-ts"
import { AppHeader } from "~/components/app/app-header"
import { LoginDialogButton } from "~/components/login-dialog-button"
import { LogoutDialogLegacy } from "~/components/logout-dialog-legacy"
import { SensitiveKeywordWarning } from "~/components/search/sensitive-keyword-warning"
import { Button } from "~/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { Input } from "~/components/ui/input"
import { ScrollArea } from "~/components/ui/scroll-area"
import { Separator } from "~/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet"
import { AuthContext } from "~/contexts/auth-context"
import { useSidebar } from "~/contexts/sidebar-context"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { HomeHeaderNotLoggedInMenu } from "~/routes/($lang)._main._index/components/home-header-not-logged-in-menu"
import { HomeHeaderR18Button } from "~/routes/($lang)._main._index/components/home-header-r18-button"
import { debugLog } from "~/utils/debug-logger"
import { isSensitiveKeyword } from "~/utils/is-sensitive-keyword"
import {
  analyzeSensitiveSearch,
  generateSensitiveUrl,
} from "~/utils/sensitive-keyword-helpers"

// 重いコンポーネントを遅延読み込み
const HomeNotificationsMenu = lazy(() =>
  import(
    "~/routes/($lang)._main._index/components/home-notifications-menu"
  ).then((module) => ({
    default: module.HomeNotificationsMenu,
  })),
)
// ファストローディング用のナビゲーションメニュー
const FastUserNavigationMenu = lazy(() =>
  import(
    "~/routes/($lang)._main._index/components/fast-user-navigation-menu"
  ).then((module) => ({
    default: module.FastUserNavigationMenu,
  })),
)
const HomeMenuRouteList = lazy(() =>
  import("~/routes/($lang)._main._index/components/home-menu-route-list").then(
    (module) => ({
      default: module.HomeMenuRouteList,
    }),
  ),
)

type Props = {
  title?: string
  onToggleSideMenu?: () => void
  alwaysShowTitle?: boolean
  showPcSheetMenu?: boolean // PC版でもシートメニューを表示するかどうか
}

function HomeHeader(props: Props) {
  const navigation = useNavigation()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const authContext = useContext(AuthContext)
  const { sidebarState } = useSidebar()
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

    if (
      currentPath.startsWith("/tags/") ||
      currentPath.startsWith("/r/tags/")
    ) {
      // タグページの場合、URLからタグ名を抽出
      const tagMatch = currentPath.match(/\/tags\/([^/]+)/)
      if (tagMatch) {
        const decodedTag = decodeURIComponent(tagMatch[1])
        setSearchText(decodedTag)
      }
    } else if (currentPath === "/search" || currentPath === "/r/search") {
      // 検索ページの場合
      const query = searchParams.get("q") || ""
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
    const encodedText = encodeURIComponent(sanitizedText)
    const baseUrl = `/tags/${encodedText}`
    console.log("Navigating to:", isSensitiveTag(sanitizedText))
    navigate(getSensitiveLink(baseUrl, isSensitiveTag(sanitizedText)), {
      replace: true,
    })
  }

  const onSearch = () => {
    const trimmedText = searchText.trim()

    if (trimmedText === "") {
      navigate(getSensitiveLink("/search"))
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

    const encodedText = encodeURIComponent(sanitizedText)
    const baseUrl = `/tags/${encodedText}`
    const targetUrl = generateSensitiveUrl(baseUrl, isSensitive)

    if (shouldShowWarning) {
      // Show warning dialog
      setPendingSearchData({ sanitizedText, targetUrl })
      setShowSensitiveWarning(true)
    } else {
      // Navigate directly
      navigate(targetUrl, { replace: true })
    }
  }

  const handleSensitiveConfirm = () => {
    if (pendingSearchData) {
      navigate(pendingSearchData.targetUrl, { replace: true })
    }
    setShowSensitiveWarning(false)
    setPendingSearchData(null)
  }

  const handleSensitiveCancel = () => {
    setShowSensitiveWarning(false)
    setPendingSearchData(null)
  }

  const title = sensitivePath ? "Aipictors R18" : (props.title ?? "Aipictors")

  const isGenerationPage = location.pathname.includes("/generation")

  // 画像生成画面など、特別なページではサイドバーのマージンを適用しない
  const isSpecialPage =
    location.pathname.includes("/generation") ||
    location.pathname.includes("/new/") ||
    props.alwaysShowTitle

  const isExistedNewNotificationData = useQuery(
    viewerIsExistedNewNotificationQuery,
    {
      skip: !authContext.isLoggedIn || authContext.isLoading, // ログイン確定かつloading終了している場合のみ実行
      errorPolicy: "all",
      fetchPolicy: "cache-and-network", // キャッシュがあれば使い、バックグラウンドで更新
    },
  )
  const isExistedNewNotification =
    isExistedNewNotificationData.data?.viewer?.isExistedNewNotification

  const [isSearchFormOpen, setIsSearchFormOpen] = useState(false)
  const [isExistedNewNotificationState, setIsExistedNewNotificationState] =
    useState(isExistedNewNotification ?? false)

  // isExistedNewNotification の値が変更された時に状態を同期
  useEffect(() => {
    debugLog.notification("Notification state changed:", {
      isExistedNewNotification,
      queryData: isExistedNewNotificationData.data,
      queryLoading: isExistedNewNotificationData.loading,
      queryError: !!isExistedNewNotificationData.error,
      authContext: {
        isLoggedIn: authContext.isLoggedIn,
        isNotLoggedIn: authContext.isNotLoggedIn,
        isLoading: authContext.isLoading,
        userId: authContext.userId,
        login: authContext.login,
      },
    })
    setIsExistedNewNotificationState(isExistedNewNotification ?? false)
  }, [isExistedNewNotification, isExistedNewNotificationData])

  // ログイン状態が変更された時に通知状態をリセット
  useEffect(() => {
    debugLog.auth("Auth state changed:", {
      isNotLoggedIn: authContext.isNotLoggedIn,
      resetting: authContext.isNotLoggedIn,
    })
    if (authContext.isNotLoggedIn) {
      setIsExistedNewNotificationState(false)
    }
  }, [authContext.isNotLoggedIn])

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
    const isSearchRelatedPath = path === "/search" || path.startsWith("/tags/")
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
    <AppHeader isSmallLeftPadding={isSpecialPage}>
      <div
        className={cn(
          "flex min-w-0 items-center gap-x-2",
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
              className={
                props.showPcSheetMenu
                  ? undefined // PC版でも表示（Buttonのinline-flexを潰さない）
                  : "md:hidden" // PC版では非表示
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
            className="md:hidden"
            onClick={onToggleSearchForm}
            variant="ghost"
            size="icon"
          >
            <Search className="m-auto w-auto" />
          </Button>
        )}
        <div className="hidden items-center md:ml-12 md:flex">
          {/* 画像生成画面ではロゴを表示、その他の画面では余白のみ表示 */}
          {isSpecialPage && (
            <Button
              variant="ghost"
              className="hidden shrink-0 items-center space-x-2 pl-4 md:flex"
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
                  alt="Avatar"
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
          {/* サイドバーが最小化されている場合のみロゴを表示 */}
          {!isSpecialPage && sidebarState === "minimal" && (
            <Button
              variant="ghost"
              className="ml-10 hidden shrink-0 items-center gap-2 px-2 md:flex"
              onClick={() => handleNavigate("/")}
            >
              {navigation.state === "loading" && (
                <div className="flex size-8 items-center justify-center">
                  <Loader2Icon className="size-8 animate-spin" />
                </div>
              )}
              {navigation.state !== "loading" && (
                <img
                  src="/icon.svg"
                  className="size-8 shrink-0 rounded-full"
                  alt="Avatar"
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
      <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
        <div className="hidden w-full items-center space-x-2 md:flex">
          <div className="flex w-full items-center justify-end font-semibold">
            <div className="relative ml-auto flex w-full min-w-0 max-w-[400px] flex-col rounded-xl border border-border bg-input lg:max-w-[540px]">
              <Input
                value={searchText}
                onChange={onChangeSearchText}
                onKeyDown={onEnterKey}
                onCompositionStart={onCompStart}
                onCompositionEnd={onCompEnd}
                placeholder={t("作品を検索", "Search for posts")}
                className="pr-20"
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
                <Button
                  onClick={onSearch}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <Separator orientation="vertical" />
          {/* <R18ModeIndicator /> */}
        </div>
        {isSearchFormOpen ? (
          <div className="flex w-full space-x-2 md:hidden">
            <Button
              className="block md:hidden"
              onClick={onToggleSearchForm}
              variant="ghost"
              size="icon"
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
                placeholder={t("作品を検索", "Search for posts")}
                className="w-full pr-10"
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
            <div className="hidden space-x-2 md:flex">
              {/* R18ボタン - 生成・投稿ボタンと同じエリアに配置 */}
              <HomeHeaderR18Button />
              <Button
                variant="secondary"
                onClick={() => handleNavigate("/generation")}
              >
                {t("生成", "Generate")}
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleNavigate("/new/image")}
              >
                {t("投稿", "Post")}
              </Button>
            </div>
            <div className="flex space-x-2 md:hidden">
              {/* R18ボタン - モバイル版 */}
              <HomeHeaderR18Button />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Plus />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => handleNavigate("/generation")}
                  >
                    {t("生成", "Generate")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleNavigate("/new/image")}
                  >
                    {t("投稿", "Post")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
            // ログイン判定中のダミーUI（モバイル最適化済み）
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
            </div>
          ) : authContext.isLoggedIn ? (
            // ログイン時のUI（Suspenseでスムーズなローディング）
            <div className="flex items-center gap-2">
              <Suspense
                fallback={
                  <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
                }
              >
                <HomeNotificationsMenu
                  isExistedNewNotification={isExistedNewNotificationState}
                  setIsExistedNewNotificationState={
                    setIsExistedNewNotificationState
                  }
                  checkedNotificationTimes={
                    isExistedNewNotificationData.data?.viewer
                      ?.checkedNotificationTimes ?? []
                  }
                />
              </Suspense>
              <Suspense
                fallback={
                  <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
                }
              >
                <FastUserNavigationMenu onLogout={onOpenLogoutDialog} />
              </Suspense>
            </div>
          ) : (
            // 未ログイン時のUI
            <div className="flex items-center gap-2">
              <HomeHeaderNotLoggedInMenu />
              <LoginDialogButton />
            </div>
          ))}

        {/* 検索フォーム時の検索ボタン（スマホのみ） */}
        {isSearchFormOpen && (
          <Button
            className="md:hidden"
            onClick={onSearch}
            variant="ghost"
            size="icon"
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
      </div>
    </AppHeader>
  )
}

export const CheckedNotificationTimesFragment = graphql(
  `fragment CheckedNotificationTimes on CheckedNotificationTimeNode @_unmask {
    type
    checkedTime
  }`,
)

const viewerIsExistedNewNotificationQuery = graphql(
  `query ViewerIsExistedNewNotification {
    viewer {
      id
      isExistedNewNotification
      checkedNotificationTimes {
        ...CheckedNotificationTimes
      }
    }
  }`,
  [CheckedNotificationTimesFragment],
)

export default HomeHeader
