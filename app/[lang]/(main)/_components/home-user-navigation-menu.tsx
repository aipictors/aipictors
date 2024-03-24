"use client"

import { AuthContext } from "@/app/_contexts/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { config } from "@/config"
import {
  GemIcon,
  LogOutIcon,
  MessageCircleIcon,
  MoonIcon,
  SettingsIcon,
  SunIcon,
  UserCircleIcon,
  UserCogIcon,
  UserIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { useContext } from "react"

type Props = {
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

/**
 * ヘッダーのナビゲーションメニュー
 * @param props
 * @returns
 */
export const HomeUserNavigationMenu = (props: Props) => {
  const authContext = useContext(AuthContext)
  const THEME_DARK = "dark"
  const { theme, setTheme } = useTheme()

  const getThemeIcon = () => {
    return theme === THEME_DARK ? (
      <MoonIcon className="mr-2 inline-block w-4" />
    ) : (
      <SunIcon className="mr-2 inline-block w-4" />
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer">
          <AvatarImage src={authContext.avatarPhotoURL ?? undefined} />
          <AvatarFallback />
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <MenuItemLink
          href={`https://www.aipictors.com/users/?id=${authContext.userId}`}
          icon={<UserCircleIcon className="mr-2 inline-block w-4" />}
          label="マイページ"
        />
        <MenuItemLink
          href="/account/login"
          icon={<UserIcon className="mr-2 inline-block w-4" />}
          label="アカウント"
        />
        <MenuItemLink
          href="/support/chat"
          icon={<MessageCircleIcon className="mr-2 inline-block w-4" />}
          label="お問い合わせ"
        />
        <MenuItemLink
          href="/plus"
          icon={<GemIcon className="mr-2 inline-block w-4" />}
          label="Aipictors+"
        />
        {config.isDevelopmentMode && (
          <MenuItemLink
            href="/settings/notification"
            icon={<SettingsIcon className="mr-2 inline-block w-4" />}
            label="設定"
          />
        )}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            {getThemeIcon()}
            {"テーマ"}
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuLabel>{"テーマ変更"}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={theme}
                onValueChange={(newTheme) => setTheme(newTheme)}
              >
                <DropdownMenuRadioItem value="system">
                  デバイスのモードを使用する
                </DropdownMenuRadioItem>
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
        <DropdownMenuItem onClick={props.onLogout}>
          <LogOutIcon className="mr-2 inline-block w-4" />
          <p>ログアウト</p>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
