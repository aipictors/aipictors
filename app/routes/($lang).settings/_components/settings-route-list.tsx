import { HomeNavigationButton } from "@/routes/($lang)._main._index/_components/home-navigation-button"
import {
  ArrowLeftIcon,
  BellIcon,
  BookmarkXIcon,
  ImageIcon,
  MedalIcon,
  StickerIcon,
  UserXIcon,
} from "lucide-react"

export const SettingsRouteList = () => {
  return (
    <div className="space-y-1">
      <HomeNavigationButton href={"/generation"} icon={ArrowLeftIcon}>
        {"もどる"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/settings/notification"} icon={BellIcon}>
        {"通知・いいね"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/settings/restriction"} icon={ImageIcon}>
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
      <HomeNavigationButton href={"/settings/sticker"} icon={StickerIcon}>
        {"スタンプ"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/settings/request"} icon={MedalIcon}>
        {"チップを受け取る"}
      </HomeNavigationButton>
    </div>
  )
}
