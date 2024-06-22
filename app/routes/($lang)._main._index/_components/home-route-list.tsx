import { LoginNavigationButton } from "@/_components/login-navitation-button"
import { NavigationLogoutDialogButton } from "@/_components/logout-navigation-dialog-button"
import { Separator } from "@/_components/ui/separator"
import { AuthContext } from "@/_contexts/auth-context"
import { config } from "@/config"
import { HomeNavigationButton } from "@/routes/($lang)._main._index/_components/home-navigation-button"
import {
  RiDiscordLine,
  RiThreadsLine,
  RiTwitterXLine,
  RiYoutubeLine,
} from "@remixicon/react"
import {
  AwardIcon,
  BookImageIcon,
  BoxIcon,
  FolderIcon,
  GemIcon,
  HomeIcon,
  ImageIcon,
  LibraryBigIcon,
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
      <HomeNavigationButton
        isDisabled={config.isReleaseMode}
        href={"/albums"}
        icon={LibraryBigIcon}
      >
        {"シリーズ"}
      </HomeNavigationButton>
      <HomeNavigationButton
        isDisabled={config.isReleaseMode}
        href={"/collections"}
        icon={FolderIcon}
      >
        {"コレクション"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/milestones"} icon={RocketIcon}>
        {"開発予定"}
      </HomeNavigationButton>
      <div className={"py-2"}>
        <Separator />
      </div>
      <HomeNavigationButton
        isDisabled={config.isReleaseMode}
        href={"/works/2d"}
        icon={ImageIcon}
      >
        {"イラスト"}
      </HomeNavigationButton>
      <HomeNavigationButton
        isDisabled={config.isReleaseMode}
        href={"/works/2.5d"}
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
      {authContext.isNotLoggedIn && <LoginNavigationButton />}
      <div className="py-2">
        <Separator />
      </div>
      <HomeNavigationButton
        icon={RiTwitterXLine}
        href={"https://twitter.com/Aipictors"}
      >
        {"Twitter"}
      </HomeNavigationButton>
      <HomeNavigationButton
        icon={RiDiscordLine}
        href={"https://discord.gg/CsSbTHYY"}
      >
        {"Discord"}
      </HomeNavigationButton>
      <HomeNavigationButton
        href={"https://www.threads.net/@aipictors"}
        icon={RiThreadsLine}
      >
        {"Threads"}
      </HomeNavigationButton>
      <HomeNavigationButton
        href={"https://www.youtube.com/@aipictors"}
        icon={RiYoutubeLine}
      >
        {"YouTube"}
      </HomeNavigationButton>
    </div>
  )
}
