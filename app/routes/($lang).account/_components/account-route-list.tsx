import { HomeNavigationButton } from "@/routes/($lang)._main._index/_components/home-navigation-button"
import {
  ArrowLeftIcon,
  LockKeyholeIcon,
  SmileIcon,
  UserIcon,
} from "lucide-react"

export const AccountRouteList = () => {
  return (
    <div className="space-y-1">
      <HomeNavigationButton href={"/generation"} icon={ArrowLeftIcon}>
        {"もどる"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/account/login"} icon={SmileIcon}>
        {"ユーザID"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/account/password"} icon={LockKeyholeIcon}>
        {"パスワード"}
      </HomeNavigationButton>
      <HomeNavigationButton
        isDisabled={true}
        href={"/account/profile"}
        icon={UserIcon}
      >
        {"プロフィール"}
      </HomeNavigationButton>
    </div>
  )
}
