import { HomeNavigationButton } from "~/routes/($lang)._main._index/components/home-navigation-button"
import {
  ArrowLeftIcon,
  LockKeyholeIcon,
  SmileIcon,
  UserIcon,
} from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"

export function AccountRouteList() {
  const t = useTranslation()

  return (
    <div className="space-y-1">
      <HomeNavigationButton href={"/"} icon={ArrowLeftIcon}>
        {t("もどる", "Back")}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/settings/account/login"} icon={SmileIcon}>
        {t("ユーザID", "User ID")}
      </HomeNavigationButton>
      <HomeNavigationButton
        href={"settings/account/password"}
        icon={LockKeyholeIcon}
      >
        {t("パスワード", "Password")}
      </HomeNavigationButton>
      <HomeNavigationButton
        isDisabled={true}
        href={"/account/profile"}
        icon={UserIcon}
      >
        {t("プロフィール", "Profile")}
      </HomeNavigationButton>
    </div>
  )
}
