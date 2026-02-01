import { Link, useLocation, useNavigate, useNavigation } from "@remix-run/react"
import {
  AwardIcon,
  BookImageIcon,
  HeartIcon,
  HelpCircleIcon,
  HomeIcon,
  Image,
  ImageIcon,
  InfoIcon,
  LightbulbIcon,
  Loader2Icon,
  RefreshCcwIcon,
  RocketIcon,
  SearchIcon,
  StampIcon,
  StarIcon,
  TagIcon,
} from "lucide-react"
import { useContext } from "react"
import { SnsIconLink } from "~/components/sns-icon"
import { Button } from "~/components/ui/button"
import { Separator } from "~/components/ui/separator"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { HomeMenuNavigationButton } from "~/routes/($lang)._main._index/components/home-menu-navigation-button"

type Props = {
  title?: string
  onClickMenuItem?: () => void
}

export function HomeMenuRouteList({
  title: propTitle,
  onClickMenuItem,
}: Props) {
  const authContext = useContext(AuthContext)

  const navigation = useNavigation()

  const location = useLocation()

  const navigate = useNavigate()

  const t = useTranslation()

  const sensitivePath =
    typeof window !== "undefined" ? /\/r($|\/)/.test(location.pathname) : false

  const isSensitive = sensitivePath

  const title = isSensitive ? "Aipictors R18" : (propTitle ?? "Aipictors")

  const getSensitiveLink = (path: string) =>
    /^\/r($|\s)/.test(path) ? "" : sensitivePath ? `/r${path}` : path

  const createLink = (path: string) =>
    isSensitive && !["/about", "/terms"].includes(path) ? `/r${path}` : path

  const closeHeaderMenu = () => onClickMenuItem?.()

  return (
    <div className="flex h-full w-full flex-col space-y-1 overflow-y-auto bg-background px-2 pt-4">
      {/* Logo ----------------------------------------------------- */}
      <div className="mb-10 flex justify-start">
        <Button
          variant="ghost"
          className="flex items-center space-x-2 p-0 md:p-2"
          onClick={() => navigate(getSensitiveLink("/"))}
        >
          {navigation.state === "loading" ? (
            <Loader2Icon className="size-8 animate-spin" />
          ) : (
            <img
              src="/icon.svg"
              className="m-auto size-8 rounded-full md:pb-2 lg:mr-2 lg:pb-2"
              alt="Avatar"
              width={40}
              height={40}
            />
          )}
          <span className="inline font-bold text-xl">{title}</span>
        </Button>
      </div>

      {/* Main nav ------------------------------------------------- */}
      <HomeMenuNavigationButton
        href={isSensitive ? "/r" : "/"}
        onClick={closeHeaderMenu}
        icon={HomeIcon}
      >
        {t("ホーム", "Home")}
        {isSensitive && " - R18"}
      </HomeMenuNavigationButton>

      <HomeMenuNavigationButton
        href={createLink("/search")}
        onClick={closeHeaderMenu}
        icon={SearchIcon}
      >
        {t("検索", "Search")}
      </HomeMenuNavigationButton>

      {/* R18モード時の全年齢戻るボタン */}
      {isSensitive && (
        <HomeMenuNavigationButton
          href={"/"}
          onClick={closeHeaderMenu}
          icon={RefreshCcwIcon}
          className="border-2 border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 dark:border-orange-700 dark:bg-orange-950 dark:text-orange-300 dark:hover:bg-orange-900"
        >
          {t("全年齢に戻る", "Back to All Ages")}
        </HomeMenuNavigationButton>
      )}

      <HomeMenuNavigationButton
        href={createLink("/themes")}
        icon={LightbulbIcon}
        onClick={closeHeaderMenu}
      >
        {t("お題", "Themes")}
      </HomeMenuNavigationButton>

      <HomeMenuNavigationButton
        href={createLink("/tags")}
        icon={TagIcon}
        onClick={closeHeaderMenu}
      >
        {t("タグ", "Tags")}
      </HomeMenuNavigationButton>

      <HomeMenuNavigationButton
        href={createLink("/rankings")}
        icon={AwardIcon}
        onClick={closeHeaderMenu}
      >
        {t("ランキング", "Ranking")}
      </HomeMenuNavigationButton>

      <HomeMenuNavigationButton
        href={createLink("/?tab=follow-user")}
        icon={Image}
        onClick={closeHeaderMenu}
      >
        {t("フォロー新着", "Followed new posts")}
      </HomeMenuNavigationButton>

      <HomeMenuNavigationButton
        href={createLink("/stickers")}
        icon={StampIcon}
        onClick={closeHeaderMenu}
      >
        {t("スタンプ広場", "Stickers")}
      </HomeMenuNavigationButton>

      <HomeMenuNavigationButton
        href={createLink("/events")}
        icon={StarIcon}
        onClick={closeHeaderMenu}
      >
        {t("イベント", "Events")}
      </HomeMenuNavigationButton>

      <HomeMenuNavigationButton
        href={createLink("/releases")}
        icon={RocketIcon}
        onClick={closeHeaderMenu}
      >
        {t("更新情報", "Update Information")}
      </HomeMenuNavigationButton>

      <HomeMenuNavigationButton
        href={createLink("/about")}
        icon={InfoIcon}
        onClick={closeHeaderMenu}
      >
        {t("概要", "About")}
      </HomeMenuNavigationButton>

      <HomeMenuNavigationButton
        href={createLink("/help")}
        icon={HelpCircleIcon}
        onClick={closeHeaderMenu}
      >
        {t("使い方ガイド", "User Guide")}
      </HomeMenuNavigationButton>

      <HomeMenuNavigationButton
        href={createLink("/pictor-chan")}
        icon={HeartIcon}
        onClick={closeHeaderMenu}
      >
        {t("ぴくたーちゃん", "Pictor-chan")}
      </HomeMenuNavigationButton>

      {/* Separator ------------------------------------------------ */}
      <div className="hidden px-3 py-2 lg:block">
        <Separator />
      </div>

      {/* Categories ---------------------------------------------- */}
      <HomeMenuNavigationButton
        href={createLink("/posts/2d")}
        icon={ImageIcon}
        onClick={closeHeaderMenu}
      >
        {t("イラスト", "Illust")}
      </HomeMenuNavigationButton>

      <HomeMenuNavigationButton
        href={createLink("/posts/3d")}
        icon={BookImageIcon}
        onClick={closeHeaderMenu}
      >
        {t("フォト", "Photo")}
      </HomeMenuNavigationButton>

      {/* Separator (auth) ---------------------------------------- */}
      {authContext.isNotLoading && (
        <div className="hidden px-3 py-2 lg:block">
          <Separator />
        </div>
      )}

      {/* Footer --------------------------------------------------- */}
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

          {/* フッターコンテンツ */}
          <div className="space-y-3 pt-2">
            {/* ナビゲーションリンク */}
            <div className="flex items-center gap-x-4 text-xs">
              <Link
                className="opacity-80 transition-opacity hover:opacity-100"
                to="/about"
              >
                {t("概要", "About")}
              </Link>
              <span className="opacity-50">•</span>
              <Link
                className="opacity-80 transition-opacity hover:opacity-100"
                to="/roadmap"
              >
                {t("ロードマップ", "Roadmap")}
              </Link>
              <span className="opacity-50">•</span>
              <Link
                className="opacity-80 transition-opacity hover:opacity-100"
                to="/pictor-chan"
              >
                {t("ぴくたーちゃん", "Pictor-chan")}
              </Link>
              <span className="opacity-50">•</span>
              <Link
                className="opacity-80 transition-opacity hover:opacity-100"
                to="/help"
              >
                {t("使い方ガイド", "User Guide")}
              </Link>
              <span className="opacity-50">•</span>
              <Link
                className="opacity-80 transition-opacity hover:opacity-100"
                to="/terms"
              >
                {t("利用規約", "Terms")}
              </Link>
              <span className="opacity-50">•</span>
              <Link
                className="opacity-80 transition-opacity hover:opacity-100"
                to="/privacy"
              >
                {t("プライバシーポリシー", "Privacy Policy")}
              </Link>
            </div>

            {/* SNSアイコン */}
            <div className="flex items-center gap-x-2">
              <SnsIconLink url="https://x.com/AIPICTORS" />
              <SnsIconLink url="https://discord.gg/7jA2MmtvtR" />
              <SnsIconLink url="https://github.com/aipictors" />
            </div>

            {/* コピーライト */}
            <p className="text-xs opacity-70">©2025 Aipictors Co.,Ltd.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
