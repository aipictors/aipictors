"use client"

import { BetaNavigationList } from "@/app/[lang]/(beta)/_components/beta-navigation-list"
import { HomeUserNavigationMenu } from "@/app/[lang]/(main)/_components/home-user-navigation-menu"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useBreakpointValue } from "@chakra-ui/react"
import { Bell, Menu } from "lucide-react"
import Link from "next/link"

type Props = {
  title?: string
  onLogin(): void
  onLogout(): void
}

export const BetaHeader = (props: Props) => {
  const hasSheet = useBreakpointValue({
    base: true,
    sm: true,
    md: false,
  })

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
      <div className="flex flex-row flex-grow items-center">
        <span className="font-bold">{props.title ?? "Beta"}</span>
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
  )
}
