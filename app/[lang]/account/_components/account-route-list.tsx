import { HomeNavigationButton } from "@/app/[lang]/(main)/_components/home-navigation-button"
import { LockKeyholeIcon, SmileIcon, UserIcon } from "lucide-react"

export const AccountRouteList = () => {
  return (
    <div className="gap-y-2">
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
