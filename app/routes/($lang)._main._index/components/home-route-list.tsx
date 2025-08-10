import { Separator } from "~/components/ui/separator"
import { AuthContext } from "~/contexts/auth-context"
import { SidebarNavigationButton } from "~/components/sidebar-navigation-button"
import { Link, useNavigate, useLocation, useNavigation } from "@remix-run/react"
import {
  AwardIcon,
  BookImageIcon,
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
  TagIcon,
  SearchIcon,
  HelpCircleIcon,
} from "lucide-react"
import { useContext } from "react"
import { Button } from "~/components/ui/button"
import { useSidebar } from "~/contexts/sidebar-context"
import { useTranslation } from "~/hooks/use-translation"
import { SnsIconLink } from "~/components/sns-icon"

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

  const sensitivePath =
    typeof window !== "undefined" ? /\/r($|\/)/.test(location.pathname) : false
  const isSensitive = sensitivePath
  const title = isSensitive ? "Aipictors R18" : (propTitle ?? "Aipictors")

  const getSensitiveLink = (path: string) =>
    /^\/r($|\s)/.test(path) ? "" : sensitivePath ? `/r${path}` : path

  const createLink = (path: string) =>
    isSensitive && !["/about", "/terms"].includes(path) ? `/r${path}` : path

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
      <div className="sticky top-[-16px] z-10 mb-4 flex items-center justify-start bg-background">
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

      <SidebarNavigationButton
        href={createLink("/search")}
        icon={SearchIcon}
        onClick={closeHeaderMenu}
      >
        {t("検索", "Search")}
      </SidebarNavigationButton>

      {/* R18モード時の全年齢戻るボタン */}
      {/* {isSensitive && (
        <SidebarNavigationButton
          href={"/"}
          icon={RefreshCcwIcon}
          className="border-2 border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 dark:border-orange-700 dark:bg-orange-950 dark:text-orange-300 dark:hover:bg-orange-900"
        >
          {t("全年齢に戻る", "Back to All Ages")}
        </SidebarNavigationButton>
      )} */}

      <SidebarNavigationButton
        href={createLink("/themes")}
        icon={LightbulbIcon}
        onClick={closeHeaderMenu}
      >
        {t("お題", "Themes")}
      </SidebarNavigationButton>

      <SidebarNavigationButton
        href={createLink("/tags")}
        icon={TagIcon}
        onClick={closeHeaderMenu}
      >
        {t("タグ", "Tags")}
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

      <SidebarNavigationButton
        href={createLink("/help")}
        icon={HelpCircleIcon}
        onClick={closeHeaderMenu}
      >
        {t("使い方ガイド", "User Guide")}
      </SidebarNavigationButton>

      {/* Separator */}
      {sidebarState === "expanded" && (
        <div className="px-3 py-1">
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

      {/* Separator (auth) */}
      {authContext.isNotLoading && sidebarState === "expanded" && (
        <div className="px-3 py-1">
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

            {/* SNSアイコン */}
            <div className="flex items-center gap-x-2">
              <SnsIconLink url="https://x.com/AIPICTORS" />
              <SnsIconLink url="https://discord.gg/hcQggQEYfn" />
              <SnsIconLink url="https://github.com/aipictors" />
            </div>

            <Link className="text-xs opacity-80" to="/about">
              {t("概要", "About")}
            </Link>
            <Link className="text-xs opacity-80" to="/help">
              {t("使い方ガイド", "User Guide")}
            </Link>
            <Link className="text-xs opacity-80" to="/terms">
              {t("利用規約", "Terms")}
            </Link>
            <Link className="text-xs opacity-80" to="/privacy">
              {t("プライバシーポリシー", "Privacy Policy")}
            </Link>
            <p className="text-xs opacity-80">©2025 Aipictors Co.,Ltd.</p>
          </div>
        </footer>
      )}
    </div>
  )
}
