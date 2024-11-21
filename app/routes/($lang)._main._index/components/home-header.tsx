import { AppHeader } from "~/components/app/app-header"
import { AppLoadingPage } from "~/components/app/app-loading-page"
import { Button } from "~/components/ui/button"
import { ScrollArea } from "~/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet"
import { AuthContext } from "~/contexts/auth-context"
import { HomeRouteList } from "~/routes/($lang)._main._index/components/home-route-list"
import { Link, useNavigation, useLocation, useNavigate } from "@remix-run/react"
import { Loader2Icon, MenuIcon, MoveLeft, Search } from "lucide-react"
import { Suspense, useContext, useState } from "react"
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

type Props = {
  title?: string
  onToggleSideMenu?: () => void
}

function HomeHeader(props: Props) {
  const navigation = useNavigation()
  const location = useLocation()
  const navigate = useNavigate()

  const authContext = useContext(AuthContext)

  const [searchText, setSearchText] = useState("")

  const sensitivePath = /\/r($|\/)/.test(location.pathname)

  const getSensitiveLink = (path: string) => {
    // Determine if the path starts with /r
    if (/^\/r($|\s)/.test(path)) {
      return "" // Return empty string for invalid paths
    }

    if (sensitivePath) {
      return `/r${path}`
    }

    return path
  }

  const onSearch = () => {
    const trimmedText = searchText.trim()

    // '#' を取り除いた新しい文字列
    const sanitizedText = trimmedText.replace(/#/g, "")

    // 他の禁止文字をチェック
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

  const title = sensitivePath ? "Aipictors R18" : (props.title ?? "Aipictors β")

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

  const onToggleSearchForm = () => {
    setIsSearchFormOpen((prev) => !prev)
  }

  const onChangeSearchText = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value)
  }

  const {
    value: isOpenLogoutDialog,
    setTrue: onOpenLogoutDialog,
    setFalse: onCloseLogoutDialog,
  } = useBoolean()

  const [isOpen, setIsOpen] = useState(false)

  const close = () => {
    setIsOpen(false)
  }

  const t = useTranslation()

  const isAnnouncementPath =
    location.pathname === "/" || location.pathname === "/generation"

  const { data: announcementData } = useQuery(emergencyAnnouncementsQuery, {})

  return (
    <Suspense fallback={<AppLoadingPage />}>
      <AppHeader
        announcement={
          isAnnouncementPath &&
          announcementData?.emergencyAnnouncements &&
          announcementData.emergencyAnnouncements.content.length > 0 &&
          (announcementData.emergencyAnnouncements.url.length > 0 ? (
            <Link
              to={announcementData.emergencyAnnouncements.url}
              className="fixed z-50 m-auto block w-full max-w-none items-center justify-between gap-x-4 border-border/40 bg-background/80 px-2 py-1 text-center font-semibold text-sm backdrop-blur supports-[backdrop-filter]:bg-background/80 md:px-2"
            >
              <div className="opacity-80">
                {announcementData.emergencyAnnouncements.content}
              </div>
            </Link>
          ) : (
            <div className="fixed z-50 m-auto block w-full max-w-none items-center justify-between gap-x-4 border-border/40 bg-background/80 px-2 py-1 text-center font-semibold text-sm backdrop-blur supports-[backdrop-filter]:bg-background/80 md:px-2">
              <div className="opacity-80">
                {announcementData.emergencyAnnouncements.content}
              </div>
            </div>
          ))
        }
      >
        <div className="flex min-w-fit items-center gap-x-2 md:flex">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant={"ghost"} size={"icon"}>
                <MenuIcon />
              </Button>
            </SheetTrigger>
            <SheetContent className="p-0" side={"left"}>
              <ScrollArea className="h-full p-4">
                <HomeRouteList onClickMenuItem={close} />
              </ScrollArea>
            </SheetContent>
          </Sheet>
          <div className="flex items-center">
            <Link
              className="hidden items-center space-x-2 md:flex"
              to={getSensitiveLink("/")}
            >
              {navigation.state === "loading" && (
                <div className="flex h-8 w-8 items-center justify-center">
                  <Loader2Icon className={"h-8 w-8 animate-spin"} />
                </div>
              )}
              {navigation.state !== "loading" && (
                <img
                  src="/icon.svg"
                  className="h-8 w-8 rounded-full"
                  alt="Avatar"
                  width={40}
                  height={40}
                />
              )}
              <div className="hidden flex-grow flex-row items-center md:flex">
                <span className="font-bold text-xl">{title}</span>
              </div>
            </Link>
          </div>
          {!isSearchFormOpen && (
            <Button
              className="block md:hidden"
              onClick={onToggleSearchForm}
              variant={"ghost"}
              size={"icon"}
            >
              <Search className="m-auto w-auto" />
            </Button>
          )}
        </div>
        <div className="flex w-full justify-end gap-x-2">
          <div className="hidden w-full items-center space-x-2 md:flex">
            <div className="flex w-full justify-start space-x-2 font-semibold">
              <Link to={getSensitiveLink("/themes")}>
                <Button variant={"ghost"}>{t("お題", "Theme")}</Button>
              </Link>
              <Link
                className="hidden lg:block"
                to={getSensitiveLink("/rankings")}
              >
                <Button variant={"ghost"}>{t("ランキング", "Ranking")}</Button>
              </Link>
              <Link to={getSensitiveLink("/?tab=follow-user")}>
                <Button variant={"ghost"}>
                  {t("フォロー新着", "Followed new posts")}
                </Button>
              </Link>

              <div className="w-full flex-1">
                <Input
                  onChange={onChangeSearchText}
                  onKeyDown={handleKeyDown}
                  placeholder={t("作品を検索", "Search for posts")}
                />
              </div>
            </div>
            <Button onClick={onSearch} variant={"ghost"} size={"icon"}>
              <Search className="w-16" />
            </Button>
            <Separator orientation="vertical" />
          </div>
          {isSearchFormOpen ? (
            <div className="flex w-full space-x-2 md:hidden">
              <Button
                className="block md:hidden"
                onClick={onToggleSearchForm}
                variant={"ghost"}
                size={"icon"}
              >
                <MoveLeft className="w-8" />
              </Button>
              <Input
                onChange={onChangeSearchText}
                onKeyDown={handleKeyDown}
                placeholder={t("作品を検索", "Search for posts")}
              />
            </div>
          ) : (
            <>
              <Link to={"/generation"}>
                <Button variant={"ghost"}>{t("生成", "Generate")}</Button>
              </Link>
              <Link to={"/new/image"}>
                <Button variant={"ghost"}>{t("投稿", "Post")}</Button>
              </Link>
            </>
          )}
          {isSearchFormOpen && (
            <div className="hidden space-x-2 md:flex">
              <Link to={"/generation"}>
                <Button variant={"ghost"}>{t("生成", "Generate")}</Button>
              </Link>
              <Link to={"/new/image"}>
                <Button variant={"ghost"}>{t("投稿", "Post")}</Button>
              </Link>
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
              variant={"ghost"}
              size={"icon"}
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
