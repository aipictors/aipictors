import { Link, useLocation, useNavigate, useNavigation } from "@remix-run/react"
import {
  ChevronDownIcon,
  ChevronUpIcon,
  Loader2Icon,
} from "lucide-react"
import { gql, useLazyQuery } from "@apollo/client/index"
import { useContext, useEffect, useState } from "react"
import { SnsIconLink } from "~/components/sns-icon"
import { Button } from "~/components/ui/button"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { getHomeNavigationSections } from "~/routes/($lang)._main._index/components/home-navigation-sections"
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
  const [loadViewerModerator, { data: viewerData }] = useLazyQuery(
    viewerIsModeratorQuery,
    {
      fetchPolicy: "network-only",
      nextFetchPolicy: "cache-first",
      errorPolicy: "all",
    },
  )

  useEffect(() => {
    if (authContext.isLoading || authContext.isNotLoggedIn) {
      return
    }

    void loadViewerModerator()
  }, [authContext.isLoading, authContext.isNotLoggedIn, loadViewerModerator])

  const isModerator =
    authContext.isLoggedIn &&
    viewerData?.viewer?.id === authContext.userId &&
    viewerData.viewer.isModerator

  const navigation = useNavigation()

  const location = useLocation()

  const navigate = useNavigate()

  const t = useTranslation()
  const [isExtraMenuOpen, setIsExtraMenuOpen] = useState(false)

  const sensitivePath =
    typeof window !== "undefined" ? /\/r($|\/)/.test(location.pathname) : false

  const isSensitive = sensitivePath

  const title = isSensitive ? "Aipictors R18" : (propTitle ?? "Aipictors")

  const getSensitiveLink = (path: string) =>
    /^\/r($|\s)/.test(path) ? "" : sensitivePath ? `/r${path}` : path


  const closeHeaderMenu = () => onClickMenuItem?.()

  return (
    <div className="flex h-full w-full flex-col space-y-1 overflow-y-auto bg-background px-2 pt-4">
      {/* Logo ----------------------------------------------------- */}
      <div className="mb-4 flex justify-start">
        <Button
          variant="ghost"
          className="flex items-center space-x-2 p-0 md:p-2"
          onClick={() => navigate(getSensitiveLink("/home"))}
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

      {/* Main nav（PC のサイドバーと共通の項目） ------------------- */}
      {getHomeNavigationSections({ isSensitive, isModerator: !!isModerator }).map(
        (section) => {
          const isOpen = !section.isCollapsible || isExtraMenuOpen
          return (
            <div key={section.key} className="space-y-0.5">
              {section.title &&
                (section.isCollapsible ? (
                  <button
                    type="button"
                    onClick={() => setIsExtraMenuOpen((prev) => !prev)}
                    className="flex w-full items-center justify-between px-3 pt-4 pb-1 font-semibold text-[11px] text-muted-foreground/80 tracking-wide"
                    aria-expanded={isExtraMenuOpen}
                  >
                    <span>{t(...section.title)}</span>
                    {isExtraMenuOpen ? (
                      <ChevronUpIcon className="size-3.5" />
                    ) : (
                      <ChevronDownIcon className="size-3.5" />
                    )}
                  </button>
                ) : (
                  <p className="px-3 pt-4 pb-1 font-semibold text-[11px] text-muted-foreground/80 tracking-wide">
                    {t(...section.title)}
                  </p>
                ))}
              {isOpen &&
                section.items.map((item) =>
                  item.isExternal ? (
                    <Link
                      key={item.key}
                      className="flex items-center rounded-md px-3 py-2 font-medium text-muted-foreground text-sm transition-colors hover:bg-muted/20 hover:text-foreground"
                      to={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={closeHeaderMenu}
                    >
                      <item.icon className="size-5 shrink-0" />
                      <span className="ml-3">{t(...item.label)}</span>
                    </Link>
                  ) : (
                    <HomeMenuNavigationButton
                      key={item.key}
                      href={item.href}
                      icon={item.icon}
                      onClick={closeHeaderMenu}
                    >
                      {t(...item.label)}
                    </HomeMenuNavigationButton>
                  ),
                )}
            </div>
          )
        },
      )}

      <div className="pb-4" />

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
                alt={t("App Store からダウンロード", "Download on the App Store")}
                className="h-8 w-auto"
                width={109}
                height={40}
                loading="lazy"
                decoding="async"
              />
            </Link>
            <Link
              target="_blank"
              rel="noopener noreferrer"
              to="https://play.google.com/store/apps/details?id=com.aipictors.app&hl=ja"
            >
              <img
                src="/google/download.png"
                alt={t("Google Play で手に入れよう", "Get it on Google Play")}
                className="h-10 w-auto"
                width={646}
                height={250}
                loading="lazy"
                decoding="async"
              />
            </Link>
          </div>

          {/* フッターコンテンツ */}
          <div className="space-y-3 pt-2">
            {/* ナビゲーションリンク */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground text-xs">
              <Link className="hover:text-foreground" to="/contact">
                {t("お問い合わせ", "Contact")}
              </Link>
              <Link className="hover:text-foreground" to="/terms">
                {t("利用規約", "Terms")}
              </Link>
              <Link className="hover:text-foreground" to="/privacy">
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
            <p className="text-xs opacity-70">©2026 Aipictors Co.,Ltd.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

const viewerIsModeratorQuery = gql`
  query HomeMenuRouteListViewerIsModerator {
    viewer {
      id
      isModerator
    }
  }
`
