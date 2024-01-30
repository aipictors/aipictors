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
import { useTheme } from "next-themes"
import Link from "next/link"
import { useContext } from "react"

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

const THEME_DARK = "dark"

export const HomeUserNavigationMenu = (props: Props) => {
  const authContext = useContext(AuthContext)

  const { theme, setTheme } = useTheme()

  const getThemeIcon = () => {
    return theme === THEME_DARK ? (
      <MoonIcon className="w-4 inline-block mr-2" />
    ) : (
      <SunIcon className="w-4 inline-block mr-2" />
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar>
          {authContext.avatarPhotoURL ? (
            <AvatarImage src={authContext.avatarPhotoURL} />
          ) : (
            <AvatarFallback />
          )}
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {authContext.isLoggedIn ? (
          <>
            <MenuItemLink
              href={`https://www.aipictors.com/users/?id=${authContext.userId}`}
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
            {getThemeIcon()}
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
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
