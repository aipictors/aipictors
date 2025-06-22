import { AppHeader } from "~/components/app/app-header"
import { AppLoadingPage } from "~/components/app/app-loading-page"
import { Button } from "~/components/ui/button"
import { ScrollArea } from "~/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet"
import { AuthContext } from "~/contexts/auth-context"
import { HomeRouteList } from "~/routes/($lang)._main._index/components/home-route-list"
import {
  useNavigation,
  useLocation,
  useNavigate,
  useSearchParams,
} from "@remix-run/react"
import { Loader2Icon, MenuIcon, MoveLeft, Plus, Search } from "lucide-react"
import { Suspense, useContext, useState, useEffect, useRef } from "react"
import { useBoolean } from "usehooks-ts"
import { graphql } from "gql.tada"
import { useQuery } from "@apollo/client/index"
import { useTranslation } from "~/hooks/use-translation"
import { LoginDialogButton } from "~/components/login-dialog-button"
import { LogoutDialogLegacy } from "~/components/logout-dialog-legacy"
import { Input } from "~/components/ui/input"
import { Separator } from "~/components/ui/separator"
import { HomeHeaderNotLoggedInMenu } from "~/routes/($lang)._main._index/components/home-header-not-logged-in-menu"
import { HomeNotificationsMenu } from "~/routes/($lang)._main._index/components/home-notifications-menu"
import { HomeUserNavigationMenu } from "~/routes/($lang)._main._index/components/home-user-navigation-menu"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { cn } from "~/lib/utils"

type Props = {
  title?: string
  onToggleSideMenu?: () => void
  alwaysShowTitle?: boolean
}

