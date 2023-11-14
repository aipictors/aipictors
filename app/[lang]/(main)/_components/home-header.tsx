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
import { useBreakpointValue } from "@chakra-ui/react"
import { Bell, Folder, Menu, Search } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"

type Props = {
  onLogin(): void
  onLogout(): void
}

export const HomeHeader = (props: Props) => {
  const { toast } = useToast()

  const hasSheet = useBreakpointValue({
    base: true,
    sm: true,
    md: false,
  })

  useEffect(() => {
    toast({
      description:
        "こちらは開発中のページです。何らかの不具合が発生する可能性があります。",
      duration: 60 * 4 * 1000,
    })
  }, [])

  return (
    <Card className="flex p-4 space-x-4 sticky top-0 z-100 border-none rounded-none shadow-none z-10">
      {hasSheet && (
        <Sheet>
          <SheetTrigger asChild>
            <Button variant={"ghost"} size={"icon"}>
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
      )}
      <div className="flex items-center">
        <Link href="https://www.aipictors.com">
          <img src="/icon.png" className="w-8 h-8 rounded-full" alt="Avatar" />
        </Link>
      </div>
      <div className="w-full hidden md:block">
        <Input placeholder={"作品を検索"} />
      </div>
      <Button className="block md:hidden" size={"icon"} aria-label={"Search"}>
        <Search />
      </Button>
      <div className="flex space-x-2">
        <Link href={"/generation"}>
          <Button disabled={Config.isReleaseMode}>{"生成"}</Button>
        </Link>
        <Link href={"/new/image"}>
          <Button disabled={Config.isReleaseMode}>{"投稿"}</Button>
        </Link>
        <Link href={"/viewer/albums"}>
          <Button
            disabled={Config.isReleaseMode}
            size={"icon"}
            aria-label={"フォルダ"}
          >
            <Folder />
          </Button>
        </Link>
        <Button disabled size={"icon"} aria-label={"通知"}>
          <Bell />
        </Button>
        <HomeUserNavigationMenu
          onLogin={props.onLogin}
          onLogout={props.onLogout}
        />
      </div>
    </Card>
  )
}
