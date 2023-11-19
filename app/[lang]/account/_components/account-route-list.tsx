import { HomeNavigationButton } from "@/app/[lang]/(main)/_components/home-navigation-button"
import { LockKeyhole, Smile, User } from "lucide-react"

export const AccountRouteList = () => {
  return (
    <div className="space-y-4">
      <HomeNavigationButton href={"/account/login"} icon={Smile}>
        {"ユーザID"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/account/password"} icon={LockKeyhole}>
        {"パスワード"}
      </HomeNavigationButton>
      <HomeNavigationButton
        isDisabled={true}
        href={"/account/profile"}
        icon={User}
      >
        {"プロフィール"}
      </HomeNavigationButton>
    </div>
  )
}
