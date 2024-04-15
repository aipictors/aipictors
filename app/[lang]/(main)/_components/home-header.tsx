"use client"

import { HomeNotificationsMenu } from "@/[lang]/(main)/_components/home-notifications-menu"
import { HomeRouteList } from "@/[lang]/(main)/_components/home-route-list"
import { HomeUserNavigationMenu } from "@/[lang]/(main)/_components/home-user-navigation-menu"
import { LoginDialogButton } from "@/[lang]/_components/login-dialog-button"
import { LogoutDialogLegacy } from "@/[lang]/_components/logout-dialog-legacy"
import { AppHeader } from "@/_components/app/app-header"
import { Button } from "@/_components/ui/button"
import { Input } from "@/_components/ui/input"
import { ScrollArea } from "@/_components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/_components/ui/sheet"
import { AuthContext } from "@/_contexts/auth-context"
import type { LikedWorkNotificationNode } from "@/_graphql/__generated__/graphql"
import { viewerNotificationsQuery } from "@/_graphql/queries/viewer/viewer-notifications"
import { createClient } from "@/_lib/client"
import { config } from "@/config"
import { useQuery } from "@apollo/client"
import { Link } from "@remix-run/react"
import { BellIcon, MenuIcon } from "lucide-react"
import { useContext } from "react"
import { useBoolean } from "usehooks-ts"

type Props = {
  title?: string
}

export const HomeHeader = (props: Props) => {
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
          <img
            src="/icon.svg"
            className="h-10 w-10 rounded-full"
            alt="Avatar"
            width={40}
            height={40}
          />
        </Link>
        <div className="hidden flex-grow flex-row items-center pl-2 md:flex">
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
        {/*authContext.isLoggedIn && config.isDevelopmentMode && (
          <HomeNotificationsMenu />
        )*/}
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
