import { LoginDialogButton } from "~/components/login-dialog-button"
import { NavigationLogoutDialogButton } from "~/components/logout-navigation-dialog-button"
import { Separator } from "~/components/ui/separator"
import { AuthContext } from "~/contexts/auth-context"
import { config } from "~/config"
import { HomeNavigationButton } from "~/routes/($lang)._main._index/components/home-navigation-button"
import { Link } from "@remix-run/react"
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

type Props = {
  onClickMenuItem?: () => void
}

export const HomeRouteList = (props: Props) => {
  const authContext = useContext(AuthContext)

  const closeHeaderMenu = () => {
    if (props.onClickMenuItem) {
      console.log("closeHeaderMenu")
      props.onClickMenuItem()
    }
  }

  return (
    <div className="h-[80vh] w-full space-y-1 pr-4 pb-16 md:w-40">
      {authContext.isNotLoggedIn && (
        <>
          <LoginDialogButton variant="secondary" isWidthFull />
          <div className={"py-2"}>
            <Separator />
          </div>
        </>
      )}
      <HomeNavigationButton
        onClick={closeHeaderMenu}
        href={"/"}
        icon={HomeIcon}
      >
        {"ホーム"}
      </HomeNavigationButton>
      <HomeNavigationButton
        isDisabled={config.isReleaseMode}
        href={"/themes"}
        icon={LightbulbIcon}
        onClick={closeHeaderMenu}
      >
        {"創作アイデア"}
      </HomeNavigationButton>
      <HomeNavigationButton
        onClick={closeHeaderMenu}
        href={"/stickers"}
        icon={StampIcon}
      >
        {"スタンプ広場"}
      </HomeNavigationButton>
      <HomeNavigationButton
        isDisabled={config.isReleaseMode}
        href={"/rankings"}
        icon={AwardIcon}
        onClick={closeHeaderMenu}
      >
        {"ランキング"}
      </HomeNavigationButton>
      <HomeNavigationButton
        onClick={closeHeaderMenu}
        href={"/milestones"}
        icon={RocketIcon}
      >
        {"開発予定"}
      </HomeNavigationButton>
      <HomeNavigationButton
        onClick={closeHeaderMenu}
        href={"/releases"}
        icon={RocketIcon}
      >
        {"更新情報"}
      </HomeNavigationButton>
      <HomeNavigationButton
        isDisabled={config.isReleaseMode}
        href={"/generation"}
        icon={AwardIcon}
        onClick={closeHeaderMenu}
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
        onClick={closeHeaderMenu}
      >
        {"イラスト"}
      </HomeNavigationButton>
      <HomeNavigationButton
        isDisabled={config.isReleaseMode}
        href={"/posts/2.5d"}
        icon={BookImageIcon}
        onClick={closeHeaderMenu}
      >
        {"フォト"}
      </HomeNavigationButton>
      <HomeNavigationButton
        href={"/sensitive"}
        icon={BoxIcon}
        onClick={closeHeaderMenu}
      >
        {"センシティブ"}
      </HomeNavigationButton>
      {authContext.isNotLoading && (
        <div className={"py-2"}>
          <Separator />
        </div>
      )}
      {authContext.isLoggedIn && (
        <HomeNavigationButton
          href={"/settings/account/login"}
          icon={UserIcon}
          onClick={closeHeaderMenu}
        >
          {"アカウント"}
        </HomeNavigationButton>
      )}
      {authContext.isLoggedIn && (
        <HomeNavigationButton
          href={"/support/chat"}
          icon={MessageCircleIcon}
          onClick={closeHeaderMenu}
        >
          {"お問い合わせ"}
        </HomeNavigationButton>
      )}
      <HomeNavigationButton
        href={"/plus"}
        icon={GemIcon}
        onClick={closeHeaderMenu}
      >
        {"Aipictors+"}
      </HomeNavigationButton>
      {authContext.isLoggedIn && (
        <HomeNavigationButton
          href={"/settings/restriction"}
          icon={SettingsIcon}
          onClick={closeHeaderMenu}
        >
          {"設定"}
        </HomeNavigationButton>
      )}
      {authContext.isLoggedIn && <NavigationLogoutDialogButton />}
      <footer>
        <div className="flex flex-col space-y-2 p-2">
          <Link className="text-xs opacity-80" to="/about">
            {"概要"}
          </Link>
          <Link className="text-xs opacity-80" to="/terms">
            {"利用規約"}
          </Link>
          <p className="text-xs opacity-80">{"©2024 Aipictors Co.,Ltd."}</p>
        </div>
      </footer>
    </div>
  )
}
