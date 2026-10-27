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
import { UserAvatarWithFrame } from "~/components/user/user-avatar-with-frame"
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
import { CoinIcon } from "~/components/coin-icon"
import { PremiumCoinIcon } from "~/components/premium-coin-icon"
import {
  getViewerRequestHeaders,
  hasViewerRequestSession,
} from "~/lib/viewer-request-headers"
import { type ApolloClient, useQuery } from "@apollo/client/index"
import { useContext, useEffect, useState } from "react"
import { MenuItemLink } from "~/routes/($lang)._main._index/components/menu-item-link"
import { useTheme } from "~/components/theme-provider"
import { useLocation, useNavigate, Link } from "@remix-run/react"
import { useTranslation } from "~/hooks/use-translation"
import { useLocale } from "~/hooks/use-locale"
import { buildLocalePath } from "~/utils/locale-path"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"
import { ScrollArea } from "~/components/ui/scroll-area"
import { graphql } from "gql.tada"
import { userNavigationStyles } from "./user-navigation-styles"

type Props = {
  onLogout(): void
}

/**
 * 最後に取れたコイン残高（メニューを開き直したときにすぐ出す）
 */
const lastCoinBalance: { free: number | null; premium: number | null } = {
  free: null,
  premium: null,
}

/**
 * ヘッダーのナビゲーションメニューの内容部分（アイコン部分を除く）
 * HomeUserNavigationMenuから分離された最新の実装
 */
