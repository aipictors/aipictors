import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import {
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
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
import { useLocation, useNavigate, Link } from "@remix-run/react"
import { useTranslation } from "~/hooks/use-translation"
import { useLocale } from "~/hooks/use-locale"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"
import { ScrollArea } from "~/components/ui/scroll-area"
import { SensitiveToggle } from "~/components/sensitive/sensitive-toggle"
import { graphql } from "gql.tada"
import {
  userNavigationStyles,
  getSkeletonClass,
  getMenuSkeletonClass,
} from "./user-navigation-styles"

type Props = {
  onLogout(): void
}

/**
 * ヘッダーのナビゲーションメニューの内容部分（アイコン部分を除く）
 * HomeUserNavigationMenuから分離された最新の実装
 */
export function UserNavigationMenuContent(props: Props) {
  const authContext = useContext(AuthContext)

  const { data, refetch } = useQuery(viewerUserQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    errorPolicy: "all",
    fetchPolicy: "cache-and-network", // キャッシュがある場合は即座に表示、バックグラウンドで更新
  })

  const { data: userSetting } = useQuery(userSettingQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    errorPolicy: "all",
    fetchPolicy: "cache-and-network",
  })

  const { data: tokenData } = useQuery(viewerTokenQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    errorPolicy: "all",
    fetchPolicy: "cache-and-network",
  })

  useEffect(() => {
    if (authContext.login) {
      refetch()
    }
  }, [authContext.login, refetch])

  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const t = useTranslation()
  const locale = useLocale()

  const promptonUser = data?.viewer?.user?.promptonUser?.id ?? ""
  const followerCount = data?.viewer?.user?.followersCount ?? 0
  const followCount = data?.viewer?.user?.followCount ?? 0
  const headerImageUrl = data?.viewer?.user.headerImageUrl ?? ""
  const iconUrl = data?.viewer?.user?.iconUrl ?? ""
  const featurePromptonRequest =
    userSetting?.userSetting?.featurePromptonRequest ?? false
  const viewerUserToken = tokenData?.viewer?.token
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
    const newTheme = newMode + colorSuffix
    setTheme(newTheme)
  }

  const setLocale = (locale: string) => {
    const currentLocale = location.pathname.match(/^\/(ja|en)(\/|$)/)?.[1] || ""
    const basePath = location.pathname.replace(/^\/(ja|en)(\/|$)/, "/")

    if (typeof document !== "undefined") {
      // @ts-ignore - クッキーの設定のため必要
      document.cookie = `locale=${locale}; path=/; SameSite=Lax`
    }

    const newUrl =
      locale === "ja" && currentLocale
        ? basePath
        : locale !== "ja" && currentLocale
          ? location.pathname.replace(`/${currentLocale}`, `/${locale}`)
          : `/${locale}${basePath}`

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
      <MoonIcon className={userNavigationStyles.menuIcon} />
    ) : (
      <SunIcon className={userNavigationStyles.menuIcon} />
    )
  }

  const sensitivePath = /\/r($|\/)/.test(location.pathname)

  const getSensitiveLink = (path: string) => {
    if (/^\/r($|\s)/.test(path)) {
      return ""
    }
    if (sensitivePath) {
      return `/r${path}`
    }
    return path
  }

  if (authContext.isNotLoggedIn) {
    return null
  }

  // データが読み込み中の場合は認証情報を使用してスケルトンを表示
  if (!data?.viewer?.user) {
    const fallbackIconUrl = authContext.avatarPhotoURL || ""
    const fallbackDisplayName = authContext.displayName || ""
    const fallbackLogin = authContext.login || ""

    return (
      <div className={userNavigationStyles.container}>
        <div className="relative mb-6 h-20 w-full rounded-md bg-gray-100 p-3 dark:bg-gray-800">
          <Link
            to={getSensitiveLink(`/users/${fallbackLogin}`)}
            className="absolute bottom-[-24px] left-3"
          >
            <Avatar className="h-12 w-12 cursor-pointer border-2 border-white">
              <AvatarImage src={withIconUrlFallback(fallbackIconUrl)} />
              <AvatarFallback>
                {fallbackDisplayName
                  ? fallbackDisplayName.charAt(0).toUpperCase()
                  : "U"}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>

        {/* ユーザー情報セクション（スケルトン）*/}
        <div className="px-2 pb-2">
          {/* ユーザー名部分 - フォールバック名があれば表示、なければスケルトン */}
          {fallbackDisplayName ? (
            <h3 className={userNavigationStyles.userName}>
              {fallbackDisplayName}
            </h3>
          ) : (
            <div
              className={getSkeletonClass(
                userNavigationStyles.skeleton.userName,
              )}
            />
          )}
          {/* ログイン名部分 - フォールバックログイン名があれば表示、なければスケルトン */}
          {fallbackLogin ? (
            <p className={userNavigationStyles.userLogin}>@{fallbackLogin}</p>
          ) : (
            <div
              className={`mt-1 ${getSkeletonClass(userNavigationStyles.skeleton.userLogin)}`}
            />
          )}

          {/* フォロー・フォロワー情報（スケルトン） */}
          <div className="mt-3 flex items-center gap-x-4">
            <div className="text-center">
              {/* 数字部分 */}
              <div
                className={getSkeletonClass(
                  userNavigationStyles.skeleton.followCount,
                )}
              />
              {/* ラベル部分は実際のテキストを表示 */}
              <div className={`mt-1 ${userNavigationStyles.followLabel}`}>
                {t("フォロー中", "Following")}
              </div>
            </div>
            <div className="text-center">
              {/* 数字部分 */}
              <div
                className={getSkeletonClass(
                  userNavigationStyles.skeleton.followCount,
                )}
              />
              {/* ラベル部分は実際のテキストを表示 */}
              <div className={`mt-1 ${userNavigationStyles.followLabel}`}>
                {t("フォロワー", "Followers")}
              </div>
            </div>
          </div>
        </div>

        <ScrollArea className="max-h-[320px] overflow-y-auto p-1 md:max-h-none">
          {/* スケルトンメニュー項目（実際の項目数に合わせる） */}
          {/* マイページ */}
          <div className={userNavigationStyles.menuItem}>
            <div
              className={`${userNavigationStyles.menuIcon} ${userNavigationStyles.skeleton.base}`}
            />
            <div className={getMenuSkeletonClass("myPage")} />
          </div>
          {/* ダッシュボード */}
          <div className={userNavigationStyles.menuItem}>
            <div
              className={`${userNavigationStyles.menuIcon} ${userNavigationStyles.skeleton.base}`}
            />
            <div className={getMenuSkeletonClass("dashboard")} />
          </div>
          {/* 自分の作品 */}
          <div className={userNavigationStyles.menuItem}>
            <div
              className={`${userNavigationStyles.menuIcon} ${userNavigationStyles.skeleton.base}`}
            />
            <div className={getMenuSkeletonClass("myPosts")} />
          </div>
          {/* 支援管理（条件付きで表示されるが、スケルトンでは表示しておく） */}
          <div className={userNavigationStyles.menuItem}>
            <div
              className={`${userNavigationStyles.menuIcon} ${userNavigationStyles.skeleton.base}`}
            />
            <div className={getMenuSkeletonClass("support")} />
          </div>
          {/* アカウント */}
          <div className={userNavigationStyles.menuItem}>
            <div
              className={`${userNavigationStyles.menuIcon} ${userNavigationStyles.skeleton.base}`}
            />
            <div className={getMenuSkeletonClass("account")} />
          </div>
          {/* お問い合わせ */}
          <div className={userNavigationStyles.menuItem}>
            <div
              className={`${userNavigationStyles.menuIcon} ${userNavigationStyles.skeleton.base}`}
            />
            <div className={getMenuSkeletonClass("contact")} />
          </div>
          {/* Aipictors+ */}
          <div className={userNavigationStyles.menuItem}>
            <div
              className={`${userNavigationStyles.menuIcon} ${userNavigationStyles.skeleton.base}`}
            />
            <div className={getMenuSkeletonClass("plus")} />
          </div>
          {/* 設定 */}
          <div className={userNavigationStyles.menuItem}>
            <div
              className={`${userNavigationStyles.menuIcon} ${userNavigationStyles.skeleton.base}`}
            />
            <div className={getMenuSkeletonClass("settings")} />
          </div>
          {/* テーマ */}
          <div className={userNavigationStyles.menuItem}>
            <div
              className={`${userNavigationStyles.menuIcon} ${userNavigationStyles.skeleton.base}`}
            />
            <div className={getMenuSkeletonClass("theme")} />
          </div>
          {/* 言語 */}
          <div className={userNavigationStyles.menuItem}>
            <div
              className={`${userNavigationStyles.menuIcon} ${userNavigationStyles.skeleton.base}`}
            />
            <div className={getMenuSkeletonClass("language")} />
          </div>
          {/* SensitiveToggle（条件付きで表示されるが、スケルトンでは表示しておく） */}
          <div className={userNavigationStyles.menuItem}>
            <div
              className={`${userNavigationStyles.menuIcon} ${userNavigationStyles.skeleton.base}`}
            />
            <div className={getMenuSkeletonClass("settings")} />
          </div>
          {/* ログアウト */}
          <div className={userNavigationStyles.menuItem}>
            <div
              className={`${userNavigationStyles.menuIcon} ${userNavigationStyles.skeleton.base}`}
            />
            <div className={getMenuSkeletonClass("logout")} />
          </div>
        </ScrollArea>
      </div>
    )
  }

  return (
    <div className={userNavigationStyles.container}>
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
      <div className="px-2 pb-2">
        {" "}
        {/* パディングを削減 */}
        <h3 className={userNavigationStyles.userName}>
          {data?.viewer?.user?.name || authContext.displayName}
        </h3>
        <p className={userNavigationStyles.userLogin}>
          @{data?.viewer?.user?.login || authContext.login}
        </p>
        {/* フォロー・フォロワー情報 */}
        <div className="mt-3 flex items-center gap-x-4">
          {" "}
          {/* gap を削減 */}
          <div className="text-center">
            <div className={userNavigationStyles.followCount}>
              {followCount}
            </div>
            <Link
              to={getSensitiveLink("/following")}
              className={`cursor-pointer hover:underline ${userNavigationStyles.followLabel}`}
            >
              {t("フォロー中", "Following")}
            </Link>
          </div>
          <div className="text-center">
            <div className={userNavigationStyles.followCount}>
              {followerCount}
            </div>
            <Link
              to={getSensitiveLink("/followers")}
              className={`cursor-pointer hover:underline ${userNavigationStyles.followLabel}`}
            >
              {t("フォロワー", "Followers")}
            </Link>
          </div>
        </div>
      </div>

      <ScrollArea className="max-h-[320px] overflow-y-auto p-1 md:max-h-none">
        <MenuItemLink
          href={getSensitiveLink(`/users/${authContext.login}`)}
          icon={<UserCircleIcon className={userNavigationStyles.menuIcon} />}
          label={t("マイページ", "My page")}
        />
        <MenuItemLink
          href={getSensitiveLink("/my")}
          icon={<SquareKanbanIcon className={userNavigationStyles.menuIcon} />}
          label={t("ダッシュボード", "Dashboard")}
        />
        <MenuItemLink
          href={getSensitiveLink("/my/posts")}
          icon={<SquareKanbanIcon className={userNavigationStyles.menuIcon} />}
          label={t("自分の作品", "My posts")}
        />
        {featurePromptonRequest &&
          (promptonUser === "" && viewerUserToken ? (
            <MenuItemLink
              href={`https://prompton.io/integration?token=${viewerUserToken}`}
              icon={<CoffeeIcon className={userNavigationStyles.menuIcon} />}
              label={t("支援管理", "Support management")}
            />
          ) : (
            <MenuItemLink
              href={"https://prompton.io/viewer/requests"}
              icon={<CoffeeIcon className={userNavigationStyles.menuIcon} />}
              label={t("支援管理", "Support management")}
            />
          ))}
        <MenuItemLink
          href={getSensitiveLink("/settings/account/login")}
          icon={<UserIcon className={userNavigationStyles.menuIcon} />}
          label={t("アカウント", "Account")}
        />
        <MenuItemLink
          href={getSensitiveLink("/support/chat")}
          icon={<MessageCircleIcon className={userNavigationStyles.menuIcon} />}
          label={t("お問い合わせ", "Contact")}
        />
        <MenuItemLink
          href={getSensitiveLink("/plus")}
          icon={<GemIcon className={userNavigationStyles.menuIcon} />}
          label="Aipictors+"
        />
        <MenuItemLink
          href={getSensitiveLink("/settings")}
          icon={<SettingsIcon className={userNavigationStyles.menuIcon} />}
          label={t("設定", "Settings")}
        />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className={userNavigationStyles.menuItem}>
            {getThemeIcon()}
            <span
              className={`${userNavigationStyles.menuText} ${userNavigationStyles.menuItemText}`}
            >
              {t("テーマ", "Theme")}
            </span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className="max-w-[180px] sm:max-w-[200px]">
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
                icon={
                  <SettingsIcon className={userNavigationStyles.menuIcon} />
                }
                label={t("その他のカラー", "Other colors")}
              />
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className={userNavigationStyles.menuItem}>
            <Languages className={userNavigationStyles.menuIcon} />
            <span
              className={`${userNavigationStyles.menuText} ${userNavigationStyles.menuItemText}`}
            >
              {t("言語/Language", "言語/Language")}
            </span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className="max-w-[160px] sm:max-w-[180px]">
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
        <DropdownMenuItem
          onClick={props.onLogout}
          className={userNavigationStyles.menuItem}
        >
          <LogOutIcon className={userNavigationStyles.menuIcon} />
          <span
            className={`${userNavigationStyles.menuText} ${userNavigationStyles.menuItemText}`}
          >
            {t("ログアウト", "Logout")}
          </span>
        </DropdownMenuItem>
      </ScrollArea>
    </div>
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

// default exportとして追加
export default UserNavigationMenuContent
