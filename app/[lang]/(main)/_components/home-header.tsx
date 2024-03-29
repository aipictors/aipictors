"use client"

import { HomeRouteList } from "@/app/[lang]/(main)/_components/home-route-list"
import { HomeUserNavigationMenu } from "@/app/[lang]/(main)/_components/home-user-navigation-menu"
import { LoginDialogButton } from "@/app/[lang]/_components/login-dialog-button"
import { LogoutDialogLegacy } from "@/app/[lang]/_components/logout-dialog-legacy"
import { AuthContext } from "@/app/_contexts/auth-context"
import { AppHeader } from "@/components/app/app-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { config } from "@/config"
import { BellIcon, MenuIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
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
          href="https://www.aipictors.com"
        >
          <Image
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
        <Link href={"/generation"}>
          <Button variant={"secondary"}>{"生成"}</Button>
        </Link>
        <Link href={"https://aipictors.com/post"}>
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
          <Button
            variant={"secondary"}
            disabled
            size={"icon"}
            aria-label={"通知"}
          >
            <BellIcon className="w-4" />
          </Button>
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
