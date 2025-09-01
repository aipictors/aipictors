import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import {
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuItem,
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
import { useContext } from "react"
import { useTheme } from "next-themes"
import { MenuItemLink } from "~/routes/($lang)._main._index/components/menu-item-link"
import { useLocation, useNavigate } from "@remix-run/react"
import { useTranslation } from "~/hooks/use-translation"
import { useLocale } from "~/hooks/use-locale"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"
import { ScrollArea } from "~/components/ui/scroll-area"
import { SensitiveToggle } from "~/components/sensitive/sensitive-toggle"
import { graphql } from "gql.tada"

type Props = {
  onLogout(): void
}

/**
 * ヘッダーのナビゲーションメニューの内容部分（アイコン部分を除く）
 */
export function UserNavigationMenuContent(props: Props) {
  const authContext = useContext(AuthContext)
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const t = useTranslation()
  const locale = useLocale()

  const { data } = useQuery(viewerUserQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    errorPolicy: "all",
    notifyOnNetworkStatusChange: false,
  })

  if (authContext.isNotLoggedIn) {
    return null
  }

  const user = data?.viewer?.user

  return (
    <ScrollArea className="max-h-[40vh]">
      <div className="space-y-1 p-1">
        {/* ユーザー情報セクション */}
        <DropdownMenuLabel className="p-2">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={withIconUrlFallback(user?.iconUrl ?? "")}
                alt={user?.name ?? authContext.displayName}
              />
              <AvatarFallback>
                {(user?.name ?? authContext.displayName ?? "U").charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-1">
              <p className="font-medium text-sm">
                {user?.name ?? authContext.displayName}
              </p>
              {user && (
                <div className="space-y-1 text-muted-foreground text-xs">
                  <div className="flex space-x-2">
                    <span>フォロワー: {user.followersCount}</span>
                    <span>フォロー: {user.followCount}</span>
                  </div>
                  <div className="flex space-x-2">
                    <span>作品: {user.generatedCount}</span>
                    <span>いいね: {user.receivedLikesCount}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DropdownMenuLabel>

        {/* メニュー項目 */}
        <MenuItemLink to={`/users/${authContext.userId}`}>
          <UserIcon className="mr-2 h-4 w-4" />
          <span>{t("マイページ")}</span>
        </MenuItemLink>

        <MenuItemLink to="/dashboard">
          <SquareKanbanIcon className="mr-2 h-4 w-4" />
          <span>{t("ダッシュボード")}</span>
        </MenuItemLink>

        <MenuItemLink to="/messages">
          <MessageCircleIcon className="mr-2 h-4 w-4" />
          <span>{t("メッセージ")}</span>
        </MenuItemLink>

        <MenuItemLink to="/settings">
          <SettingsIcon className="mr-2 h-4 w-4" />
          <span>{t("設定")}</span>
        </MenuItemLink>

        <MenuItemLink to="/support/chat">
          <CoffeeIcon className="mr-2 h-4 w-4" />
          <span>{t("サポート")}</span>
        </MenuItemLink>

        <MenuItemLink to="/plus">
          <GemIcon className="mr-2 h-4 w-4" />
          <span>{t("Aipictors+")} </span>
        </MenuItemLink>

        {/* テーマ設定 */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <SunIcon className="mr-2 h-4 w-4 dark:hidden" />
            <MoonIcon className="mr-2 hidden h-4 w-4 dark:block" />
            <span>{t("テーマ")}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup
                value={theme ?? "system"}
                onValueChange={setTheme}
              >
                <DropdownMenuRadioItem value="light">
                  <SunIcon className="mr-2 h-4 w-4" />
                  <span>{t("ライトモード")}</span>
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="dark">
                  <MoonIcon className="mr-2 h-4 w-4" />
                  <span>{t("ダークモード")}</span>
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="system">
                  <UserCircleIcon className="mr-2 h-4 w-4" />
                  <span>{t("システム")}</span>
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        {/* 言語設定 */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Languages className="mr-2 h-4 w-4" />
            <span>{t("言語")}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup
                value={locale}
                onValueChange={(value) => {
                  navigate(`/${value}${location.pathname.slice(3)}`)
                }}
              >
                <DropdownMenuRadioItem value="">
                  <span>日本語</span>
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="en">
                  <span>English</span>
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        {/* センシティブ設定 */}
        <SensitiveToggle />

        {/* ログアウト */}
        <DropdownMenuItem onClick={props.onLogout}>
          <LogOutIcon className="mr-2 h-4 w-4" />
          <span>{t("ログアウト")}</span>
        </DropdownMenuItem>
      </div>
    </ScrollArea>
  )
}

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
