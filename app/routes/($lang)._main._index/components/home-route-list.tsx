import { gql, useLazyQuery } from "@apollo/client/index"
import { useLocation, useNavigation } from "@remix-run/react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronUpIcon,
  Loader2Icon,
  MenuIcon,
} from "lucide-react"
import { useContext, useEffect, useState } from "react"
import {
  SidebarNavigationButton,
  sidebarItemClassName,
} from "~/components/sidebar-navigation-button"
import { SnsIconLink } from "~/components/sns-icon"
import { Button } from "~/components/ui/button"
import { AuthContext } from "~/contexts/auth-context"
import { useSidebar } from "~/contexts/sidebar-context"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"
import { getHomeNavigationSections } from "~/routes/($lang)._main._index/components/home-navigation-sections"

type Props = {
  title?: string
  onClickMenuItem?: () => void
}

export function HomeRouteList({ title: propTitle, onClickMenuItem }: Props) {
  const authContext = useContext(AuthContext)
  const [loadViewerModerator, { data: viewerData }] = useLazyQuery(
    viewerIsModeratorQuery,
    {
      fetchPolicy: "network-only",
      nextFetchPolicy: "cache-first",
      errorPolicy: "all",
    },
  )
  const navigation = useNavigation()
  const location = useLocation()
  const t = useTranslation()
  const { sidebarState, toggleSidebar, minimizeSidebar } = useSidebar()
  const [isExtraMenuOpen, setIsExtraMenuOpen] = useState(false)

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

  const sensitivePath = /\/r($|\/)/.test(location.pathname)
  const isSensitive = sensitivePath
  const title = propTitle ?? "Aipictors"

  const getSensitiveLink = (path: string) =>
    /^\/r($|\s)/.test(path) ? "" : sensitivePath ? `/r${path}` : path

  const closeHeaderMenu = () => onClickMenuItem?.()

  const isExpanded = sidebarState === "expanded"

  // ロゴと三本線は、メニューの開閉・最小化で動かない（どの状態でも同じ場所に固定）
  const brand = (
    <div className="fixed top-4 left-7 z-[61] hidden h-10 items-center gap-1 md:flex">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        aria-label={t("メニューの表示を切り替える", "Toggle menu")}
        aria-expanded={isExpanded}
        className="size-10 rounded-lg hover:bg-muted"
      >
        <MenuIcon className="size-5" />
      </Button>
      <Link
        to={sensitivePath ? "/r/home" : "/"}
        className="flex h-10 items-center gap-2 rounded-lg px-2 transition-colors hover:bg-muted"
      >
        {navigation.state === "loading" ? (
          <Loader2Icon className="size-8 animate-spin" />
        ) : (
          <img
            src="/icon.svg"
            className="size-8 rounded-full"
            alt=""
            width={40}
            height={40}
          />
        )}
        <span className="whitespace-nowrap font-bold text-xl">{title}</span>
      </Link>
    </div>
  )

  // 最小化状態ではメニューを出さない（三本線で開く）
  if (sidebarState === "minimal") {
    return brand
  }

  return (
    <>
      {brand}
      <div
        className={cn(
          "fixed top-16 bottom-0 hidden flex-col overflow-y-auto overflow-x-hidden bg-background px-2 pt-2 transition-[width] duration-200 [scrollbar-width:thin] sm:z-30 md:z-[60] md:flex",
          isExpanded ? "w-[232px]" : "w-20",
        )}
      >
        {/* Navigation Items（PC のサイドバーとスマホのメニューで共通の項目） */}
        {getHomeNavigationSections({
          isSensitive,
          isModerator: !!isModerator,
        }).map((section) => {
          const isOpen = !section.isCollapsible || isExtraMenuOpen
          return (
            <div key={section.key} className="space-y-0.5">
              {section.title &&
                (isExpanded ? (
                  section.isCollapsible ? (
                    <button
                      type="button"
                      onClick={() => setIsExtraMenuOpen((prev) => !prev)}
                      className="mt-3 mr-1 ml-3 flex w-[calc(100%-1rem)] items-center justify-between rounded-lg px-2.5 py-1.5 font-semibold text-[11px] text-muted-foreground tracking-wide transition-colors hover:bg-muted hover:text-foreground"
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
                    <p className="mt-3 ml-3 px-2.5 py-1.5 font-semibold text-[11px] text-muted-foreground tracking-wide">
                      {t(...section.title)}
                    </p>
                  )
                ) : (
                  <div className="my-2 ml-3 w-10 border-t" />
                ))}
              {(isOpen || !isExpanded) &&
                section.items.map((item) => (
                  <SidebarNavigationButton
                    key={item.key}
                    href={item.href}
                    icon={item.icon}
                    isExternal={item.isExternal}
                    onClick={closeHeaderMenu}
                  >
                    {t(...item.label)}
                  </SidebarNavigationButton>
                ))}
            </div>
          )
        })}

        <div className="pb-2" />

        {/* 閉じているとき: メニューごと隠すボタン */}
        {!isExpanded && (
          <div className="mt-auto pb-3">
            <button
              type="button"
              onClick={minimizeSidebar}
              aria-label={t("メニューを閉じる", "Close menu")}
              title={t("メニューを閉じる", "Close menu")}
              className={cn(
                sidebarItemClassName(false),
                "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <ChevronLeftIcon className="size-5" />
            </button>
          </div>
        )}

        {/* Footer */}
        {isExpanded && (
          <footer className="mt-auto">
            <div className="ml-3 flex flex-col space-y-3 px-2.5 pt-3 pb-4">
              <div className="flex items-center gap-2">
                <Link
                  target="_blank"
                  rel="noopener noreferrer"
                  to="https://apps.apple.com/jp/app/aipictors-ai%E3%83%94%E3%82%AF%E3%82%BF%E3%83%BC%E3%82%BA/id6466581636"
                >
                  <img
                    src="/apple/download.svg"
                    alt={t(
                      "App Store からダウンロード",
                      "Download on the App Store",
                    )}
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
                    alt={t(
                      "Google Play で手に入れよう",
                      "Get it on Google Play",
                    )}
                    className="h-10 w-auto"
                    width={646}
                    height={250}
                    loading="lazy"
                    decoding="async"
                  />
                </Link>
              </div>

              {/* SNSアイコン */}
              <div className="flex items-center gap-x-2">
                <SnsIconLink url="https://x.com/AIPICTORS" />
                <SnsIconLink url="https://discord.gg/7jA2MmtvtR" />
                <SnsIconLink url="https://github.com/aipictors" />
              </div>

              <div className="flex flex-wrap gap-x-3 gap-y-1 text-muted-foreground text-xs">
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
              <p className="text-muted-foreground text-xs">
                ©2026 Aipictors Co.,Ltd.
              </p>
            </div>
          </footer>
        )}
      </div>
    </>
  )
}

const viewerIsModeratorQuery = gql`
  query HomeRouteListViewerIsModerator {
    viewer {
      id
      isModerator
    }
  }
`
