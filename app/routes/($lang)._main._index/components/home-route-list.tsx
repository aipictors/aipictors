import { NavigationLogoutDialogButton } from "~/components/logout-navigation-dialog-button"
import { Separator } from "~/components/ui/separator"
import { AuthContext } from "~/contexts/auth-context"
import { HomeNavigationButton } from "~/routes/($lang)._main._index/components/home-navigation-button"
import { Link, useNavigate, useLocation } from "@remix-run/react"
import {
  AwardIcon,
  BookImageIcon,
  BoxIcon,
  GemIcon,
  HomeIcon,
  Image,
  ImageIcon,
  LightbulbIcon,
  MessageCircleIcon,
  RocketIcon,
  SettingsIcon,
  StampIcon,
  StarIcon,
  UserIcon,
} from "lucide-react"
import { useContext } from "react"
import { AppConfirmDialog } from "~/components/app/app-confirm-dialog"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  onClickMenuItem?: () => void
}

export function HomeRouteList(props: Props) {
  const authContext = useContext(AuthContext)

  const location = useLocation()

  const navigate = useNavigate()

  // `sensitive` フラグが現在の URL に含まれているかチェック
  const isSensitive = /\/r($|\/)/.test(location.pathname)

  const closeHeaderMenu = () => {
    if (props.onClickMenuItem) {
      props.onClickMenuItem()
    }
  }

  // 規約や概要ページには sensitive を付けないリンクの生成関数
  const createLink = (path: string) => {
    if (isSensitive && !["/about", "/terms"].includes(path)) {
      return `/r${path}`
    }
    return path
  }

  const toggleSensitive = () => {
    // センシティブフラグを削除（Cookieの有効期限を過去に設定）
    document.cookie = "sensitive=1; max-age=0; path=/"

    // URLから/rを取り除きリダイレクト
    const newUrl = location.pathname.replace("/r", "")

    navigate(newUrl === "" ? "/" : newUrl, { replace: true }) // URLを更新してリダイレクト
  }

  const t = useTranslation()

  return (
    <div className="h-[80vh] w-full space-y-1 pr-4 pb-16">
      <HomeNavigationButton
        href={"/"}
        onClick={closeHeaderMenu}
        icon={HomeIcon}
      >
        {t("ホーム", "Home")}
        {isSensitive && " - R18"}
      </HomeNavigationButton>
      {isSensitive && (
        <HomeNavigationButton
          onClick={toggleSensitive}
          href={"/"}
          icon={HomeIcon}
        >
          {t("ホーム - 全年齢", "Home - G")}
        </HomeNavigationButton>
      )}
      <HomeNavigationButton
        href={createLink("/generation")}
        icon={AwardIcon}
        onClick={closeHeaderMenu}
      >
        {t("画像生成", "Generate image")}
      </HomeNavigationButton>
      <HomeNavigationButton
        href={createLink("/themes")}
        icon={LightbulbIcon}
        onClick={closeHeaderMenu}
      >
        {t("お題", "Themes")}
      </HomeNavigationButton>
      <HomeNavigationButton
        href={createLink("/stickers")}
        icon={StampIcon}
        onClick={closeHeaderMenu}
      >
        {t("スタンプ広場", "Stickers")}
      </HomeNavigationButton>
      <HomeNavigationButton
        href={createLink("/?tab=follow-user")}
        icon={Image}
        onClick={closeHeaderMenu}
      >
        {t("フォロー新着", "Followed new posts")}
      </HomeNavigationButton>
      <HomeNavigationButton
        href={createLink("/rankings")}
        icon={AwardIcon}
        onClick={closeHeaderMenu}
      >
        {t("ランキング", "Ranking")}
      </HomeNavigationButton>
      <HomeNavigationButton
        href={createLink("/events")}
        icon={StarIcon}
        onClick={closeHeaderMenu}
      >
        {t("イベント", "Events")}
      </HomeNavigationButton>
      <HomeNavigationButton
        href={createLink("/releases")}
        icon={RocketIcon}
        onClick={closeHeaderMenu}
      >
        {t("更新情報", "Update Information")}
      </HomeNavigationButton>
      <div className={"py-2"}>
        <Separator />
      </div>
      <HomeNavigationButton
        href={createLink("/posts/2d")}
        icon={ImageIcon}
        onClick={closeHeaderMenu}
      >
        {t("イラスト", "Illust")}
      </HomeNavigationButton>
      <HomeNavigationButton
        href={createLink("/posts/3d")}
        icon={BookImageIcon}
        onClick={closeHeaderMenu}
      >
        {t("フォト", "Photo")}
      </HomeNavigationButton>
      <AppConfirmDialog
        title={"確認"}
        description={t(
          "センシティブ版のトップページに遷移します。あなたは18歳以上ですか？",
          "You are about to navigate to the sensitive content homepage. Are you 18 years or older?",
        )}
        onNext={() => {
          navigate("/r")
          closeHeaderMenu()
        }}
        cookieKey={"check-sensitive"}
        onCancel={() => {}}
      >
        <HomeNavigationButton icon={BoxIcon}>
          {t("センシティブ", "Sensitive")}
        </HomeNavigationButton>
      </AppConfirmDialog>

      {authContext.isNotLoading && (
        <div className={"py-2"}>
          <Separator />
        </div>
      )}
      {authContext.isLoggedIn && (
        <HomeNavigationButton
          href={createLink("/settings/account/login")}
          icon={UserIcon}
          onClick={closeHeaderMenu}
        >
          {t("アカウント", "Account")}
        </HomeNavigationButton>
      )}
      {authContext.isLoggedIn && (
        <HomeNavigationButton
          href={createLink("/support/chat")}
          icon={MessageCircleIcon}
          onClick={closeHeaderMenu}
        >
          {t("お問い合わせ", "Contact")}
        </HomeNavigationButton>
      )}
      <HomeNavigationButton
        href={createLink("/plus")}
        icon={GemIcon}
        onClick={closeHeaderMenu}
      >
        {"Aipictors+"}
      </HomeNavigationButton>
      {authContext.isLoggedIn && (
        <HomeNavigationButton
          href={createLink("/settings")}
          icon={SettingsIcon}
          onClick={closeHeaderMenu}
        >
          {t("設定", "Settings")}
        </HomeNavigationButton>
      )}
      {authContext.isLoggedIn && <NavigationLogoutDialogButton />}
      <footer>
        <div className="flex flex-col space-y-2 p-2">
          <Link className="text-xs opacity-80" to="/about">
            {t("概要", "About")}
          </Link>
          <Link className="text-xs opacity-80" to="/terms">
            {t("利用規約", "Terms")}
          </Link>
          <p className="text-xs opacity-80">{"©2024 Aipictors Co.,Ltd."}</p>
        </div>
      </footer>
    </div>
  )
}
