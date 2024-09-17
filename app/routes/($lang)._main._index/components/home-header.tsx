import { AppHeader } from "~/components/app/app-header"
import { AppLoadingPage } from "~/components/app/app-loading-page"
import { LoginDialogButton } from "~/components/login-dialog-button"
import { LogoutDialogLegacy } from "~/components/logout-dialog-legacy"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { ScrollArea } from "~/components/ui/scroll-area"
import { Separator } from "~/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet"
import { AuthContext } from "~/contexts/auth-context"
import HomeHeaderNotLoggedInMenu from "~/routes/($lang)._main._index/components/home-header-not-logged-in-menu"
import { HomeNotificationsMenu } from "~/routes/($lang)._main._index/components/home-notifications-menu"
import { HomeRouteList } from "~/routes/($lang)._main._index/components/home-route-list"
import { HomeUserNavigationMenu } from "~/routes/($lang)._main._index/components/home-user-navigation-menu"
import { Link, useNavigation, useLocation, useNavigate } from "@remix-run/react"
import { Loader2Icon, MenuIcon, Search } from "lucide-react"
import { Suspense, useContext, useState } from "react"
import { useBoolean } from "usehooks-ts"
import { graphql } from "gql.tada"
import { useQuery } from "@apollo/client/index"

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

  const sensitivePath = location.pathname.includes("/porn")

  const getSensitiveLink = (path: string) => {
    if (sensitivePath) {
      return `/porn${path}`
    }
    return path
  }

  const onSearch = () => {
    const trimmedText = searchText.trim()
    if (trimmedText !== "") {
      const baseUrl = `/tags/${trimmedText}`
      navigate(getSensitiveLink(baseUrl))
    } else {
      navigate(getSensitiveLink("/search"))
    }
  }

  const title = sensitivePath ? "Aipictors R18" : (props.title ?? "Aipictors β")

  // 新着のお知らせがあるかどうか
  const isExistedNewNotification = useQuery(
    viewerIsExistedNewNotificationQuery,
    {},
  )

  const [isSearchFormOpen, setIsSearchFormOpen] = useState(false)

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

  return (
    <Suspense fallback={<AppLoadingPage />}>
      <AppHeader>
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
            <Link className="items-center space-x-2 md:flex" to="/">
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
        </div>
        <div className="flex w-full justify-end gap-x-2">
          <div className="hidden w-full items-center space-x-2 md:flex">
            <div className="flex w-full justify-start space-x-2 font-semibold">
              <Link to={getSensitiveLink("/themes")}>
                <Button variant={"ghost"}>{"お題"}</Button>
              </Link>
              <Link to={getSensitiveLink("/rankings")}>
                <Button variant={"ghost"}>{"ランキング"}</Button>
              </Link>
              <Link to={getSensitiveLink("/?tab=follow-user")}>
                <Button variant={"ghost"}>{"フォロー新着"}</Button>
              </Link>
              <div className="w-full flex-1">
                <Input
                  onChange={onChangeSearchText}
                  onKeyDown={handleKeyDown}
                  placeholder={"作品を検索"}
                />
              </div>
            </div>
            <Button onClick={onSearch} variant={"ghost"} size={"icon"}>
              <Search className="w-16" />
            </Button>
            <Separator orientation="vertical" />
          </div>
          <Link className="hidden md:block" to={"https://www.aipictors.com/"}>
            <Button variant={"ghost"}>{"旧版トップ"}</Button>
          </Link>
          {authContext.isLoggedIn && (
            <>
              {/* 投稿と生成のリンクには /porn を付けない */}
              <Link to={"/generation"}>
                <Button variant={"ghost"}>{"生成"}</Button>
              </Link>
              <Link to={"/new/image"}>
                <Button variant={"ghost"}>{"投稿"}</Button>
              </Link>
            </>
          )}
          {authContext.isNotLoggedIn && <HomeHeaderNotLoggedInMenu />}
          {authContext.isLoggedIn && <HomeNotificationsMenu />}
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

const viewerIsExistedNewNotificationQuery = graphql(
  `query ViewerIsExistedNewNotification {
    viewer {
      id
      isExistedNewNotification
    }
  }`,
)

export default HomeHeader
