"use client"

import { HomeNavigationList } from "@/app/[lang]/(main)/_components/home-navigation-list"
import { HomeUserNavigationMenu } from "@/app/[lang]/(main)/_components/home-user-navigation-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useToast } from "@/components/ui/use-toast"
import { Config } from "@/config"
import { Bell, Folder, Menu, Search } from "lucide-react"
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
    <>
      <header className="fixed z-50 w-full bg-card ">
        <div className="flex py-4 pl-2 md:pl-8 pr-4 md:pr-8 space-x-4 border-none rounded-none shadow-none justify-between">
          <div className="flex md:flex-1 min-w-fit items-center">
            <Sheet>
              <SheetTrigger asChild>
                <Button className="md:hidden" variant={"ghost"} size={"icon"}>
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side={"left"}>
                <HomeNavigationList
                  onLogin={props.onLogin}
                  onLogout={props.onLogout}
                />
              </SheetContent>
            </Sheet>
            <Link
              className="flex items-center"
              href="https://www.aipictors.com"
            >
              <img
                src="/icon.png"
                className="w-10 h-10 rounded-full"
                alt="Avatar"
              />
            </Link>
            <div className="pl-4 flex-1 w-full hidden md:block">
              <Input placeholder={"作品を検索"} />
            </div>
            <Button
              className="md:hidden"
              variant={"ghost"}
              size={"icon"}
              aria-label={"Search"}
            >
              <Search className="w-6" />
            </Button>
          </div>
          <div className="flex space-x-2 items-center">
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
                <Folder className="w-6" />
              </Button>
            ) : (
              <Link href={"/viewer/albums"}>
                <Button variant={"secondary"} size={"icon"}>
                  <Folder className="w-6" />
                </Button>
              </Link>
            )}
            <Button
              variant={"secondary"}
              disabled
              size={"icon"}
              aria-label={"通知"}
            >
              <Bell className="w-6" />
            </Button>
            <HomeUserNavigationMenu
              onLogin={props.onLogin}
              onLogout={props.onLogout}
            />
          </div>
        </div>
      </header>
      <div className={"h-header"} />
    </>
  )
}
