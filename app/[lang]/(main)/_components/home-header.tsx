"use client"

import { BetaNavigationList } from "@/app/[lang]/(beta)/_components/beta-navigation-list"
import { HomeUserNavigationMenu } from "@/app/[lang]/(main)/_components/home-user-navigation-menu"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useToast } from "@/components/ui/use-toast"
import { Config } from "@/config"
import { Bell, Folder, Menu, Search } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"

type Props = {
  onLogin(): void
  onLogout(): void
}

export const HomeHeader = (props: Props) => {
  const { toast } = useToast()

  useEffect(() => {
    toast({
      description:
        "こちらは開発中のページです。何らかの不具合が発生する可能性があります。",
      duration: 60 * 4 * 1000,
    })
  }, [])

  return (
    <header className="sticky top-0 z-50">
      <Card className="flex justify-between pl-2 pr-4 md:px-6 py-4 space-x-4 border-none rounded-none shadow-none">
        <div className="flex md:flex-1 space-x-2 items-center min-w-fit">
          <Sheet>
            <SheetTrigger asChild>
              <Button className="md:hidden" variant={"ghost"} size={"icon"}>
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side={"left"}>
              <SheetHeader>
                <SheetTitle>{"ベータ"}</SheetTitle>
                <SheetDescription>
                  <BetaNavigationList
                    onLogin={props.onLogin}
                    onLogout={props.onLogout}
                  />
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
          <Link href="https://www.aipictors.com">
            <img
              src="/icon.png"
              className="w-8 h-8 rounded-full"
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
        <div className="flex space-x-2">
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
      </Card>
    </header>
  )
}
