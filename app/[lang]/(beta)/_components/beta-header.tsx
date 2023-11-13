"use client"

import { BetaNavigationList } from "@/app/[lang]/(beta)/_components/beta-navigation-list"
import { BetaUserNavigationButton } from "@/app/[lang]/(main)/_components/beta-user-navigation-button"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

import { Bell, Menu } from "lucide-react"
import Link from "next/link"

type Props = {
  title?: string
}

export const BetaHeader = (props: Props) => {
  return (
    <div className="flex p-4 space-x-4 sticky top-0 bg-white dark:bg-gray-800 z-100">
      <Sheet>
        <SheetTrigger asChild>
          <Menu />
        </SheetTrigger>
        <SheetContent side={"left"}>
          <SheetHeader>
            <SheetTitle>{"Edit profile"}</SheetTitle>
            <SheetDescription>
              <BetaNavigationList />
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
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
        <BetaUserNavigationButton />
      </div>
    </div>
  )
}
