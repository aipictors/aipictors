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
import {
  CoffeeIcon,
  GemIcon,
  LogOutIcon,
  MessageCircleIcon,
  MoonIcon,
  SettingsIcon,
  SquareKanbanIcon,
  SunIcon,
  UserCircleIcon,
  UserIcon,
} from "lucide-react"
import { viewerUserQuery } from "@/_graphql/queries/viewer/viewer-user"
import { useSuspenseQuery } from "@apollo/client/index"
import { userSettingQuery } from "@/_graphql/queries/user/user-setting"
import { useContext } from "react"
import { useTheme } from "next-themes"
import { viewerTokenQuery } from "@/_graphql/queries/viewer/viewer-token"
import { MenuItemLink } from "@/routes/($lang)._main._index/_components/menu-item-link"
import { Link } from "@remix-run/react"

type Props = {
  onLogout(): void
}

/**
 * ヘッダーのナビゲーションメニュー
 */
export const HomeUserNavigationMenu = (props: Props) => {
  const authContext = useContext(AuthContext)

  const { data = null } = useSuspenseQuery(viewerUserQuery, {
    skip: authContext.isLoading,
  })

  const { data: userSetting } = useSuspenseQuery(userSettingQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
  })

  const promptonUser = data?.viewer?.user?.promptonUser?.id ?? ""

  const followerCount = data?.viewer?.user?.followersCount ?? 0

  const followCount = data?.viewer?.user?.followCount ?? 0

  const headerImageUrl = data?.viewer?.user.headerImageUrl ?? ""

  const iconUrl = data?.viewer?.user?.iconUrl ?? ""

  const featurePromptonRequest =
    userSetting?.userSetting?.featurePromptonRequest ?? false

  const { data: token, refetch: tokenRefetch } =
    useSuspenseQuery(viewerTokenQuery)

  const viewerUserToken = token?.viewer?.token

  const { theme, setTheme } = useTheme()

  const setColorTheme = (newMode: string) => {
    if (newMode === "system") {
      setTheme(newMode)
      return
    }
    if ((theme === "system" || theme === "dark") && newMode === "light") {
      setTheme(newMode)
      return
    }
    if ((theme === "system" || theme === "light") && newMode === "dark") {
      setTheme(newMode)
      return
    }
    // テーマ適用中→"blue-light"、"blue-dark"等同色でのダーク、ライト切り替え
    const prefix = theme?.replace(/\-(light|dark)/, "-")
    const colorPrefix = prefix ?? ""
    setTheme(colorPrefix + newMode)
  }
  const setMode = (theme: string) => {
    if (theme === "system" || theme === "light" || theme === "dark") {
      return theme
    }
    if (theme.endsWith("-light")) {
      return "light"
    }
    if (theme.endsWith("-dark")) {
      return "dark"
    }
    return "system"
  }
  const mode = setMode(theme ? theme?.toString() : "system")

  const getThemeIcon = () => {
    return theme?.endsWith("dark") ? (
      <MoonIcon className="mr-2 inline-block w-4" />
    ) : (
      <SunIcon className="mr-2 inline-block w-4" />
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer">
          <AvatarImage src={iconUrl ?? undefined} />
          <AvatarFallback />
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <div>
          <div
            className="relative mb-4 h-16 w-full rounded-md bg-card p-2"
            style={{
              backgroundImage: `url(${headerImageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <Link
              to={`/users/${authContext.login}`}
              className="absolute bottom-[-16px]"
            >
              <Avatar className="cursor-pointer ">
                <AvatarImage src={iconUrl ?? undefined} />
                <AvatarFallback />
              </Avatar>
            </Link>
          </div>
        </div>
        <div className="p-1">
          <div className="flex items-center gap-x-2 p-2">
            <Link to="/following" className="w-16">
              <p>{followCount}</p>
              <p className="text-xs opacity-80">{"フォロー中"}</p>
            </Link>
            <Link to="/followers" className="w-16">
              <p>{followerCount}</p>
              <p className="text-xs opacity-80">{"フォロワー"}</p>
            </Link>
          </div>
          <MenuItemLink
            href={`/users/${authContext.login}`}
            icon={<UserCircleIcon className="mr-2 inline-block w-4" />}
            label="マイページ"
          />
          <MenuItemLink
            href={"/dashboard"}
            icon={<SquareKanbanIcon className="mr-2 inline-block w-4" />}
            label="ダッシュボード"
          />
          <MenuItemLink
            href={"/dashboard/posts"}
            icon={<SquareKanbanIcon className="mr-2 inline-block w-4" />}
            label="自分の作品"
          />
          {featurePromptonRequest &&
            (promptonUser === "" && viewerUserToken ? (
              <MenuItemLink
                href={`https://prompton.io/integration?token=${viewerUserToken}`}
                icon={<CoffeeIcon className="mr-2 inline-block w-4" />}
                label="支援管理"
              />
            ) : (
              <MenuItemLink
                href={"https://prompton.io/viewer/requests"}
                icon={<CoffeeIcon className="mr-2 inline-block w-4" />}
                label="支援管理"
              />
            ))}
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
          <MenuItemLink
            href="/settings/notification"
            icon={<SettingsIcon className="mr-2 inline-block w-4" />}
            label="設定"
          />
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
                  value={mode}
                  onValueChange={(newMode) => {
                    setColorTheme(newMode)
                  }}
                >
                  <DropdownMenuRadioItem value="system">
                    デバイスモード使用
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="light">
                    ライト
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="dark">
                    ダーク
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                <MenuItemLink
                  href="/settings/color"
                  icon={<SettingsIcon className="mr-2 inline-block w-4" />}
                  label="その他のカラー"
                />
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuItem onClick={props.onLogout}>
            <LogOutIcon className="mr-2 inline-block w-4" />
            <p>ログアウト</p>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
