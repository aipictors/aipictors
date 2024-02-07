"use client"

import { LoginModal } from "@/app/[lang]/(main)/_components/login-modal"
import { AuthContext } from "@/app/_contexts/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { config } from "@/config"
import {
  GemIcon,
  LogOutIcon,
  SettingsIcon,
  UserCircleIcon,
  UserCogIcon,
} from "lucide-react"
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

export const HomeUserNavigationMenu = (props: Props) => {
  const authContext = useContext(AuthContext)

  return (
    <>
      {authContext.isLoggedIn ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar>
              <AvatarImage src={authContext.avatarPhotoURL} />
              <AvatarFallback />
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
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
              {config.isDevelopmentMode && (
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
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <LoginModal />
      )}
    </>
  )
}
