import { config } from "@/config"
import { HomeNavigationButton } from "@/routes/($lang)._main._index/_components/home-navigation-button"
import {
  ArrowLeftIcon,
  BellIcon,
  BookmarkXIcon,
  ImageIcon,
  MedalIcon,
  UserXIcon,
} from "lucide-react"

export const SettingsRouteList = () => {
  return (
    <div className="space-y-1">
      <HomeNavigationButton href={"/generation"} icon={ArrowLeftIcon}>
        {"もどる"}
      </HomeNavigationButton>
      <HomeNavigationButton
        isDisabled={config.isReleaseMode}
        href={"/settings/notification"}
        icon={BellIcon}
      >
        {"通知・いいね"}
      </HomeNavigationButton>
      <HomeNavigationButton
        isDisabled={config.isReleaseMode}
        href={"/settings/restriction"}
        icon={ImageIcon}
      >
        {"表示コンテンツ"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/settings/profile"} icon={ImageIcon}>
        {"プロフィール"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/settings/muted/users"} icon={UserXIcon}>
        {"ユーザミュート"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/settings/muted/tags"} icon={BookmarkXIcon}>
        {"タグミュート"}
      </HomeNavigationButton>
      <HomeNavigationButton
        isDisabled={config.isReleaseMode}
        href={"/settings/request"}
        icon={MedalIcon}
      >
        {"支援リクエスト"}
      </HomeNavigationButton>
    </div>
  )
}
