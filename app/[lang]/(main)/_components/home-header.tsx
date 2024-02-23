"use client"

import { HomeNavigationList } from "@/app/[lang]/(main)/_components/home-navigation-list"
import { HomeUserNavigationMenu } from "@/app/[lang]/(main)/_components/home-user-navigation-menu"
import { LoginButton } from "@/app/[lang]/_components/login-dialog-button"
import { LogoutDialogLegacy } from "@/app/[lang]/_components/logout-dialog-legacy"
import { AuthContext } from "@/app/_contexts/auth-context"
import { AppHeader } from "@/components/app/app-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { config } from "@/config"
import { BellIcon, FolderIcon, MenuIcon, SearchIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useContext, useEffect } from "react"
import { toast } from "sonner"
import { useBoolean } from "usehooks-ts"

export const HomeHeader = () => {
  const authContext = useContext(AuthContext)

  const {
    value: isOpenLogoutDialog,
    setTrue: onOpenLogoutDialog,
    setFalse: onCloseLogoutDialog,
  } = useBoolean()

  useEffect(() => {
    toast("こちらは開発中のページです。", {
      description: "予期せぬ不具合が発生する可能性があります。",
    })
  })

  return (
    <AppHeader>
      <div className="flex md:flex-1 gap-x-4 items-center min-w-fit">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              className="md:hidden mr-2"
              variant={"secondary"}
              size={"icon"}
            >
              <MenuIcon />
            </Button>
          </SheetTrigger>
          <SheetContent className="p-0" side={"left"}>
            <ScrollArea className="h-full p-4">
              <HomeNavigationList />
            </ScrollArea>
          </SheetContent>
        </Sheet>
        <Link className="flex items-center" href="https://www.aipictors.com">
          <Image
            src="/icon.svg"
            className="w-10 h-10 rounded-full"
            alt="Avatar"
            width={40}
            height={40}
          />
        </Link>
        <div className="flex-1 w-full hidden md:block">
          <Input placeholder={"作品を検索"} />
        </div>
      </div>
      <div className="flex gap-x-4 items-center">
        <div className="flex gap-x-2">
          <Button
            className="md:hidden"
            variant={"secondary"}
            size={"icon"}
            aria-label={"Search"}
          >
            <SearchIcon className="w-4" />
          </Button>
          {config.isReleaseMode ? (
            <Button variant={"secondary"} disabled>
              {"生成"}
            </Button>
          ) : (
            <Link href={"/generation"}>
              <Button variant={"secondary"}>{"生成"}</Button>
            </Link>
          )}
          {config.isReleaseMode ? (
            <Button variant={"secondary"} disabled>
              {"投稿"}
            </Button>
          ) : (
            <Link href={"/new/image"}>
              <Button variant={"secondary"}>{"投稿"}</Button>
            </Link>
          )}
          {config.isReleaseMode ? (
            <Button variant={"secondary"} disabled size={"icon"}>
              <FolderIcon className="w-4" />
            </Button>
          ) : (
            <Link href={"/viewer/albums"}>
              <Button variant={"secondary"} size={"icon"}>
                <FolderIcon className="w-4" />
              </Button>
            </Link>
          )}
          {config.isDevelopmentMode && (
            <Button
              variant={"secondary"}
              disabled
              size={"icon"}
              aria-label={"通知"}
            >
              <BellIcon className="w-4" />
            </Button>
          )}
        </div>
        {authContext.isLoggedIn && (
          <HomeUserNavigationMenu onLogout={onOpenLogoutDialog} />
        )}
        {authContext.isNotLoggedIn && <LoginButton />}
      </div>
      <LogoutDialogLegacy
        isOpen={isOpenLogoutDialog}
        onClose={onCloseLogoutDialog}
        onOpen={onOpenLogoutDialog}
      />
    </AppHeader>
  )
}
