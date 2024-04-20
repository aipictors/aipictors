"use client"

import { AppHeader } from "@/_components/app/app-header"
import { LoginDialogButton } from "@/_components/login-dialog-button"
import { LogoutDialogLegacy } from "@/_components/logout-dialog-legacy"
import { Button } from "@/_components/ui/button"
import { Input } from "@/_components/ui/input"
import { ScrollArea } from "@/_components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/_components/ui/sheet"
import { AuthContext } from "@/_contexts/auth-context"
import { config } from "@/config"
import { HomeNotificationsMenu } from "@/routes/($lang)._main._index/_components/home-notifications-menu"
import { HomeRouteList } from "@/routes/($lang)._main._index/_components/home-route-list"
import { HomeUserNavigationMenu } from "@/routes/($lang)._main._index/_components/home-user-navigation-menu"
import { Link, useNavigation } from "@remix-run/react"
import { Loader2Icon, MenuIcon } from "lucide-react"
import { useContext } from "react"
import { useBoolean } from "usehooks-ts"

type Props = {
  title?: string
}

export const HomeHeader = (props: Props) => {
  const navigation = useNavigation()

  const authContext = useContext(AuthContext)

  const {
    value: isOpenLogoutDialog,
    setTrue: onOpenLogoutDialog,
    setFalse: onCloseLogoutDialog,
  } = useBoolean()

  return (
    <AppHeader>
      <div className="flex min-w-fit items-center md:flex-1">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              className="mr-2 md:hidden"
              variant={"secondary"}
              size={"icon"}
            >
              <MenuIcon />
            </Button>
          </SheetTrigger>
          <SheetContent className="p-0" side={"left"}>
            <ScrollArea className="h-full p-4">
              <HomeRouteList />
            </ScrollArea>
          </SheetContent>
        </Sheet>
        <Link
          className="hidden items-center md:flex"
          to="https://www.aipictors.com"
        >
          {navigation.state === "loading" && (
            <div className="flex h-10 w-10 items-center justify-center">
              <Loader2Icon className={"h-10 w-10 animate-spin"} />
            </div>
          )}
          {navigation.state !== "loading" && (
            <img
              src="/icon.svg"
              className="h-10 w-10 rounded-full"
              alt="Avatar"
              width={40}
              height={40}
            />
          )}
        </Link>
        <div className="hidden flex-grow flex-row items-center pl-4 md:flex">
          <span className="font-bold">{props.title ?? "Beta"}</span>
        </div>
      </div>
      <div className="flex gap-x-2">
        {config.isDevelopmentMode && (
          <div className="hidden w-full flex-1 md:block">
            <Input placeholder={"作品を検索"} />
          </div>
        )}
        <Link to={"/generation"}>
          <Button variant={"secondary"}>{"生成"}</Button>
        </Link>
        <Link to={"https://aipictors.com/post"}>
          <Button variant={"secondary"}>{"投稿"}</Button>
        </Link>
        {/* {config.isReleaseMode ? (
          <Button variant={"secondary"} disabled size={"icon"}>
            <FolderIcon className="w-4" />
          </Button>
        ) : (
          <Link href={"/viewer/albums"}>
            <Button variant={"secondary"} size={"icon"}>
              <FolderIcon className="w-4" />
            </Button>
          </Link>
        )} */}
        {authContext.isLoggedIn && config.isDevelopmentMode && (
          <HomeNotificationsMenu />
        )}
        {authContext.isLoggedIn && (
          <HomeUserNavigationMenu onLogout={onOpenLogoutDialog} />
        )}
        {authContext.isNotLoggedIn && <LoginDialogButton />}
        <LogoutDialogLegacy
          isOpen={isOpenLogoutDialog}
          onClose={onCloseLogoutDialog}
          onOpen={onOpenLogoutDialog}
        />
      </div>
    </AppHeader>
  )
}
