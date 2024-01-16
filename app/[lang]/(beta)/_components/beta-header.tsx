import { BetaNavigationList } from "@/app/[lang]/(beta)/_components/beta-navigation-list"
import { HomeUserNavigationMenu } from "@/app/[lang]/(main)/_components/home-user-navigation-menu"
import { AppHeader } from "@/components/app/app-header"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Config } from "@/config"
import { BellIcon, MenuIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

type Props = {
  title?: string
  onLogin(): void
  onLogout(): void
}

export const BetaHeader = (props: Props) => {
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
              <BetaNavigationList
                onLogin={props.onLogin}
                onLogout={props.onLogout}
              />
            </ScrollArea>
          </SheetContent>
        </Sheet>
        <div className="flex items-center">
          <Link href="/plus">
            <Image
              src="/icon.svg"
              className="w-10 h-10 rounded-full"
              alt="Avatar"
              width={40}
              height={40}
            />
          </Link>
        </div>
        <div className="flex flex-row flex-grow items-center pl-2">
          <span className="font-bold">{props.title ?? "Beta"}</span>
        </div>
      </div>
      <div className="flex gap-x-4">
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
        <HomeUserNavigationMenu
          onLogin={props.onLogin}
          onLogout={props.onLogout}
        />
      </div>
    </AppHeader>
  )
}
