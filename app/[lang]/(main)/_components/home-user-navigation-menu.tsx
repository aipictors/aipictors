"use client"

import { AuthContext } from "@/app/_contexts/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { config } from "@/config"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  GemIcon,
  LogOutIcon,
  MoonIcon,
  SettingsIcon,
  SunIcon,
  UserCircleIcon,
  UserCogIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { type MouseEventHandler, useContext, useState } from "react"

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

type MenuItemMoveProps = {
  onClick: MouseEventHandler<HTMLDivElement>
  icon: React.ReactNode | null
  label: string
  isNext: boolean
}

const MenuItemMove = ({ onClick, icon, label, isNext }: MenuItemMoveProps) => (
  <DropdownMenuLabel className="cursor-pointer font-normal" onClick={onClick}>
    {isNext ? (
      <div className="flex">
        {icon ? icon : <></>}
        <span>{label}</span>
        {<ChevronRightIcon className="ml-auto" />}
      </div>
    ) : (
      <div className="flex">
        {<ChevronLeftIcon />}
        {icon ? icon : <></>}
        <span>{label}</span>
      </div>
    )}
  </DropdownMenuLabel>
)

export const HomeUserNavigationMenu = (props: Props) => {
  const authContext = useContext(AuthContext)
  const THEME_DARK = "dark"
  const { theme, setTheme } = useTheme()
  const [showThemeMenu, setShowThemeMenu] = useState(false)

  const handleThemeOnMenuClick = (event: { stopPropagation: () => void }) => {
    setShowThemeMenu(true)
    event.stopPropagation()
  }

  const handleThemeOffMenuClick = (event: { stopPropagation: () => void }) => {
    setShowThemeMenu(false)
    event.stopPropagation()
  }

  const getThemeIcon = () => {
    return theme === THEME_DARK ? (
      <MoonIcon className="mr-2 inline-block w-4" />
    ) : (
      <SunIcon className="mr-2 inline-block w-4" />
    )
  }

  const initMenu = () => {
    setTimeout(() => {
      setShowThemeMenu(false)
    }, 400)
  }

  return (
    <DropdownMenu onOpenChange={initMenu}>
      <DropdownMenuTrigger asChild>
        <Avatar>
          <AvatarImage src={authContext.avatarPhotoURL ?? undefined} />
          <AvatarFallback />
        </Avatar>
      </DropdownMenuTrigger>
      {showThemeMenu ? (
        <DropdownMenuContent>
          <MenuItemMove
            onClick={handleThemeOffMenuClick}
            icon={null}
            label={"テーマ"}
            isNext={false}
          />
          <DropdownMenuRadioGroup
            value={theme}
            onValueChange={(newTheme) => setTheme(newTheme)}
          >
            <DropdownMenuRadioItem value="light">ライト</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="dark">ダーク</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      ) : (
        <DropdownMenuContent>
          <MenuItemLink
            href={`https://www.aipictors.com/users/?id=${authContext.userId}`}
            icon={<UserCircleIcon className="mr-2 inline-block w-4" />}
            label="マイページ"
          />
          <MenuItemLink
            href="/plus"
            icon={<GemIcon className="mr-2 inline-block w-4" />}
            label="Aipictors+"
          />
          <MenuItemLink
            href="/account/login"
            icon={<UserCogIcon className="mr-2 inline-block w-4" />}
            label="アカウント"
          />
          {config.isDevelopmentMode && (
            <MenuItemLink
              href="/settings/notification"
              icon={<SettingsIcon className="mr-2 inline-block w-4" />}
              label="設定"
            />
          )}
          <MenuItemMove
            onClick={handleThemeOnMenuClick}
            icon={getThemeIcon()}
            label={"テーマ"}
            isNext={true}
          />
          <DropdownMenuItem onClick={props.onLogout}>
            <LogOutIcon className="mr-2 inline-block w-4" />
            <p>ログアウト</p>
          </DropdownMenuItem>
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  )
}