function HomeHeader(props: Props) {
  const navigation = useNavigation()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const authContext = useContext(AuthContext)
  const [searchText, setSearchText] = useState("")
  const timeoutRef = useRef<NodeJS.Timeout>()
  const previousLocationRef = useRef(location.pathname)
  const isNavigatingRef = useRef(false)
  const isManualNavigationRef = useRef(false) // 手動ナビゲーションフラグを追加

  const sensitivePath = /\/r($|\/)/.test(location.pathname)
  const getSensitiveLink = (path: string) => {
    // パスが "/r" から始まる場合は空文字を返す
    if (/^\/r($|\s)/.test(path)) {
      return ""
    }
    // 現在のパスが sensitive なら "/r" を付与
    if (sensitivePath) {
      return `/r${path}`
    }
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

  // 検索テキスト変更時のリアルタイム検索（デバウンス付き）
  const performSearch = (text: string) => {
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
    navigate(getSensitiveLink(baseUrl), { replace: true })
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
    navigate(getSensitiveLink(baseUrl))
  }

  const title = sensitivePath ? "Aipictors R18" : (props.title ?? "Aipictors")

  const isExistedNewNotificationData = useQuery(
    viewerIsExistedNewNotificationQuery,
    {},
  )
  const isExistedNewNotification =
    isExistedNewNotificationData.data?.viewer?.isExistedNewNotification

  const [isSearchFormOpen, setIsSearchFormOpen] = useState(false)
  const [isExistedNewNotificationState, setIsExistedNewNotificationState] =
    useState(isExistedNewNotification ?? false)

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      onSearch()
    }
  }
  const onToggleSearchForm = () => setIsSearchFormOpen((prev) => !prev)
  const onChangeSearchText = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newText = event.target.value
    setSearchText(newText)

    // 既存のタイマーをクリア
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // 検索関連ページにいる場合のみリアルタイム検索を実行
    const currentPath = location.pathname
    const isSearchRelatedPage =
      currentPath === "/search" ||
      currentPath === "/r/search" ||
      currentPath.startsWith("/tags/") ||
      currentPath.startsWith("/r/tags/")

    // リアルタイム検索の条件：
    // 1. 検索関連ページにいる
    // 2. ナビゲーション中ではない
    // 3. マニュアルナビゲーション中ではない
    // 4. テキストが空ではない
    if (
      isSearchRelatedPage &&
      !isNavigatingRef.current &&
      !isManualNavigationRef.current &&
      newText.trim() !== ""
    ) {
      // 300ms後に検索実行（デバウンス）
      timeoutRef.current = setTimeout(() => {
        performSearch(newText)
      }, 300)
    }
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

  const isAnnouncementPath =
    location.pathname === "/" || location.pathname === "/generation"
  const { data: announcementData } = useQuery(emergencyAnnouncementsQuery, {})

  // ヘルパー関数：外部リンクの場合は新規タブで開く
  const navigateToExternal = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer")
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

  return (
    <Suspense fallback={<AppLoadingPage />}>
      <AppHeader
        isSmallLeftPadding={props.alwaysShowTitle}
        announcement={
          isAnnouncementPath &&
          announcementData?.emergencyAnnouncements &&
          announcementData.emergencyAnnouncements.content.length > 0 &&
          (announcementData.emergencyAnnouncements.url.length > 0 ? (
            <Button
              variant="ghost"
              className="fixed z-50 m-auto block w-full max-w-none items-center justify-between gap-x-4 border-border/40 bg-background/80 px-2 py-1 text-center font-semibold text-sm backdrop-blur-sm supports-backdrop-filter:bg-background/80 md:px-2"
              onClick={() =>
                announcementData.emergencyAnnouncements.url.startsWith("http")
                  ? navigateToExternal(
                      announcementData.emergencyAnnouncements.url,
                    )
                  : handleNavigate(announcementData.emergencyAnnouncements.url)
              }
            >
              <div className="opacity-80">
                {announcementData.emergencyAnnouncements.content}
              </div>
            </Button>
          ) : (
            <div className="fixed z-50 m-auto block w-full max-w-none items-center justify-between gap-x-4 border-border/40 bg-background/80 px-2 py-1 text-center font-semibold text-sm backdrop-blur-sm supports-backdrop-filter:bg-background/80 md:px-2">
              <div className="opacity-80">
                {announcementData.emergencyAnnouncements.content}
              </div>
            </div>
          ))
        }
      >
        <div
          className={cn(
            "flex min-w-fit items-center gap-x-2",
            props.alwaysShowTitle ? "" : "md:hidden",
          )}
        >
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <MenuIcon />
              </Button>
            </SheetTrigger>
            <SheetContent className="p-0" side="left">
              <ScrollArea className="h-full p-4">
                <HomeRouteList onClickMenuItem={close} />
              </ScrollArea>
            </SheetContent>
          </Sheet>
          <div className="flex items-center">
            {props.alwaysShowTitle ? (
              <Button
                variant="ghost"
                className="hidden items-center space-x-2 md:flex"
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
                    className="size-8 rounded-full"
                    alt="Avatar"
                    width={40}
                    height={40}
                  />
                )}
                <div className="flex grow flex-row items-center">
                  <span className="font-bold text-xl">{title}</span>
                </div>
              </Button>
            ) : (
              <Button
                variant="ghost"
                className="hidden items-center space-x-2 md:flex"
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
                    className="size-8 rounded-full"
                    alt="Avatar"
                    width={40}
                    height={40}
                  />
                )}
                <div className="hidden grow flex-row items-center md:flex">
                  <span className="font-bold text-xl">{title}</span>
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
            <div className="flex w-full justify-start space-x-2 font-semibold">
              <div className="relative flex w-full flex-1 shrink-0 flex-col rounded-xl border border-light-100 bg-light-input shadow-[0px_7px_21px_0px_rgba(51,_51,_51,_0.05)] dark:border-dark-750 dark:bg-dark-input dark:shadow-[0px_7px_21px_0px_rgba(0,_0,_0,_0.25)]">
                <Input
                  value={searchText}
                  onChange={onChangeSearchText}
                  onKeyDown={handleKeyDown}
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
                onKeyDown={handleKeyDown}
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
          {authContext.isNotLoggedIn && <HomeHeaderNotLoggedInMenu />}
          {!isSearchFormOpen && authContext.isLoggedIn && (
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
          )}
          {isSearchFormOpen && authContext.isLoggedIn && (
            <div className="hidden md:block">
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
            </div>
          )}
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
          <Suspense>
            {authContext.isLoggedIn && (
              <HomeUserNavigationMenu onLogout={onOpenLogoutDialog} />
            )}
          </Suspense>
          {authContext.isNotLoggedIn && <LoginDialogButton />}
          <LogoutDialogLegacy
            isOpen={isOpenLogoutDialog}
            onClose={onCloseLogoutDialog}
            onOpen={onOpenLogoutDialog}
          />
        </div>
      </AppHeader>
    </Suspense>
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

const emergencyAnnouncementsQuery = graphql(`
  query emergencyAnnouncements {
    emergencyAnnouncements {
      url
      content
    }
  }
`)

export default HomeHeader
