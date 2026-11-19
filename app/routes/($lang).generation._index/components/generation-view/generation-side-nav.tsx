import {
  BookOpenIcon,
  CoinsIcon,
  CrownIcon,
  FileTextIcon,
  ImagesIcon,
  type LucideIcon,
  MessageSquareIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  ScrollTextIcon,
  SearchIcon,
  SparklesIcon,
  VoteIcon,
} from "lucide-react"
import { useLocalStorage, useMediaQuery } from "usehooks-ts"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"
import { GenerationConfigContext } from "~/routes/($lang).generation._index/contexts/generation-config-context"

type NavKey =
  | "CREATE"
  | "HISTORY"
  | "WORKS"
  | "COIN_HISTORY"
  | "LOGS"
  | "COMMUNICATION"
  | "LINKS"

/**
 * いまの状態に対応する左ナビの項目
 */
const toNavKey = (state: string): NavKey => {
  if (state === "HISTORY_LIST_FULL") return "HISTORY"
  if (state === "WORKS_FROM_MODEL" || state === "WORK_LIST_FULL") return "WORKS"
  if (state === "COIN_HISTORY") return "COIN_HISTORY"
  if (state === "LOGS") return "LOGS"
  if (state === "COMMUNICATION") return "COMMUNICATION"
  if (state === "LINKS") return "LINKS"
  return "CREATE"
}

/**
 * 生成画面の左ナビ（以前の右側のタブ「履歴・作品検索・ご意見・アンケート・ログ・コイン履歴」をここに移した）
 * 中身の切り替えは今までどおり状態（generation-config-machine）のイベントで行う
 */
export function GenerationSideNav() {
  const t = useTranslation()

  const actor = GenerationConfigContext.useActorRef()

  const state = GenerationConfigContext.useSelector((snap) => {
    return String(snap.value)
  })

  const [isCollapsedSetting, setIsCollapsed] = useLocalStorage(
    "generation-side-nav-collapsed",
    false,
  )

  // タブレット幅（1280px 未満）はアイコンだけにする
  const isWide = useMediaQuery("(min-width: 1280px)")

  const isCollapsed = !isWide || isCollapsedSetting

  const current = toNavKey(state)

  /**
   * どの状態からでも生成の画面（PROMPT_VIEW）に戻す
   */
  const backToCreate = () => {
    const value = String(actor.getSnapshot().value)
    if (value === "HISTORY_LIST_FULL") {
      actor.send({ type: "OPEN_FULL_HISTORY_LIST" })
      return
    }
    if (value === "WORK_LIST_FULL") {
      actor.send({ type: "OPEN_FULL_WORK_LIST" })
      actor.send({ type: "CLOSE" })
      return
    }
    if (
      value === "HISTORY_VIEW_ON_MAIN_AND_HEADER" ||
      value === "HISTORY_VIEW_ON_ASIDE"
    ) {
      actor.send({ type: "CLOSE_PREVIEW" })
      return
    }
    actor.send({ type: "CLOSE" })
  }

  const open = (key: NavKey) => {
    if (key === current && key !== "CREATE") return
    backToCreate()
    if (key === "HISTORY") actor.send({ type: "OPEN_FULL_HISTORY_LIST" })
    if (key === "WORKS") actor.send({ type: "OPEN_WORKS_FROM_MODEL" })
    if (key === "COIN_HISTORY") actor.send({ type: "OPEN_COIN_HISTORY" })
    if (key === "LOGS") actor.send({ type: "OPEN_LOGS" })
    if (key === "COMMUNICATION") actor.send({ type: "OPEN_COMMUNICATION" })
    if (key === "LINKS") actor.send({ type: "OPEN_LINKS" })
  }

  const mainItems: { key: NavKey; label: string; icon: LucideIcon }[] = [
    { key: "CREATE", label: t("画像生成", "Generate"), icon: SparklesIcon },
    { key: "HISTORY", label: t("履歴", "History"), icon: ImagesIcon },
    { key: "WORKS", label: t("作品検索", "Search posts"), icon: SearchIcon },
    {
      key: "COIN_HISTORY",
      label: t("コイン履歴", "Coin history"),
      icon: CoinsIcon,
    },
  ]

  const subItems: { key: NavKey; label: string; icon: LucideIcon }[] = [
    {
      key: "COMMUNICATION",
      label: t("ご意見", "Feedback"),
      icon: MessageSquareIcon,
    },
    { key: "LINKS", label: t("アンケート", "Survey"), icon: VoteIcon },
    { key: "LOGS", label: t("ログ", "Logs"), icon: ScrollTextIcon },
  ]

  const linkItems: { to: string; label: string; icon: LucideIcon }[] = [
    {
      to: "/generation/plans",
      label: t("プラン一覧", "Plans"),
      icon: CrownIcon,
    },
    {
      to: "/generation/about",
      label: t("生成機能について", "About"),
      icon: BookOpenIcon,
    },
    {
      to: "/generation/terms",
      label: t("利用規約", "Terms"),
      icon: FileTextIcon,
    },
  ]

  const itemClassName = (isActive: boolean) =>
    cn(
      "flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-sm transition-colors",
      isCollapsed && "justify-center px-0",
      isActive
        ? "bg-muted font-semibold text-foreground"
        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
    )

  const renderItem = (item: {
    key: NavKey
    label: string
    icon: LucideIcon
  }) => {
    const Icon = item.icon
    const isActive = current === item.key
    return (
      <li key={item.key}>
        <button
          type="button"
          onClick={() => open(item.key)}
          aria-current={isActive ? "page" : undefined}
          title={isCollapsed ? item.label : undefined}
          aria-label={isCollapsed ? item.label : undefined}
          className={itemClassName(isActive)}
        >
          <Icon className="size-4 shrink-0" />
          {!isCollapsed && <span className="truncate">{item.label}</span>}
        </button>
      </li>
    )
  }

  return (
    <nav
      aria-label={t("画像生成のメニュー", "Generation menu")}
      className={cn(
        "flex h-full shrink-0 flex-col border-r bg-background py-3 transition-[width]",
        isCollapsed ? "w-14 px-2" : "w-[224px] px-3",
      )}
    >
      <ul className="space-y-0.5">{mainItems.map(renderItem)}</ul>
      <div className="my-3 border-t" />
      <ul className="space-y-0.5">{subItems.map(renderItem)}</ul>
      <div className="mt-auto space-y-0.5">
        <ul className="space-y-0.5">
          {linkItems.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  title={isCollapsed ? item.label : undefined}
                  aria-label={isCollapsed ? item.label : undefined}
                  className={cn(itemClassName(false), "h-8 text-xs")}
                >
                  <Icon className="size-4 shrink-0" />
                  {!isCollapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
        {isWide && (
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsedSetting)}
            aria-label={
              isCollapsed
                ? t("メニューを開く", "Expand menu")
                : t("メニューをたたむ", "Collapse menu")
            }
            title={
              isCollapsed
                ? t("メニューを開く", "Expand menu")
                : t("メニューをたたむ", "Collapse menu")
            }
            className={cn(itemClassName(false), "h-8")}
          >
            {isCollapsed ? (
              <PanelLeftOpenIcon className="size-4 shrink-0" />
            ) : (
              <PanelLeftCloseIcon className="size-4 shrink-0" />
            )}
            {!isCollapsed && (
              <span className="truncate text-xs">
                {t("たたむ", "Collapse")}
              </span>
            )}
          </button>
        )}
      </div>
    </nav>
  )
}