export function UserNavigationMenuContent(props: Props) {
  const authContext = useContext(AuthContext)
  // 前に開いたときの残高をすぐ出し、裏で取り直す
  const [freeCoinBalance, setFreeCoinBalance] = useState<number | null>(
    lastCoinBalance.free,
  )
  const [premiumCoinBalance, setPremiumCoinBalance] = useState<number | null>(
    lastCoinBalance.premium,
  )

  const { data, error: viewerError } = useQuery(viewerUserQuery, {
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
    if (!import.meta.env.DEV) return
    if (!viewerError) return

    console.error("[UserNavigationMenuContent] viewerUserQuery failed", {
      message: viewerError.message,
      graphQLErrors: viewerError.graphQLErrors,
      networkError: viewerError.networkError,
    })
  }, [viewerError])

  useEffect(() => {
    const loadCoinSummary = async () => {
      if (authContext.isLoading || authContext.isNotLoggedIn) {
        if (!hasViewerRequestSession()) {
          setFreeCoinBalance(null)
          setPremiumCoinBalance(null)
          return
        }
      }

      if (!hasViewerRequestSession()) {
        setFreeCoinBalance(null)
        setPremiumCoinBalance(null)
        return
      }

      try {
        const response = await fetch("/api/coins/summary", {
          headers: {
            ...(await getViewerRequestHeaders()),
          },
        })

        const json = (await response.json()) as {
          error: string | null
          data?: { freeBalance?: number; premiumBalance?: number }
        }

        if (!response.ok || json.error) {
          throw new Error(json.error ?? "Failed to load coins")
        }

        lastCoinBalance.free = json.data?.freeBalance ?? 0
        lastCoinBalance.premium = json.data?.premiumBalance ?? 0
        setFreeCoinBalance(lastCoinBalance.free)
        setPremiumCoinBalance(lastCoinBalance.premium)
      } catch {
        // 取れなかったときは前の値のまま
      }
    }

    loadCoinSummary()
  }, [authContext.isLoading, authContext.isNotLoggedIn, authContext.login])

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
  const avatarFrame = data?.viewer?.user?.avatarFrame ?? null
  const featurePromptonRequest =
    userSetting?.userSetting?.featurePromptonRequest ?? false
  const viewerUserToken = tokenData?.viewer?.token
  const _isSensitiveToggleVisible =
    typeof window !== "undefined" ? location.pathname !== "/generation" : true

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
    if (typeof document !== "undefined") {
      document.cookie = `locale=${locale}; path=/; max-age=31536000; SameSite=Lax`
    }

    const newUrl = `${buildLocalePath(
      locale === "en" ? "en" : "ja",
      location.pathname,
    )}${location.search}${location.hash}`

    if (`${location.pathname}${location.search}${location.hash}` !== newUrl) {
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

  const coinLabel = (
    <span className="inline-flex items-center gap-1">
      <CoinIcon className="h-4 w-4 shrink-0" />
      <span>{t("フリーコイン", "Free Coins")}</span>
    </span>
  )

  if (authContext.isNotLoggedIn) {
    return null
  }

  // ユーザー情報を待たずにメニューを出す（取れるまではログイン時の情報で表示する）
  const viewerLogin = data?.viewer?.user?.login ?? authContext.login ?? ""
  // トークンの login はユーザID変更後も古いままになるため、取れるまでは不変の数値IDを使う
  const myPagePath = data?.viewer?.user?.login
    ? `/users/${data.viewer.user.login}`
    : `/users/${authContext.userId ?? viewerLogin}`
  const isViewerLoading = !data?.viewer?.user && !viewerError

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
          to={getSensitiveLink(myPagePath)}
          className="absolute bottom-[-24px] left-3"
        >
          <UserAvatarWithFrame
            alt={data?.viewer?.user?.name || authContext.displayName || "User"}
            frame={avatarFrame}
            frameClassName="border-2 border-white"
            sizeClassName="h-12 w-12 cursor-pointer"
            src={withIconUrlFallback(
              iconUrl || authContext.avatarPhotoURL || "",
            )}
          />
        </Link>
      </div>

      {/* ユーザー情報セクション */}
      <div className="px-2 pb-2">
        {" "}
        {/* パディングを削減 */}
        <h3 className={userNavigationStyles.userName}>
          {data?.viewer?.user?.name || authContext.displayName}
        </h3>
        <p className={userNavigationStyles.userLogin}>@{viewerLogin}</p>
        {/* フォロー・フォロワー情報 */}
        <div className="mt-3 flex items-center gap-x-4">
          {" "}
          {/* gap を削減 */}
          <div className="text-center">
            <div className={userNavigationStyles.followCount}>
              {isViewerLoading ? "–" : followCount}
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
              {isViewerLoading ? "–" : followerCount}
            </div>
            <Link
              to={getSensitiveLink("/followers")}
              className={`cursor-pointer hover:underline ${userNavigationStyles.followLabel}`}
            >
              {t("フォロワー", "Followers")}
            </Link>
          </div>
        </div>
        <Link
          to={getSensitiveLink("/settings/points")}
          className="mt-5 flex flex-col items-start gap-2 hover:underline"
        >
          <div className="flex items-center gap-2">
            <CoinIcon className="h-5 w-5 shrink-0" />
            <span className={userNavigationStyles.followCount}>
              {freeCoinBalance ?? "-"}
            </span>
            <span className={userNavigationStyles.followLabel}>
              {t("フリーコイン", "Free Coins")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <PremiumCoinIcon className="h-5 w-5 shrink-0" />
            <span className={userNavigationStyles.followCount}>
              {premiumCoinBalance ?? "-"}
            </span>
            <span className={userNavigationStyles.followLabel}>
              {t("プレミアムコイン", "Premium Coins")}
            </span>
          </div>
        </Link>
      </div>

      <ScrollArea className="max-h-[40vh] overflow-y-auto p-1 sm:max-h-[50vh] md:max-h-none">
        <MenuItemLink
          href={getSensitiveLink(myPagePath)}
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
        {/* {userSetting?.userSetting &&
          (userSetting?.userSetting.preferenceRating === "R18" ||
            userSetting?.userSetting.preferenceRating === "R18G") &&
          isSensitiveToggleVisible && (
            <DropdownMenuItem asChild>
              <SensitiveToggle variant="full" className="w-full" />
            </DropdownMenuItem>
          )} */}
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
        login
        name
        followersCount
        followCount
        iconUrl
        headerImageUrl
        avatarFrame {
          id
          frameType
          backgroundStyle
          overlayImageUrl
          borderPadding
        }
        promptonUser {
          id
          name
        }
      }
    }
  }`,
)

let prefetchedAt = 0

/**
 * メニューの中身で使う情報を先に取っておく（ヘッダー表示後の空き時間・カーソルを乗せたとき）
 */
export function prefetchUserNavigationMenu(client: ApolloClient<object>) {
  // 1 分以内に取ったものはそのまま使う
  if (Date.now() - prefetchedAt < 60_000) return
  prefetchedAt = Date.now()
  for (const query of [viewerUserQuery, userSettingQuery, viewerTokenQuery]) {
    client.query({ query, fetchPolicy: "cache-first" }).catch(() => {
      prefetchedAt = 0
    })
  }
}

// default exportとして追加
export default UserNavigationMenuContent
