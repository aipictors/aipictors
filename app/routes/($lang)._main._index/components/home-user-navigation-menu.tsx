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
  Languages,
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
import { useContext, useEffect } from "react"
import { useTheme } from "next-themes"
import { MenuItemLink } from "~/routes/($lang)._main._index/components/menu-item-link"
import { Link, useLocation, useNavigate } from "@remix-run/react"
import { graphql } from "gql.tada"
import { ToggleSensitive } from "~/routes/($lang)._main._index/components/toggle-sensitive"
import { useTranslation } from "~/hooks/use-translation"
import { useLocale } from "~/hooks/use-locale"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"
import { ScrollArea } from "~/components/ui/scroll-area"

type Props = {
  onLogout(): void
}

/**
 * ヘッダーのナビゲーションメニュー
 */
export function HomeUserNavigationMenu(props: Props) {
  const authContext = useContext(AuthContext)

  const { data, refetch } = useSuspenseQuery(viewerUserQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
  })

  const { data: userSetting } = useSuspenseQuery(userSettingQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
  })

  useEffect(() => {
    refetch()
  }, [authContext.login])

  const t = useTranslation()

  const locale = useLocale()

  const promptonUser = data?.viewer?.user?.promptonUser?.id ?? ""

  const followerCount = data?.viewer?.user?.followersCount ?? 0

  const followCount = data?.viewer?.user?.followCount ?? 0

  const headerImageUrl = data?.viewer?.user.headerImageUrl ?? ""

  const iconUrl = data?.viewer?.user?.iconUrl ?? ""

  const featurePromptonRequest =
    userSetting?.userSetting?.featurePromptonRequest ?? false

  const { data: token } = useSuspenseQuery(viewerTokenQuery)

  const viewerUserToken = token?.viewer?.token

  const { theme, setTheme } = useTheme()

  const navigate = useNavigate()

  const location = useLocation()

  const isSensitiveToggleVisible = location.pathname !== "/generation"

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
    // URLの先頭にある /ja または /en を正しく検出
    const currentLocale = location.pathname.match(/^\/(ja|en)(\/|$)/)?.[1] || ""

    // 現在のロケール部分を削除したURLのベースパスを取得
    const basePath = location.pathname.replace(/^\/(ja|en)(\/|$)/, "/")

    // クッキーにロケールを保存
    document.cookie = `locale=${locale}; path=/;`

    // 新しいURLを条件に応じて設定
    const newUrl =
      locale === "ja" && currentLocale
        ? basePath // 日本語の場合はロケールを削除してベースパスを使用
        : locale !== "ja" && currentLocale
          ? location.pathname.replace(`/${currentLocale}`, `/${locale}`) // 英語の場合はロケールを置き換え
          : `/${locale}${basePath}` // 新しいロケールを追加

    // navigateを使用してURLを変更
    if (location.pathname !== newUrl) {
      navigate(newUrl)
    }
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

  const sensitivePath = /\/r($|\/)/.test(location.pathname)

  const getSensitiveLink = (path: string) => {
    // Determine if the path starts with /r
    if (/^\/r($|\s)/.test(path)) {
      return "" // Return empty string for invalid paths
    }

    if (sensitivePath) {
      return `/r${path}`
    }

    return path
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer">
          <AvatarImage src={withIconUrlFallback(iconUrl)} />
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
              to={getSensitiveLink(`/users/${authContext.login}`)}
              className="absolute bottom-[-16px]"
            >
              <Avatar className="cursor-pointer ">
                <AvatarImage src={withIconUrlFallback(iconUrl)} />
                <AvatarFallback />
              </Avatar>
            </Link>
          </div>
        </div>
        <ScrollArea className="max-h-[320px] overflow-y-auto p-1 md:max-h-none">
          <div className="flex items-center gap-x-2 p-2">
            <Link
              to={getSensitiveLink("/following")}
              className="w-16 hover:underline"
            >
              <p>{followCount}</p>
              <p className="text-xs opacity-80">
                {t("フォロー中", "Following")}
              </p>
            </Link>
            <Link
              to={getSensitiveLink("/followers")}
              className="w-16 hover:underline"
            >
              <p>{followerCount}</p>
              <p className="text-xs opacity-80">
                {t("フォロワー", "Followers")}
              </p>
            </Link>
          </div>
          <MenuItemLink
            href={getSensitiveLink(`/users/${authContext.login}`)}
            icon={<UserCircleIcon className="mr-2 inline-block w-4" />}
            label={t("マイページ", "My page")}
          />
          <MenuItemLink
            href={getSensitiveLink("/my")}
            icon={<SquareKanbanIcon className="mr-2 inline-block w-4" />}
            label={t("ダッシュボード", "Dashboard")}
          />
          <MenuItemLink
            href={getSensitiveLink("/my/posts")}
            icon={<SquareKanbanIcon className="mr-2 inline-block w-4" />}
            label={t("自分の作品", "My posts")}
          />
          {featurePromptonRequest &&
            (promptonUser === "" && viewerUserToken ? (
              <MenuItemLink
                href={`https://prompton.io/integration?token=${viewerUserToken}`}
                icon={<CoffeeIcon className="mr-2 inline-block w-4" />}
                label={t("支援管理", "Support management")}
              />
            ) : (
              <MenuItemLink
                href={"https://prompton.io/viewer/requests"}
                icon={<CoffeeIcon className="mr-2 inline-block w-4" />}
                label={t("支援管理", "Support management")}
              />
            ))}
          <MenuItemLink
            href={getSensitiveLink("/settings/account/login")}
            icon={<UserIcon className="mr-2 inline-block w-4" />}
            label={t("アカウント", "Account")}
          />
          <MenuItemLink
            href={getSensitiveLink("/support/chat")}
            icon={<MessageCircleIcon className="mr-2 inline-block w-4" />}
            label={t("お問い合わせ", "Contact")}
          />
          <MenuItemLink
            href={getSensitiveLink("/plus")}
            icon={<GemIcon className="mr-2 inline-block w-4" />}
            label="Aipictors+"
          />
          <MenuItemLink
            href={getSensitiveLink("/settings")}
            icon={<SettingsIcon className="mr-2 inline-block w-4" />}
            label={t("設定", "Settings")}
          />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              {getThemeIcon()}
              {t("テーマ", "Theme")}
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuLabel>
                  {t("テーマ変更", "Change Theme")}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={mode}
                  onValueChange={(newMode) => {
                    setColorTheme(newMode)
                  }}
                >
                  <DropdownMenuRadioItem value="system">
                    {t("デバイスモード使用", "Use device mode")}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="light">
                    {t("ライト", "Light")}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="dark">
                    {t("ダーク", "Dark")}
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                <MenuItemLink
                  href={getSensitiveLink("/settings/color")}
                  icon={<SettingsIcon className="mr-2 inline-block w-4" />}
                  label={t("その他のカラー", "Other colors")}
                />
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Languages className="mr-2 inline-block w-4" />
              {t("言語/Language", "言語/Language")}
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
                    {t("日本語", "日本語")}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="en">
                    {t("English", "English")}
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          {userSetting?.userSetting &&
            (userSetting?.userSetting.preferenceRating === "R18" ||
              userSetting?.userSetting.preferenceRating === "R18G") &&
            isSensitiveToggleVisible && (
              <DropdownMenuItem>
                <ToggleSensitive />
              </DropdownMenuItem>
            )}
          <DropdownMenuItem onClick={props.onLogout}>
            <LogOutIcon className="mr-2 inline-block w-4" />
            <p>{t("ログアウト", "Logout")}</p>
          </DropdownMenuItem>
        </ScrollArea>
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
