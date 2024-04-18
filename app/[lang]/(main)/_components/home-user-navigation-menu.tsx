import { Avatar, AvatarFallback, AvatarImage } from "@/_components/ui/avatar"
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
} from "@/_components/ui/dropdown-menu"
import { AuthContext } from "@/_contexts/auth-context"
import { config } from "@/config"
import { Link } from "@remix-run/react"
import {
  GemIcon,
  LogOutIcon,
  MessageCircleIcon,
  MoonIcon,
  SettingsIcon,
  SunIcon,
  UserCircleIcon,
  UserIcon,
} from "lucide-react"
import { useContext } from "react"
import { Theme, useTheme } from "remix-themes"

type Props = {
  onLogout(): void
}

type MenuItemLinkProps = {
  href: string
  icon: React.ReactNode
  label: string
}

const MenuItemLink = ({ href, icon, label }: MenuItemLinkProps) => (
  <Link to={href}>
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
  const [, setTheme] = useTheme()

  const getThemeIcon = () => {
    return Theme.DARK ? (
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
              <DropdownMenuItem>デバイスのモードを使用する</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme(Theme.LIGHT)}>
                ライト
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme(Theme.DARK)}>
                ダーク
              </DropdownMenuItem>
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
