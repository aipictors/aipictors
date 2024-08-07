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
import { Link, useNavigation } from "@remix-run/react"
import { Loader2Icon, MenuIcon, Search } from "lucide-react"
import { Suspense, useContext, useState } from "react"
import { useBoolean } from "usehooks-ts"

type Props = {
  title?: string
  onToggleSideMenu?: () => void
}

const HomeHeader = (props: Props) => {
  const navigation = useNavigation()

  const authContext = useContext(AuthContext)

  const [searchText, setSearchText] = useState("")

  const onSearch = () => {
    window.location.href = `https://www.aipictors.com/search/?word=${searchText}`
  }

  const [isSearchFormOpen, setIsSearchFormOpen] = useState(false)

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
          {props.onToggleSideMenu && (
            <Button
              variant={"ghost"}
              size={"icon"}
              onClick={props.onToggleSideMenu}
              className="hidden md:flex"
            >
              <MenuIcon className="h-6 w-6" />
            </Button>
          )}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button className="md:hidden" variant={"ghost"} size={"icon"}>
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
              className="items-center space-x-2 md:flex"
              to="https://www.aipictors.com"
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
                <span className="font-bold text-xl">
                  {props.title ?? "Aipictors β"}
                </span>
              </div>
            </Link>
          </div>
        </div>
        <div className="flex w-full justify-end gap-x-2">
          <div className="hidden w-full items-center space-x-2 md:flex">
            {isSearchFormOpen && (
              <div className="w-full flex-1">
                <Input
                  onChange={onChangeSearchText}
                  placeholder={"作品を検索"}
                  onKeyPress={onSearch}
                />
              </div>
            )}
            {!isSearchFormOpen && (
              <div className="ml-6 flex w-full justify-start font-semibold md:space-x-6 xl:space-x-12">
                <Link to={"/themes"}>{"お題"}</Link>
                <Link to={"/rankings"} className="hidden lg:block">
                  {"ランキング"}
                </Link>
                <p className="hidden opacity-80 lg:block">{"タイムライン"}</p>
              </div>
            )}
            <Button
              onClick={onToggleSearchForm}
              variant={"ghost"}
              size={"icon"}
            >
              <Search className="w-16" />
            </Button>
            <Separator orientation="vertical" />
          </div>
          {authContext.isLoggedIn && (
            <>
              <Link
                className="hidden md:block"
                to={"https://www.aipictors.com/"}
              >
                <Button variant={"ghost"}>{"旧版"}</Button>
              </Link>
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

export default HomeHeader
