"use client"

import { HomeNavigationList } from "@/app/[lang]/(main)/_components/home-navigation-list"
import { HomeUserNavigationMenu } from "@/app/[lang]/(main)/_components/home-user-navigation-menu"
import { AppHeader } from "@/components/app/app-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Config } from "@/config"
import { BellIcon, FolderIcon, MenuIcon, SearchIcon } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"
import { toast } from "sonner"

type Props = {
  onLogin(): void
  onLogout(): void
}

export const HomeHeader = (props: Props) => {
  useEffect(() => {
    toast("こちらは開発中のページです。", {
      description: "予期せぬ不具合が発生する可能性があります。",
    })
  })

  return (
    <AppHeader>
      <div className="flex md:flex-1 gap-x-2 items-center min-w-fit">
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
              <HomeNavigationList
                onLogin={props.onLogin}
                onLogout={props.onLogout}
              />
            </ScrollArea>
          </SheetContent>
        </Sheet>
        <Link className="flex items-center" href="https://www.aipictors.com">
          <img
            src="/icon.png"
            className="w-10 h-10 rounded-full"
            alt="Avatar"
          />
        </Link>
        <div className="pl-4 flex-1 w-full hidden md:block">
          <Input placeholder={"作品を検索"} />
        </div>
      </div>
      <div className="flex space-x-4 items-center">
        <div className="flex space-x-2">
          <Button
            className="md:hidden"
            variant={"secondary"}
            size={"icon"}
            aria-label={"Search"}
          >
            <SearchIcon className="w-4" />
          </Button>
          {Config.isReleaseMode ? (
            <Button variant={"secondary"} disabled>
              {"生成"}
            </Button>
          ) : (
            <Link href={"/generation"}>
              <Button variant={"secondary"}>{"生成"}</Button>
            </Link>
          )}
          {Config.isReleaseMode ? (
            <Button variant={"secondary"} disabled>
              {"投稿"}
            </Button>
          ) : (
            <Link href={"/new/image"}>
              <Button variant={"secondary"}>{"投稿"}</Button>
            </Link>
          )}
          {Config.isReleaseMode ? (
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
          {Config.isDevelopmentMode && (
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
        <HomeUserNavigationMenu
          onLogin={props.onLogin}
          onLogout={props.onLogout}
        />
      </div>
    </AppHeader>
  )
}
