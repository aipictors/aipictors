import { Separator } from "~/components/ui/separator"
import { AuthContext } from "~/contexts/auth-context"
import { HomeNavigationButton } from "./home-navigation-button"
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
} from "lucide-react"
import { useContext } from "react"
import { useTranslation } from "~/hooks/use-translation"
import { Button } from "~/components/ui/button"

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

  const sensitivePath = /\/r($|\/)/.test(location.pathname)

  const isSensitive = sensitivePath

  const title = isSensitive ? "Aipictors R18" : (propTitle ?? "Aipictors")

  const getSensitiveLink = (path: string) =>
    /^\/r($|\s)/.test(path) ? "" : sensitivePath ? `/r${path}` : path

  const createLink = (path: string) =>
    isSensitive && !["/about", "/terms"].includes(path) ? `/r${path}` : path

  const toggleSensitive = () => {
    // biome-ignore lint/suspicious/noDocumentCookie: <explanation>
    document.cookie = "sensitive=1; max-age=0; path=/"
    const newUrl = location.pathname.replace("/r", "")
    navigate(newUrl === "" ? "/" : newUrl, { replace: true })
  }

  const closeHeaderMenu = () => onClickMenuItem?.()

  return (
    <div className="fixed top-0 flex h-screen w-[216px] flex-col space-y-1 overflow-y-auto bg-background px-2 pt-4 transition-[width] duration-200 sm:z-30 md:w-16 lg:z-40 lg:w-[216px] ">
      {/* Logo ----------------------------------------------------- */}
      <div className="mb-10 flex justify-start md:justify-center lg:justify-start">
        <Button
          variant="ghost"
          className="flex items-center space-x-2 p-0 md:p-2"
          onClick={() => navigate(getSensitiveLink("/"))}
        >
          {navigation.state === "loading" ? (
            <Loader2Icon className="size-8 animate-spin md:hidden lg:block" />
          ) : (
            <img
              src="/icon.svg"
              className="m-auto size-8 rounded-full md:hidden md:pb-2 lg:mr-2 lg:block lg:pb-2"
              alt="Avatar"
              width={40}
              height={40}
            />
          )}
          <span className="inline font-bold text-xl md:hidden lg:inline">
            {title}
          </span>
        </Button>
      </div>

      {/* Main nav ------------------------------------------------- */}
      <HomeNavigationButton
        href={isSensitive ? "/r" : "/"}
        // onClick={closeHeaderMenu}
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
        href={createLink("/themes")}
        icon={LightbulbIcon}
        onClick={closeHeaderMenu}
      >
        {t("お題", "Themes")}
      </HomeNavigationButton>

      <HomeNavigationButton
        href={createLink("/rankings")}
        icon={AwardIcon}
        onClick={closeHeaderMenu}
      >
        {t("ランキング", "Ranking")}
      </HomeNavigationButton>

      <HomeNavigationButton
        href={createLink("/?tab=follow-user")}
        icon={Image}
        onClick={closeHeaderMenu}
      >
        {t("フォロー新着", "Followed new posts")}
      </HomeNavigationButton>

      <HomeNavigationButton
        href={createLink("/stickers")}
        icon={StampIcon}
        onClick={closeHeaderMenu}
      >
        {t("スタンプ広場", "Stickers")}
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

      {/* Separator ------------------------------------------------ */}
      <div className="hidden px-3 py-2 lg:block">
        <Separator />
      </div>

      {/* Categories ---------------------------------------------- */}
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

      <HomeNavigationButton
        href={createLink("/r")}
        icon={BoxIcon}
        onClick={closeHeaderMenu}
      >
        {t("センシティブ", "BoxIcon")}
      </HomeNavigationButton>

      {/* Separator (auth) ---------------------------------------- */}
      {authContext.isNotLoading && (
        <div className="hidden px-3 py-2 lg:block">
          <Separator />
        </div>
      )}

      {/* Footer --------------------------------------------------- */}
      <footer className="mt-auto sm:block md:hidden lg:block">
        <div className="mb-16 flex flex-col space-y-2 p-2">
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
    </div>
  )
}
