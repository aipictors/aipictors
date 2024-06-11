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

  const headerImageUrl = data?.viewer?.user.headerImage?.downloadURL ?? ""

  const featurePromptonRequest =
    userSetting?.userSetting?.featurePromptonRequest ?? false

  const { data: token, refetch: tokenRefetch } =
    useSuspenseQuery(viewerTokenQuery)

  const viewerUserToken = token?.viewer?.token

  const { theme, setTheme } = useTheme()

  const getThemeIcon = () => {
    return theme === "dark" ? (
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
        <div>
          <div
            className="w-full rounded-md bg-gray-100 p-2 dark:bg-gray-800"
            style={{
              backgroundImage: `url(${headerImageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <a href={`/users/${authContext.login}`}>
              <Avatar className="cursor-pointer">
                <AvatarImage src={authContext.avatarPhotoURL ?? undefined} />
                <AvatarFallback />
              </Avatar>
            </a>
          </div>
        </div>
        <div className="p-1">
          <div className="flex items-center gap-x-2 p-2">
            <a className="w-16" href="/following">
              <p>{followCount}</p>
              <p className="text-xs opacity-80">{"フォロー中"}</p>
            </a>
            <a className="w-16" href="/followers">
              <p>{followerCount}</p>
              <p className="text-xs opacity-80">{"フォロワー"}</p>
            </a>
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
            href={"/dashboard/works"}
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
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
