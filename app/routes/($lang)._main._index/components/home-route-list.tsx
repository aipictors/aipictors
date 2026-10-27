import { gql, useLazyQuery } from "@apollo/client/index"
import { Link, useLocation, useNavigate, useNavigation } from "@remix-run/react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronUpIcon,
  Loader2Icon,
  MenuIcon,
} from "lucide-react"
import { useContext, useEffect, useState } from "react"
import { SidebarNavigationButton } from "~/components/sidebar-navigation-button"
import { SnsIconLink } from "~/components/sns-icon"
import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"
import { AuthContext } from "~/contexts/auth-context"
import { useSidebar } from "~/contexts/sidebar-context"
import { useTranslation } from "~/hooks/use-translation"
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
  const navigate = useNavigate()
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

  const sensitivePath =
    typeof window !== "undefined" ? /\/r($|\/)/.test(location.pathname) : false
  const isSensitive = sensitivePath
  const title = isSensitive ? "Aipictors R18" : (propTitle ?? "Aipictors")

  const getSensitiveLink = (path: string) =>
    /^\/r($|\s)/.test(path) ? "" : sensitivePath ? `/r${path}` : path


  const closeHeaderMenu = () => onClickMenuItem?.()

  // サイドバーの幅を状態に応じて決定
  const sidebarWidth = () => {
    switch (sidebarState) {
      case "expanded":
        return "w-[232px]"
      case "collapsed":
        return "w-20" // 80px（AppContentsと揃える）
      case "minimal":
        return "w-20"
      default:
        return "w-[232px]"
    }
  }

  // 最小化状態では三角ボタンのみ表示（absoluteで配置）
  if (sidebarState === "minimal") {
    return (
      <>
        {/* 三角ボタンのみ絶対配置 - ヘッダーのロゴと被らないように左端に配置 */}
        <div className="fixed top-4 left-2 z-[60] hidden md:block">
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
      className={`fixed top-0 hidden h-screen flex-col space-y-1 overflow-y-auto bg-background px-2 pt-4 transition-[width] duration-200 sm:z-30 md:z-[60] md:flex lg:flex ${sidebarWidth()}`}
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
            onClick={() => navigate(getSensitiveLink("/home"))}
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

      {/* Navigation Items（PC のサイドバーとスマホのメニューで共通の項目） */}
      {getHomeNavigationSections({ isSensitive, isModerator: !!isModerator }).map(
        (section) => {
          const isOpen = !section.isCollapsible || isExtraMenuOpen
          return (
            <div key={section.key} className="space-y-0.5">
              {section.title &&
                (sidebarState === "expanded" ? (
                  section.isCollapsible ? (
                    <button
                      type="button"
                      onClick={() => setIsExtraMenuOpen((prev) => !prev)}
                      className="flex w-full items-center justify-between px-3 pt-4 pb-1 font-semibold text-[11px] text-muted-foreground/80 tracking-wide transition-colors hover:text-foreground"
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
                  )
                ) : (
                  <div className="mx-3 my-2 border-t" />
                ))}
              {(isOpen || sidebarState !== "expanded") &&
                section.items.map((item) =>
                  item.isExternal ? (
                    <Link
                      key={item.key}
                      className={cn(
                        "flex items-center rounded-md px-3 py-2 font-medium text-muted-foreground text-sm transition-colors hover:bg-muted/20 hover:text-foreground",
                        sidebarState === "expanded"
                          ? "justify-start"
                          : "justify-center",
                      )}
                      to={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <item.icon className="size-5 shrink-0" />
                      {sidebarState === "expanded" && (
                        <span className="ml-3">{t(...item.label)}</span>
                      )}
                    </Link>
                  ) : (
                    <SidebarNavigationButton
                      key={item.key}
                      href={item.href}
                      icon={item.icon}
                      onClick={closeHeaderMenu}
                    >
                      {t(...item.label)}
                    </SidebarNavigationButton>
                  ),
                )}
            </div>
          )
        },
      )}

      <div className="pb-2" />

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
            <p className="text-muted-foreground text-xs">©2026 Aipictors Co.,Ltd.</p>
          </div>
        </footer>
      )}
    </div>
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
