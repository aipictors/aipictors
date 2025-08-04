import { AppHeader } from "~/components/app/app-header"
import { Button } from "~/components/ui/button"
import { ScrollArea } from "~/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet"
import { AuthContext } from "~/contexts/auth-context"
import {
  useNavigation,
  useLocation,
  useNavigate,
  useSearchParams,
} from "@remix-run/react"
import { Loader2Icon, MenuIcon, MoveLeft, Plus, Search } from "lucide-react"
import { Suspense, useContext, useState, useEffect, useRef, lazy } from "react"
import { useBoolean } from "usehooks-ts"
import { graphql } from "gql.tada"
import { useQuery } from "@apollo/client/index"
import { useTranslation } from "~/hooks/use-translation"
import { isSensitiveKeyword } from "~/utils/is-sensitive-keyword"
import { LoginDialogButton } from "~/components/login-dialog-button"
import { LogoutDialogLegacy } from "~/components/logout-dialog-legacy"
import { Input } from "~/components/ui/input"
import { Separator } from "~/components/ui/separator"
import { HomeHeaderNotLoggedInMenu } from "~/routes/($lang)._main._index/components/home-header-not-logged-in-menu"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { cn } from "~/lib/utils"
import { useSidebar } from "~/contexts/sidebar-context"
import { debugLog } from "~/utils/debug-logger"

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
  const timeoutRef = useRef<NodeJS.Timeout>()
  const previousLocationRef = useRef(location.pathname)
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
    // '#' を除去
    const sanitizedText = trimmedText.replace(/#/g, "")
    // 禁止文字チェック
    const invalidChars = ["%", "/", "¥"]
    const hasInvalidChar = invalidChars.some((char) =>
      sanitizedText.includes(char),
    )
    if (sanitizedText === "") {
      navigate(getSensitiveLink("/search"))
      return
    }
    if (hasInvalidChar) {
      toast("入力された検索文字列には使用できない文字が含まれています。")
      return
    }
    const encodedText = encodeURIComponent(sanitizedText)
    const baseUrl = `/tags/${encodedText}`
    navigate(getSensitiveLink(baseUrl, isSensitiveTag(sanitizedText)), {
      replace: true,
    })
  }

  const title = sensitivePath ? "Aipictors R18" : (props.title ?? "Aipictors")

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

  const onSubmitSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
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

  return (
    <AppHeader isSmallLeftPadding={props.alwaysShowTitle}>
      <div
        className={cn(
          "flex min-w-fit items-center gap-x-2",
          props.alwaysShowTitle ? "" : "lg:hidden",
        )}
      >
        {/* Mobile menu - show on mobile, and on PC only if showPcSheetMenu is true */}
        <div className="hidden w-8 md:block" />

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={
                props.showPcSheetMenu
                  ? "block" // PC版でも表示
                  : "md:hidden" // PC版では非表示
              }
            >
              <MenuIcon />
            </Button>
          </SheetTrigger>
          <SheetContent className="p-0" side="left">
            <ScrollArea className="h-full p-4">
              <Suspense fallback={null}>
                <HomeMenuRouteList onClickMenuItem={close} />
              </Suspense>
            </ScrollArea>
          </SheetContent>
        </Sheet>
        <div className="flex items-center">
          {/* 画像生成画面ではロゴを表示、その他の画面では余白のみ表示 */}
          {isSpecialPage && (
            <Button
              variant="ghost"
              className="hidden shrink-0 items-center space-x-2 pl-4 md:flex"
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
              {sidebarState === "minimal" && (
                <div className="flex items-center">
                  <span className="whitespace-nowrap font-bold text-xl">
                    {title}
                  </span>
                </div>
              )}
            </Button>
          )}
          {sidebarState !== "minimal" && <div className="mr-16" />}

          {/* サイドバーが最小化されている場合のみロゴを表示 */}
          {!isSpecialPage && sidebarState === "minimal" && (
            <Button
              variant="ghost"
              className="hidden shrink-0 items-center space-x-2 pl-28 md:flex"
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
        {!isSearchFormOpen && (
          <Button
            className="block md:hidden"
            onClick={onToggleSearchForm}
            variant="ghost"
            size="icon"
          >
            <Search className="m-auto w-auto" />
          </Button>
        )}
      </div>
      <div className="flex w-full justify-end gap-x-2">
        <div className="hidden w-full items-center space-x-2 md:flex">
          <div
            className={`flex w-full justify-start space-x-2 font-semibold ${
              !isSpecialPage
                ? sidebarState === "expanded"
                  ? "pl-[248px]" // サイドバー幅216px + 余白32px
                  : sidebarState === "collapsed"
                    ? "pl-[96px]" // サイドバー幅64px + 余白32px
                    : sidebarState === "minimal"
                      ? "pl-16" // 三角ボタン分の余白
                      : "pl-[248px]"
                : ""
            }`}
          >
            <div className="relative flex w-full flex-1 shrink-0 flex-col rounded-xl border border-border bg-input shadow-[0px_7px_21px_0px_rgba(51,_51,_51,_0.05)] dark:shadow-[0px_7px_21px_0px_rgba(0,_0,_0,_0.25)]">
              <Input
                value={searchText}
                onChange={onChangeSearchText}
                onKeyDown={onSubmitSearch}
                placeholder={t("作品を検索", "Search for posts")}
              />
              <div className="absolute right-4">
                <Button onClick={onSearch} variant="ghost" size="icon">
                  <Search className="w-16" />
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
            <Input
              value={searchText}
              onChange={onChangeSearchText}
              onKeyUp={onSubmitSearch}
              placeholder={t("作品を検索", "Search for posts")}
            />
          </div>
        ) : (
          <>
            <div className="hidden space-x-2 md:flex">
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
        {authContext.isLoading ? (
          // ログイン判定中のダミーUI（モバイル最適化済み）
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
          </div>
        ) : authContext.isLoggedIn ? (
          // ログイン時のUI（Suspenseでスムーズなローディング）
          <div className="flex items-center gap-2">
            <Suspense fallback={<div className="h-10 w-10 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />}>
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
            <Suspense fallback={<div className="h-10 w-10 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />}>
              <FastUserNavigationMenu onLogout={onOpenLogoutDialog} />
            </Suspense>
          </div>
        ) : (
          // 未ログイン時のUI
          <div className="flex items-center gap-2">
            <HomeHeaderNotLoggedInMenu />
            <LoginDialogButton />
          </div>
        )}
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
