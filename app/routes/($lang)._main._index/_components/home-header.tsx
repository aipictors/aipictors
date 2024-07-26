import { AppHeader } from "@/_components/app/app-header"
import { AppLoadingPage } from "@/_components/app/app-loading-page"
import { LoginDialogButton } from "@/_components/login-dialog-button"
import { LogoutDialogLegacy } from "@/_components/logout-dialog-legacy"
import { Button } from "@/_components/ui/button"
import { Input } from "@/_components/ui/input"
import { ScrollArea } from "@/_components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/_components/ui/sheet"
import { AuthContext } from "@/_contexts/auth-context"
import { config } from "@/config"
import HomeHeaderNotLoggedInMenu from "@/routes/($lang)._main._index/_components/home-header-not-logged-in-menu"
import { HomeNotificationsMenu } from "@/routes/($lang)._main._index/_components/home-notifications-menu"
import { HomeRouteList } from "@/routes/($lang)._main._index/_components/home-route-list"
import { HomeUserNavigationMenu } from "@/routes/($lang)._main._index/_components/home-user-navigation-menu"
import { Link, useNavigation } from "@remix-run/react"
import { Loader2Icon, MenuIcon } from "lucide-react"
import { Suspense, useContext } from "react"
import { useBoolean } from "usehooks-ts"

type Props = {
  title?: string
  onToggleSideMenu?: () => void
}

const HomeHeader = (props: Props) => {
  const navigation = useNavigation()

  const authContext = useContext(AuthContext)

  const {
    value: isOpenLogoutDialog,
    setTrue: onOpenLogoutDialog,
    setFalse: onCloseLogoutDialog,
  } = useBoolean()

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
          <Sheet>
            <SheetTrigger asChild>
              <Button className="md:hidden" variant={"ghost"} size={"icon"}>
                <MenuIcon />
              </Button>
            </SheetTrigger>
            <SheetContent className="p-0" side={"left"}>
              <ScrollArea className="h-full p-4">
                <HomeRouteList />
              </ScrollArea>
            </SheetContent>
          </Sheet>
          <div className="flex items-center space-x-2">
            <Link
              className="items-center md:flex"
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
            </Link>
            <div className="hidden flex-grow flex-row items-center md:flex">
              <span className="font-bold text-xl">
                {props.title ?? "Aipictors β"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-x-2">
          {config.isDevelopmentMode && (
            <div className="hidden w-full flex-1 md:block">
              <Input placeholder={"作品を検索"} />
            </div>
          )}
          {authContext.isLoggedIn && (
            <>
              <Link
                className="hidden md:block"
                to={"https://www.aipictors.com/"}
              >
                <Button variant={"secondary"}>{"旧版"}</Button>
              </Link>
              <Link to={"/generation"}>
                <Button variant={"secondary"}>{"生成"}</Button>
              </Link>
              <Link to={"/new/image"}>
                <Button variant={"secondary"}>{"投稿"}</Button>
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
