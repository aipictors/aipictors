import { HomeNavigationButton } from "~/routes/($lang)._main._index/components/home-navigation-button"
import {
  ArrowLeftIcon,
  LockKeyholeIcon,
  SmileIcon,
  UserIcon,
} from "lucide-react"

export const AccountRouteList = () => {
  return (
    <div className="space-y-1">
      <HomeNavigationButton href={"/"} icon={ArrowLeftIcon}>
        {"もどる"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/settings/account/login"} icon={SmileIcon}>
        {"ユーザID"}
      </HomeNavigationButton>
      <HomeNavigationButton
        href={"settings/account/password"}
        icon={LockKeyholeIcon}
      >
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
