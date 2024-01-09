"use client"

import { AppContext } from "@/app/_contexts/app-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Config } from "@/config"
import { Gem, LogIn, LogOut, Settings, UserCircle, UserCog } from "lucide-react"
import Link from "next/link"
import { useContext } from "react"

type Props = {
  onLogin(): void
  onLogout(): void
}

/**
 * ヘッダーの右上のメニュー
 * @param props
 * @returns
 */
export const HomeUserNavigationMenu = (props: Props) => {
  const appContext = useContext(AppContext)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="rounded-full flex" size={"icon"}>
          <Avatar>
            <AvatarImage src={appContext.avatarPhotoURL ?? undefined} />
            <AvatarFallback />
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {appContext.isLoggedIn && (
          <DropdownMenuItem>
            <a
              href={`https://www.aipictors.com/users/?id=${appContext.userId}`}
            >
              <UserCircle className="w-4 inline-block mr-2" />
              <span>{"マイページ"}</span>
            </a>
          </DropdownMenuItem>
        )}
        {appContext.isLoggedIn && (
          <Link href={"/plus"}>
            <DropdownMenuItem>
              <Gem className="w-4 inline-block mr-2" />
              <span>{"Aipictors+"}</span>
            </DropdownMenuItem>
          </Link>
        )}
        {appContext.isLoggedIn && (
          <Link href={"/account/login"}>
            <DropdownMenuItem>
              <UserCog className="w-4 inline-block mr-2" />
              <span>{"アカウント"}</span>
            </DropdownMenuItem>
          </Link>
        )}
        {Config.isDevelopmentMode && appContext.isLoggedIn && (
          <Link href={"/settings/notification"}>
            <DropdownMenuItem>
              <Settings className="w-4 inline-block mr-2" />
              <span>{"設定"}</span>
            </DropdownMenuItem>
          </Link>
        )}
        {appContext.isLoggedIn && (
          <DropdownMenuItem onClick={props.onLogout}>
            <LogOut className="w-4 inline-block mr-2" />
            <span>{"ログアウト"}</span>
          </DropdownMenuItem>
        )}
        {appContext.isNotLoggedIn && (
          <DropdownMenuItem onClick={props.onLogin}>
            <LogIn className="w-4 inline-block mr-2" />
            <span>{"ログイン"}</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
