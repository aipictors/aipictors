import { LoginDialogButton } from "@/_components/login-dialog-button"
import { NavigationLogoutDialogButton } from "@/_components/logout-navigation-dialog-button"
import { Separator } from "@/_components/ui/separator"
import { AuthContext } from "@/_contexts/auth-context"
import { config } from "@/config"
import { HomeNavigationButton } from "@/routes/($lang)._main._index/_components/home-navigation-button"
import {} from "@remixicon/react"
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
import { useContext } from "react"

export const HomeRouteList = () => {
  const authContext = useContext(AuthContext)

  return (
    <div className="space-y-1">
      {authContext.isNotLoggedIn && (
        <>
          <LoginDialogButton variant="secondary" isWidthFull />
          <div className={"py-2"}>
            <Separator />
          </div>
        </>
      )}
      <HomeNavigationButton href={"/"} icon={HomeIcon}>
        {"ホーム"}
      </HomeNavigationButton>
      <HomeNavigationButton
        isDisabled={config.isReleaseMode}
        href={"/themes"}
        icon={LightbulbIcon}
      >
        {"創作アイデア"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/stickers"} icon={StampIcon}>
        {"スタンプ広場"}
      </HomeNavigationButton>
      <HomeNavigationButton
        isDisabled={config.isReleaseMode}
        href={"/rankings"}
        icon={AwardIcon}
      >
        {"ランキング"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/milestones"} icon={RocketIcon}>
        {"開発予定"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/releases"} icon={RocketIcon}>
        {"更新情報"}
      </HomeNavigationButton>
      <HomeNavigationButton
        isDisabled={config.isReleaseMode}
        href={"/generation"}
        icon={AwardIcon}
      >
        {"画像生成"}
      </HomeNavigationButton>
      <div className={"py-2"}>
        <Separator />
      </div>
      <HomeNavigationButton
        isDisabled={config.isReleaseMode}
        href={"/posts/2d"}
        icon={ImageIcon}
      >
        {"イラスト"}
      </HomeNavigationButton>
      <HomeNavigationButton
        isDisabled={config.isReleaseMode}
        href={"/posts/2.5d"}
        icon={BookImageIcon}
      >
        {"フォト"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/sensitive"} icon={BoxIcon}>
        {"センシティブ"}
      </HomeNavigationButton>
      {authContext.isNotLoading && (
        <div className={"py-2"}>
          <Separator />
        </div>
      )}
      {authContext.isLoggedIn && (
        <HomeNavigationButton href={"/account/login"} icon={UserIcon}>
          {"アカウント"}
        </HomeNavigationButton>
      )}
      {authContext.isLoggedIn && (
        <HomeNavigationButton href={"/support/chat"} icon={MessageCircleIcon}>
          {"お問い合わせ"}
        </HomeNavigationButton>
      )}
      <HomeNavigationButton href={"/plus"} icon={GemIcon}>
        {"Aipictors+"}
      </HomeNavigationButton>
      {authContext.isLoggedIn && (
        <HomeNavigationButton
          href={"/settings/restriction"}
          icon={SettingsIcon}
        >
          {"設定"}
        </HomeNavigationButton>
      )}
      {authContext.isLoggedIn && <NavigationLogoutDialogButton />}
    </div>
  )
}
