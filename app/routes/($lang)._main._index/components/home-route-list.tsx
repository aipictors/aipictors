import { Separator } from "~/components/ui/separator"
import { AuthContext } from "~/contexts/auth-context"
import { SidebarNavigationButton } from "~/components/sidebar-navigation-button"
import { Link, useNavigate, useLocation, useNavigation } from "@remix-run/react"
import {
  AwardIcon,
  BookImageIcon,
  BoxIcon,
  HomeIcon,
  Image,
  ImageIcon,
  LightbulbIcon,
  Loader2Icon,
  RocketIcon,
  StampIcon,
  StarIcon,
  MenuIcon,
  ChevronLeftIcon,
} from "lucide-react"
import { useContext } from "react"
import { useTranslation } from "~/hooks/use-translation"
import { Button } from "~/components/ui/button"
import { useSidebar } from "~/contexts/sidebar-context"

type Props = {
  title?: string
  onClickMenuItem?: () => void
}

export function HomeRouteList({ title: propTitle, onClickMenuItem }: Props) {
  const authContext = useContext(AuthContext)
  const navigation = useNavigation()
  const location = useLocation()
  const navigate = useNavigate()
  const t = useTranslation()
  const { sidebarState, toggleSidebar, minimizeSidebar } = useSidebar()

  const sensitivePath = /\/r($|\/)/.test(location.pathname)
  const isSensitive = sensitivePath
  const title = isSensitive ? "Aipictors R18" : (propTitle ?? "Aipictors")

  const getSensitiveLink = (path: string) =>
    /^\/r($|\s)/.test(path) ? "" : sensitivePath ? `/r${path}` : path

  const createLink = (path: string) =>
    isSensitive && !["/about", "/terms"].includes(path) ? `/r${path}` : path

  const toggleSensitive = () => {
    // biome-ignore lint/suspicious/noDocumentCookie: required for cookie management
    document.cookie = "sensitive=1; max-age=0; path=/"
    const newUrl = location.pathname.replace("/r", "")
    navigate(newUrl === "" ? "/" : newUrl, { replace: true })
  }

  const closeHeaderMenu = () => onClickMenuItem?.()

  // サイドバーの幅を状態に応じて決定
  const sidebarWidth = () => {
    switch (sidebarState) {
      case "expanded":
        return "w-[216px]"
      case "collapsed":
        return "w-16" // アイコンサイズに合わせて幅を縮小
      case "minimal":
        return "w-16"
      default:
        return "w-[216px]"
    }
  }

  // 最小化状態では三角ボタンのみ表示（absoluteで配置）
  if (sidebarState === "minimal") {
    return (
      <>
        {/* 三角ボタンのみ絶対配置 - ヘッダーのロゴと被らないように左端に配置 */}
        <div className="fixed top-4 left-2 z-50 hidden md:block">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8 bg-background/80 shadow-md backdrop-blur-sm"
          >
            <ChevronLeftIcon className="size-4 rotate-180" />
          </Button>
        </div>
      </>
    )
  }

  return (
    <div
      className={`fixed top-0 hidden h-screen flex-col space-y-1 overflow-y-auto bg-background px-2 pt-4 transition-[width] duration-200 sm:z-30 md:z-40 md:flex lg:flex ${sidebarWidth()}`}
    >
      {/* Logo with Toggle Button */}
      <div className="mb-10 flex items-center justify-start">
        {/* 三本線ボタン（ロゴの左に表示） - PC版で常に表示 */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={sidebarState === "collapsed" ? "h-8 w-8" : "mr-2 h-8 w-8"}
        >
          <MenuIcon className="size-4" />
        </Button>

        {/* 三角ボタン（省略状態の時のみ表示） - PC版で表示 */}
        {sidebarState === "collapsed" && (
          <Button
            variant="ghost"
            size="icon"
            onClick={minimizeSidebar}
            className="ml-2 h-8 w-8"
          >
            <ChevronLeftIcon className="size-4" />
          </Button>
        )}

        {/* ロゴ（展開状態のみ表示） */}
        {sidebarState === "expanded" && (
          <Button
            variant="ghost"
            className="flex items-center space-x-2 p-0"
            onClick={() => navigate(getSensitiveLink("/"))}
          >
            {navigation.state === "loading" ? (
              <Loader2Icon className="size-8 animate-spin" />
            ) : (
              <img
                src="/icon.svg"
                className="size-8 rounded-full"
                alt="Avatar"
                width={40}
                height={40}
              />
            )}
            <span className="font-bold text-xl">{title}</span>
          </Button>
        )}
      </div>

      {/* Navigation Items */}
      <SidebarNavigationButton href={isSensitive ? "/r" : "/"} icon={HomeIcon}>
        {t("ホーム", "Home")}
        {isSensitive && " - R18"}
      </SidebarNavigationButton>

      {isSensitive && (
        <SidebarNavigationButton
          onClick={toggleSensitive}
          href={"/"}
          icon={HomeIcon}
        >
          {t("ホーム - 全年齢", "Home - G")}
        </SidebarNavigationButton>
      )}

      <SidebarNavigationButton
        href={createLink("/themes")}
        icon={LightbulbIcon}
        onClick={closeHeaderMenu}
      >
        {t("お題", "Themes")}
      </SidebarNavigationButton>

      <SidebarNavigationButton
        href={createLink("/rankings")}
        icon={AwardIcon}
        onClick={closeHeaderMenu}
      >
        {t("ランキング", "Ranking")}
      </SidebarNavigationButton>

      <SidebarNavigationButton
        href={createLink("/?tab=follow-user")}
        icon={Image}
        onClick={closeHeaderMenu}
      >
        {t("フォロー新着", "Followed new posts")}
      </SidebarNavigationButton>

      <SidebarNavigationButton
        href={createLink("/stickers")}
        icon={StampIcon}
        onClick={closeHeaderMenu}
      >
        {t("スタンプ広場", "Stickers")}
      </SidebarNavigationButton>

      <SidebarNavigationButton
        href={createLink("/events")}
        icon={StarIcon}
        onClick={closeHeaderMenu}
      >
        {t("イベント", "Events")}
      </SidebarNavigationButton>

      <SidebarNavigationButton
        href={createLink("/releases")}
        icon={RocketIcon}
        onClick={closeHeaderMenu}
      >
        {t("更新情報", "Update Information")}
      </SidebarNavigationButton>

      {/* Separator */}
      {sidebarState === "expanded" && (
        <div className="px-3 py-2">
          <Separator />
        </div>
      )}

      {/* Categories */}
      <SidebarNavigationButton
        href={createLink("/posts/2d")}
        icon={ImageIcon}
        onClick={closeHeaderMenu}
      >
        {t("イラスト", "Illust")}
      </SidebarNavigationButton>

      <SidebarNavigationButton
        href={createLink("/posts/3d")}
        icon={BookImageIcon}
        onClick={closeHeaderMenu}
      >
        {t("フォト", "Photo")}
      </SidebarNavigationButton>

      <SidebarNavigationButton
        href={createLink("/r")}
        icon={BoxIcon}
        onClick={closeHeaderMenu}
      >
        {t("センシティブ", "BoxIcon")}
      </SidebarNavigationButton>

      {/* Separator (auth) */}
      {authContext.isNotLoading && sidebarState === "expanded" && (
        <div className="px-3 py-2">
          <Separator />
        </div>
      )}

      {/* Footer */}
      {sidebarState === "expanded" && (
        <footer className="mt-auto">
          <div className="flex flex-col space-y-2 p-2">
            <div className="flex items-center space-x-2">
              <Link
                target="_blank"
                rel="noopener noreferrer"
                to="https://apps.apple.com/jp/app/aipictors-ai%E3%83%94%E3%82%AF%E3%82%BF%E3%83%BC%E3%82%BA/id6466581636"
              >
                <img
                  src="/apple/download.svg"
                  alt={t("download", "download")}
                  className="h-8"
                />
              </Link>
              <Link
                target="_blank"
                rel="noopener noreferrer"
                to="https://play.google.com/store/apps/details?id=com.aipictors.app&hl=ja"
              >
                <img
                  src="/google/download.png"
                  alt={t("download", "download")}
                  className="h-10"
                />
              </Link>
            </div>

            <Link className="text-xs opacity-80" to="/about">
              {t("概要", "About")}
            </Link>
            <Link className="text-xs opacity-80" to="/terms">
              {t("利用規約", "Terms")}
            </Link>
            <p className="text-xs opacity-80">©2025 Aipictors Co.,Ltd.</p>
          </div>
        </footer>
      )}
    </div>
  )
}
