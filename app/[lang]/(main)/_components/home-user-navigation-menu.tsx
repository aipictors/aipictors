"use client"

import { AppContext } from "@/app/_contexts/app-context"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  LogIn,
  LogOut,
  Rocket,
  Settings,
  UserCircle,
  UserCog,
} from "lucide-react"
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
      <DropdownMenuTrigger>
        <Avatar>
          <AvatarFallback>{"Y"}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {appContext.isLoggedIn && (
          <DropdownMenuItem>
            <a
              href={`https://www.aipictors.com/users/?id=${appContext.userId}`}
            >
              <UserCircle className="inline-block mr-2" />
              <span>{"マイページ"}</span>
            </a>
          </DropdownMenuItem>
        )}
        {appContext.isLoggedIn && (
          <Link href={"/account"}>
            <DropdownMenuItem>
              <UserCog className="inline-block mr-2" />
              <span>{"アカウント"}</span>
            </DropdownMenuItem>
          </Link>
        )}
        {appContext.isLoggedIn && (
          <Link href={"/settings"}>
            <DropdownMenuItem>
              <Settings className="inline-block mr-2" />
              <span>{"設定"}</span>
            </DropdownMenuItem>
          </Link>
        )}
        {appContext.isLoggedIn && (
          <Link href={"/plus"}>
            <DropdownMenuItem>
              <Rocket className="inline-block mr-2" />
              <span>{"Aipictors+"}</span>
            </DropdownMenuItem>
          </Link>
        )}
        {/* <button
            type="button"
            className="text-gray-700 block w-full text-left px-4 py-2 text-sm"
            role="menuitem"
            id="menu-item-4"
            onClick={toggleColorMode}
          >
            {colorMode === "dark" ? (
              <TbSunFilled className="inline-block mr-2" />
            ) : (
              <TbMoonFilled className="inline-block mr-2" />
            )}
            {colorMode === "dark" ? "ライトモード" : "ダークモード"}
          </button> */}
        {appContext.isLoggedIn && (
          <DropdownMenuItem onClick={props.onLogout}>
            <LogOut className="inline-block mr-2" />
            <span>{"ログアウト"}</span>
          </DropdownMenuItem>
        )}
        {appContext.isNotLoggedIn && (
          <DropdownMenuItem onClick={props.onLogin}>
            <LogIn className="inline-block mr-2" />
            <span>{"ログイン"}</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
