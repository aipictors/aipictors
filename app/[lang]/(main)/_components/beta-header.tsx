"use client"

import { BetaNavigationList } from "@/app/[lang]/(main)/_components/beta-navigation-list"
import { HomeUserNavigationMenu } from "@/app/[lang]/(main)/_components/home-user-navigation-menu"
import { LoginDialogButton } from "@/app/[lang]/_components/login-dialog-button"
import { LogoutDialogLegacy } from "@/app/[lang]/_components/logout-dialog-legacy"
import { AuthContext } from "@/app/_contexts/auth-context"
import { AppHeader } from "@/components/app/app-header"
import { Button } from "@/components/ui/button"
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

export const BetaHeader = (props: Props) => {
  const authContext = useContext(AuthContext)

  const {
    value: isOpenLogoutDialog,
    setTrue: onOpenLogoutDialog,
    setFalse: onCloseLogoutDialog,
  } = useBoolean()

  return (
    <AppHeader>
      <div className="flex min-w-fit items-center gap-x-2 md:flex-1">
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
              <BetaNavigationList />
            </ScrollArea>
          </SheetContent>
        </Sheet>
        <div className="flex items-center">
          <Link href="https://www.aipictors.com">
            <Image
              src="/icon.svg"
              className="h-10 w-10 rounded-full"
              alt="Avatar"
              width={40}
              height={40}
            />
          </Link>
        </div>
        <div className="flex flex-grow flex-row items-center pl-2">
          <span className="font-bold">{props.title ?? "Beta"}</span>
        </div>
      </div>
      {authContext.isLoggedIn && (
        <div className="flex gap-x-4">
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
          <HomeUserNavigationMenu onLogout={onOpenLogoutDialog} />
        </div>
      )}
      {authContext.isNotLoggedIn && <LoginDialogButton />}
      <LogoutDialogLegacy
        isOpen={isOpenLogoutDialog}
        onClose={onCloseLogoutDialog}
        onOpen={onOpenLogoutDialog}
      />
    </AppHeader>
  )
}
