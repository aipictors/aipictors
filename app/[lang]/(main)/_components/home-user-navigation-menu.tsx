"use client"

import { AuthContext } from "@/app/_contexts/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Config } from "@/config"
import {
  GemIcon,
  LogIn,
  LogOutIcon,
  MoonIcon,
  SettingsIcon,
  SunIcon,
  UserCircleIcon,
  UserCogIcon,
} from "lucide-react"
import Link from "next/link"
import { useContext, useEffect, useState } from "react"

type Props = {
  onLogin(): void
  onLogout(): void
}

type MenuItemLinkProps = {
  href: string
  icon: React.ReactNode
  label: string
}

const MenuItemLink = ({ href, icon, label }: MenuItemLinkProps) => (
  <Link href={href}>
    <DropdownMenuItem>
      {icon}
      <span>{label}</span>
    </DropdownMenuItem>
  </Link>
)

export const HomeUserNavigationMenu = (props: Props) => {
  const appContext = useContext(AuthContext)
  const { isLoggedIn } = appContext

  const [theme, setTheme] = useState("system")

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove("light", "dark", "system")
    root.classList.add(theme)
  }, [theme])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar>
          {appContext.avatarPhotoURL ? (
            <AvatarImage src={appContext.avatarPhotoURL} />
          ) : (
            <AvatarFallback />
          )}
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {isLoggedIn ? (
          <>
            <MenuItemLink
              href={`https://www.aipictors.com/users/?id=${appContext.userId}`}
              icon={<UserCircleIcon className="w-4 inline-block mr-2" />}
              label="マイページ"
            />
            <MenuItemLink
              href="/plus"
              icon={<GemIcon className="w-4 inline-block mr-2" />}
              label="Aipictors+"
            />
            <MenuItemLink
              href="/account/login"
              icon={<UserCogIcon className="w-4 inline-block mr-2" />}
              label="アカウント"
            />
            {Config.isDevelopmentMode && (
              <MenuItemLink
                href="/settings/notification"
                icon={<SettingsIcon className="w-4 inline-block mr-2" />}
                label="設定"
              />
            )}
            <DropdownMenuItem onClick={props.onLogout}>
              <LogOutIcon className="w-4 inline-block mr-2" />
              <p>ログアウト</p>
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem onClick={props.onLogin}>
            <LogIn className="w-4 inline-block mr-2" />
            <p>ログイン</p>
          </DropdownMenuItem>
        )}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            {" "}
            {theme !== "dark" && (
              <SunIcon className="w-4 inline-block mr-2">{"Light"}</SunIcon>
            )}
            {theme === "dark" && (
              <MoonIcon className="w-4 inline-block mr-2">{"Light"}</MoonIcon>
            )}
            <p>テーマ</p>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup
                value={theme}
                onValueChange={(newTheme) => setTheme(newTheme)}
              >
                <DropdownMenuRadioItem value="light">
                  ライト
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="dark">
                  ダーク
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="system">
                  システム
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
