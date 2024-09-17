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

type Props = {
  onClickMenuItem?: () => void
}

export function HomeRouteList(props: Props) {
  const authContext = useContext(AuthContext)

  const location = useLocation()

  const navigate = useNavigate()

  // `sensitive` フラグが現在の URL に含まれているかチェック
  const isSensitive = location.pathname.includes("/porn")

  const closeHeaderMenu = () => {
    if (props.onClickMenuItem) {
      props.onClickMenuItem()
    }
  }

  // 規約や概要ページには sensitive を付けないリンクの生成関数
  const createLink = (path: string) => {
    if (isSensitive && !["/about", "/terms"].includes(path)) {
      return `/porn${path}`
    }
    return path
  }

  const toggleSensitive = () => {
    // センシティブフラグを削除（Cookieの有効期限を過去に設定）
    document.cookie = "sensitive=1; max-age=0; path=/"

    // URLから/pornを取り除きリダイレクト
    const newUrl = location.pathname.replace("/porn", "")

    navigate(newUrl === "" ? "/" : newUrl, { replace: true }) // URLを更新してリダイレクト
  }

  return (
    <div className="h-[80vh] w-full space-y-1 pr-4 pb-16">
      <HomeNavigationButton onClick={closeHeaderMenu} icon={HomeIcon}>
        {"ホーム"}
        {isSensitive && " - R18"}
      </HomeNavigationButton>
      {isSensitive && (
        <HomeNavigationButton
          onClick={toggleSensitive}
          href={"/"}
          icon={HomeIcon}
        >
          {"ホーム - 全年齢"}
        </HomeNavigationButton>
      )}
      <HomeNavigationButton
        href={createLink("/generation")}
        icon={AwardIcon}
        onClick={closeHeaderMenu}
      >
        {"画像生成"}
      </HomeNavigationButton>
      <HomeNavigationButton
        href={createLink("/themes")}
        icon={LightbulbIcon}
        onClick={closeHeaderMenu}
      >
        {"お題"}
      </HomeNavigationButton>
      <HomeNavigationButton
        href={createLink("/stickers")}
        icon={StampIcon}
        onClick={closeHeaderMenu}
      >
        {"スタンプ広場"}
      </HomeNavigationButton>
      <HomeNavigationButton
        href={createLink("/?tab=follow-user")}
        icon={Image}
        onClick={closeHeaderMenu}
      >
        {"フォロー新着"}
      </HomeNavigationButton>
      <HomeNavigationButton
        href={createLink("/rankings")}
        icon={AwardIcon}
        onClick={closeHeaderMenu}
      >
        {"ランキング"}
      </HomeNavigationButton>
      <HomeNavigationButton
        href={createLink("/events")}
        icon={StarIcon}
        onClick={closeHeaderMenu}
      >
        {"イベント"}
      </HomeNavigationButton>
      <HomeNavigationButton
        href={createLink("/milestones")}
        icon={RocketIcon}
        onClick={closeHeaderMenu}
      >
        {"開発予定"}
      </HomeNavigationButton>
      <HomeNavigationButton
        href={createLink("/releases")}
        icon={RocketIcon}
        onClick={closeHeaderMenu}
      >
        {"更新情報"}
      </HomeNavigationButton>
      <div className={"py-2"}>
        <Separator />
      </div>
      <HomeNavigationButton
        href={createLink("/posts/2d")}
        icon={ImageIcon}
        onClick={closeHeaderMenu}
      >
        {"イラスト"}
      </HomeNavigationButton>
      <HomeNavigationButton
        href={createLink("/posts/3d")}
        icon={BookImageIcon}
        onClick={closeHeaderMenu}
      >
        {"フォト"}
      </HomeNavigationButton>
      <AppConfirmDialog
        title={"確認"}
        description={
          "センシティブ版のトップページに遷移します。あなたは18歳以上ですか？"
        }
        onNext={() => {
          navigate("/porn")
          closeHeaderMenu()
        }}
        cookieKey={"check-sensitive"}
        onCancel={() => {}}
      >
        <HomeNavigationButton icon={BoxIcon}>
          {"センシティブ"}
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
          {"アカウント"}
        </HomeNavigationButton>
      )}
      {authContext.isLoggedIn && (
        <HomeNavigationButton
          href={createLink("/support/chat")}
          icon={MessageCircleIcon}
          onClick={closeHeaderMenu}
        >
          {"お問い合わせ"}
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
