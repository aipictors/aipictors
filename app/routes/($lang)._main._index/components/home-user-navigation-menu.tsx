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
import { useQuery } from "@apollo/client/index"
import { useContext, useEffect } from "react"
import { useTheme } from "next-themes"
import { MenuItemLink } from "~/routes/($lang)._main._index/components/menu-item-link"
import { Link, useLocation, useNavigate } from "@remix-run/react"
import { graphql } from "gql.tada"
import { useTranslation } from "~/hooks/use-translation"
import { useLocale } from "~/hooks/use-locale"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"
import { ScrollArea } from "~/components/ui/scroll-area"
import { SensitiveToggle } from "~/components/sensitive/sensitive-toggle"

type Props = {
  onLogout(): void
}

/**
 * ヘッダーのナビゲーションメニュー
 */
export function HomeUserNavigationMenu(props: Props) {
  const authContext = useContext(AuthContext)

  const { data, refetch } = useQuery(viewerUserQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    // 基本情報のみ先に取得
    errorPolicy: "all",
    notifyOnNetworkStatusChange: false,
    fetchPolicy: "cache-first", // キャッシュを優先
  })

  const { data: userSetting } = useQuery(userSettingQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    errorPolicy: "all",
    fetchPolicy: "cache-first", // キャッシュを優先
  })

  const { data: tokenData } = useQuery(viewerTokenQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    errorPolicy: "all",
    fetchPolicy: "cache-first", // キャッシュを優先
  })

  useEffect(() => {
    // authContext.login が変更された時のみリフェッチ
    if (authContext.login) {
      refetch()
    }
  }, [authContext.login, refetch])

  const t = useTranslation()

  const locale = useLocale()

  const promptonUser = data?.viewer?.user?.promptonUser?.id ?? ""

  const followerCount = data?.viewer?.user?.followersCount ?? 0

  const followCount = data?.viewer?.user?.followCount ?? 0

  // デバッグ用ログ
  console.log("HomeUserNavigationMenu - data:", data)
  console.log("HomeUserNavigationMenu - user:", data?.viewer?.user)
  console.log("HomeUserNavigationMenu - followersCount:", followerCount)
  console.log("HomeUserNavigationMenu - followCount:", followCount)

  const headerImageUrl = data?.viewer?.user.headerImageUrl ?? ""

  const iconUrl = data?.viewer?.user?.iconUrl ?? ""

  const featurePromptonRequest =
    userSetting?.userSetting?.featurePromptonRequest ?? false

  const viewerUserToken = tokenData?.viewer?.token

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
    const suffix = theme?.replace(/(light|dark)-/, "-")
    const colorSuffix = suffix ?? ""
    setTheme(newMode + colorSuffix)
  }

  const setLocale = (locale: string) => {
    // URLの先頭にある /ja または /en を正しく検出
    const currentLocale = location.pathname.match(/^\/(ja|en)(\/|$)/)?.[1] || ""

    // 現在のロケール部分を削除したURLのベースパスを取得
    const basePath = location.pathname.replace(/^\/(ja|en)(\/|$)/, "/")

    // クッキーにロケールを保存
    if (typeof document !== "undefined") {
      document.cookie = `locale=${locale}; path=/; SameSite=Lax`
    }

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

  // データが読み込まれていない場合は何も表示しない
  if (!data?.viewer?.user) {
    return null
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
            className="relative mb-6 h-20 w-full rounded-md bg-gray-100 p-3 dark:bg-gray-800"
            style={{
              backgroundImage: headerImageUrl
                ? `url(${headerImageUrl})`
                : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <Link
              to={getSensitiveLink(`/users/${data?.viewer?.user?.login}`)}
              className="absolute bottom-[-24px] left-3"
            >
              <Avatar className="h-12 w-12 cursor-pointer border-2 border-white">
                <AvatarImage src={withIconUrlFallback(iconUrl)} />
                <AvatarFallback />
              </Avatar>
            </Link>
          </div>

          {/* ユーザー情報セクション */}
          <div className="px-3 pb-2">
            <h3 className="font-bold text-lg">{data?.viewer?.user?.name}</h3>
            <p className="text-muted-foreground text-sm">
              @{data?.viewer?.user?.login}
            </p>

            {/* フォロー・フォロワー情報 */}
            <div className="mt-3 flex items-center gap-x-8">
              <div className="text-center">
                <div className="font-bold text-lg">{followCount}</div>
                <Link
                  to={getSensitiveLink("/following")}
                  className="cursor-pointer text-muted-foreground text-sm hover:underline"
                >
                  {t("フォロー中", "Following")}
                </Link>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">{followerCount}</div>
                <Link
                  to={getSensitiveLink("/followers")}
                  className="cursor-pointer text-muted-foreground text-sm hover:underline"
                >
                  {t("フォロワー", "Followers")}
                </Link>
              </div>
            </div>
          </div>
        </div>
        <ScrollArea className="max-h-[320px] overflow-y-auto p-1 md:max-h-none">
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
              <DropdownMenuItem asChild>
                <SensitiveToggle variant="full" className="w-full" />
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
