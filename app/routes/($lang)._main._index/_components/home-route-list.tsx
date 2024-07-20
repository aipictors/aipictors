import React, { useContext } from "react"
import { LoginDialogButton } from "@/_components/login-dialog-button"
import { NavigationLogoutDialogButton } from "@/_components/logout-navigation-dialog-button"
import { Separator } from "@/_components/ui/separator"
import { config } from "@/config"
import { HomeNavigationButton } from "@/routes/($lang)._main._index/_components/home-navigation-button"
import {
  AwardIcon,
  BookImageIcon,
  BoxIcon,
  GemIcon,
  HomeIcon,
  ImageIcon,
  LightbulbIcon,
  MessageCircleIcon,
  RocketIcon,
  SettingsIcon,
  StampIcon,
  UserIcon,
} from "lucide-react"
import { AuthContext } from "@/_contexts/auth-context"
import type { AuthContextType } from "@/_contexts/auth-context"

const navItems = [
  { href: "/", icon: HomeIcon, label: "ホーム" },
  {
    href: "/themes",
    icon: LightbulbIcon,
    label: "創作アイデア",
    isDisabled: config.isReleaseMode,
  },
  { href: "/stickers", icon: StampIcon, label: "スタンプ広場" },
  {
    href: "/rankings",
    icon: AwardIcon,
    label: "ランキング",
    isDisabled: config.isReleaseMode,
  },
  { href: "/milestones", icon: RocketIcon, label: "開発予定" },
  { href: "/releases", icon: RocketIcon, label: "更新情報" },
  {
    href: "/generation",
    icon: AwardIcon,
    label: "画像生成",
    isDisabled: config.isReleaseMode,
  },
  {
    href: "/posts/2d",
    icon: ImageIcon,
    label: "イラスト",
    isDisabled: config.isReleaseMode,
  },
  {
    href: "/posts/2.5d",
    icon: BookImageIcon,
    label: "フォト",
    isDisabled: config.isReleaseMode,
  },
  { href: "/sensitive", icon: BoxIcon, label: "センシティブ" },
  {
    href: "/account/login",
    icon: UserIcon,
    label: "アカウント",
    authRequired: true,
  },
  {
    href: "/support/chat",
    icon: MessageCircleIcon,
    label: "お問い合わせ",
    authRequired: true,
  },
  { href: "/plus", icon: GemIcon, label: "Aipictors+" },
  {
    href: "/settings/restriction",
    icon: SettingsIcon,
    label: "設定",
    authRequired: true,
  },
]

const RenderNavItems = ({ authContext }: { authContext: AuthContextType }) => (
  <>
    {navItems.map((item, index) => {
      if (item.authRequired && !authContext.isLoggedIn) return null
      return (
        // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
        <React.Fragment key={index}>
          <HomeNavigationButton
            href={item.href}
            icon={item.icon}
            isDisabled={item.isDisabled}
          >
            {item.label}
          </HomeNavigationButton>
          <div className="py-2">
            <Separator />
          </div>
        </React.Fragment>
      )
    })}
  </>
)

export const HomeRouteList = () => {
  const authContext = useContext<AuthContextType>(AuthContext)

  return (
    <div className="space-y-1">
      {authContext.isNotLoggedIn && (
        <>
          <LoginDialogButton variant="secondary" isWidthFull />
          <div className="py-2">
            <Separator />
          </div>
        </>
      )}
      <RenderNavItems authContext={authContext} />
      {authContext.isLoggedIn && <NavigationLogoutDialogButton />}
    </div>
  )
}
