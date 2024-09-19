import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
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
} from "~/components/ui/dropdown-menu"
import { AuthContext } from "~/contexts/auth-context"
import {
  CoffeeIcon,
  GemIcon,
  GlobeIcon,
  LogOutIcon,
  MessageCircleIcon,
  MoonIcon,
  SettingsIcon,
  SquareKanbanIcon,
  SunIcon,
  UserCircleIcon,
  UserIcon,
} from "lucide-react"
import { useSuspenseQuery } from "@apollo/client/index"
import { useContext } from "react"
import { useTheme } from "next-themes"
import { MenuItemLink } from "~/routes/($lang)._main._index/components/menu-item-link"
import { Link, useLocation, useNavigate } from "@remix-run/react"
import { graphql } from "gql.tada"
import { ToggleSensitive } from "~/routes/($lang)._main._index/components/toggle-sensitive"
import { useTranslation } from "~/hooks/use-translation"
import { useLocale } from "~/hooks/use-locale"

type Props = {
  onLogout(): void
}

/**
 * ヘッダーのナビゲーションメニュー
 */
export function HomeUserNavigationMenu(props: Props) {
  const authContext = useContext(AuthContext)

  const { data = null } = useSuspenseQuery(viewerUserQuery, {
    skip: authContext.isLoading,
  })

  const { data: userSetting } = useSuspenseQuery(userSettingQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
  })

  const t = useTranslation()

  const locale = useLocale()

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

  const navigate = useNavigate()

  const location = useLocation()

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
    // テーマ適用中→"light-blue"、"dark-blue"等同色でのダーク、ライト切り替え
    const suffix = theme?.replace(/(light|dark)\-/, "-")
    const colorSuffix = suffix ?? ""
    setTheme(newMode + colorSuffix)
  }

  const setLocale = (locale: string) => {
    const currentLocale = location.pathname.match(/^\/(ja|en)/)?.[1] || ""
    let newUrl = location.pathname

    if (locale === "ja" && currentLocale) {
      newUrl = location.pathname.replace(`/${currentLocale}`, "")
    } else if (locale !== "ja") {
      newUrl = currentLocale
        ? location.pathname.replace(`/${currentLocale}`, "/en")
        : `/en${location.pathname}`
    }

    navigate(newUrl)
  }

  const setMode = (theme: string) => {
    if (theme === "system" || theme === "light" || theme === "dark") {
      return theme
    }
    if (theme.startsWith("light-")) {
      return "light"
    }
    if (theme.startsWith("dark-")) {
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
            className="relative mb-4 h-16 w-full rounded-md bg-gray-100 p-2 dark:bg-gray-800"
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
            href={"/my"}
            icon={<SquareKanbanIcon className="mr-2 inline-block w-4" />}
            label="ダッシュボード"
          />
          <MenuItemLink
            href={"/my/posts"}
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
            href="/settings/account/login"
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
            href="/settings"
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
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <GlobeIcon className="mr-2 inline-block w-4" />
              {t("言語", "Language")}
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuLabel>
                  {t("言語変更", "Change Language")}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={locale}
                  onValueChange={(newLocale) => {
                    setLocale(newLocale)
                  }}
                >
                  <DropdownMenuRadioItem value="ja">
                    {t("日本語", "Japanese")}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="en">
                    {t("英語", "English")}
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          {userSetting?.userSetting &&
            (userSetting?.userSetting.preferenceRating === "R18" ||
              userSetting?.userSetting.preferenceRating === "R18G") && (
              <DropdownMenuItem>
                <ToggleSensitive />
              </DropdownMenuItem>
            )}
          <DropdownMenuItem onClick={props.onLogout}>
            <LogOutIcon className="mr-2 inline-block w-4" />
            <p>ログアウト</p>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const userSettingQuery = graphql(
  `query UserSetting {
    userSetting {
      id
      userId
      favoritedImageGenerationModelIds
      preferenceRating
      featurePromptonRequest
      isAnonymousLike
      isAnonymousSensitiveLike
      isNotifyComment
    }
  }`,
)

const viewerTokenQuery = graphql(
  `query ViewerToken {
    viewer {
      id
      token
    }
  }`,
)

const viewerUserQuery = graphql(
  `query ViewerUser {
    viewer {
      id
      user {
        id
        biography
        login
        name
        awardsCount
        followersCount
        followCount
        iconUrl
        headerImageUrl
        webFcmToken
        generatedCount
        promptonUser {
          id
          name
        }
        receivedLikesCount
        receivedViewsCount
        createdLikesCount
        createdViewsCount
        createdCommentsCount
        createdBookmarksCount
      }
    }
  }`,
)
