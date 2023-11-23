"use client"

import { BetaNavigationList } from "@/app/[lang]/(beta)/_components/beta-navigation-list"
import { HomeUserNavigationMenu } from "@/app/[lang]/(main)/_components/home-user-navigation-menu"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

import { Bell, Menu } from "lucide-react"
import Link from "next/link"

type Props = {
  title?: string
  onLogin(): void
  onLogout(): void
}

export const BetaHeader = (props: Props) => {
  return (
    <header className="sticky top-0 z-50">
      <Card className="flex py-4 pl-2 md:pl-4 pr-4 md:pr-8 space-x-4 border-none rounded-none shadow-none justify-between">
        <div className="flex md:flex-1 space-x-2 items-center min-w-fit">
          <Sheet>
            <SheetTrigger asChild>
              <Button className="md:hidden" variant={"ghost"} size={"icon"}>
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side={"left"}>
              <BetaNavigationList
                onLogin={props.onLogin}
                onLogout={props.onLogout}
              />
            </SheetContent>
          </Sheet>
          <div className="flex items-center">
            <Link href="/plus">
              <img
                src="/icon.png"
                className="w-8 h-8 rounded-full"
                alt="Avatar"
              />
            </Link>
          </div>
          <div className="flex flex-row flex-grow items-center pl-2">
            <span className="font-bold">{props.title ?? "Beta"}</span>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={"ghost"}
            disabled
            className="rounded-full p-2 text-lg"
            aria-label="通知"
          >
            <Bell />
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
