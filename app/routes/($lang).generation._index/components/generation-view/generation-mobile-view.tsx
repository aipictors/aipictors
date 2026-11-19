import {
  ArrowLeftIcon,
  CrownIcon,
  EllipsisIcon,
  InfoIcon,
  MailIcon,
  ReceiptTextIcon,
  ScrollTextIcon,
  ShoppingCartIcon,
} from "lucide-react"
import { Suspense, useContext, useEffect, useState } from "react"
import { CoinIcon } from "~/components/coin-icon"
import {
  LazyDrawer,
  LazyDrawerContent,
  LazyDrawerDescription,
  LazyDrawerTitle,
} from "~/components/lazy-drawer"
import { MemberThanksBanner } from "~/components/member-thanks-banner"
import {
  NewMemberGuide,
  PlanEndingNotice,
} from "~/components/plus-member-notice"
import { PremiumCoinIcon } from "~/components/premium-coin-icon"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"
import { GenerationAnnouncementBanner } from "~/routes/($lang).generation._index/components/generation-announcement-banner"
import { GenerationServerStatusBadge } from "~/routes/($lang).generation._index/components/submission-view/generation-server-status-badge"
import { GenerationConfigContext } from "~/routes/($lang).generation._index/contexts/generation-config-context"
import {
  GenerationMobileDockContext,
  type GenerationMobileSheetKind,
  useGenerationMobileDock,
} from "~/routes/($lang).generation._index/contexts/generation-mobile-dock-context"
import {
  GenerationMobileTabContext,
  openGenerationCoinSheetEvent,
} from "~/routes/($lang).generation._index/contexts/generation-mobile-tab-context"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { useUserModelSelection } from "~/routes/($lang).generation._index/hooks/use-user-model-selection"
import { useGenerationCoinSummaryValue } from "~/routes/($lang).generation._index/utils/generation-coin-store"
import {
  PremiumCoinGenerationSwitchRow,
  usePremiumCoinGenerationSetting,
} from "~/routes/($lang).settings/components/premium-coin-generation-setting"
import { toResizedImageUrl } from "~/utils/resized-image-url"
import { trackGrowthEvent } from "~/utils/track-growth-event"

type Props = {
  /** 履歴（一覧・詳細・モデルの作品） */
  history: React.ReactNode
  /** 下に固定の入力欄（プロンプト・送信ボタン・チップ。チップから設定のシートを開く） */
  submission: React.ReactNode
  footer: React.ReactNode
  coinHistory: React.ReactNode
  logs: React.ReactNode
}

/**
 * 履歴の場所に出す、履歴以外の中身（モデルの作品など）。戻るボタンを付ける
 */
const asideSubStates = [
  "WORKS_FROM_MODEL",
  "WORK_LIST_FULL",
  "COMMUNICATION",
  "LINKS",
  "LOGS",
  "COIN_HISTORY",
]

type SheetKind = "coins" | "coinHistory" | "logs"

/**
 * スマホの生成画面
 * 上: 見出し（コイン）と生成結果（履歴）/ 下に固定: プロンプト・送信ボタン・設定のチップ（押すとその項目だけのシート）
 */
export function GenerationMobileView(props: Props) {
  const t = useTranslation()

  const authContext = useContext(AuthContext)

  const state = GenerationConfigContext.useSelector((snap) => snap.value)

  const { send } = GenerationConfigContext.useActorRef()

  const isSubState = asideSubStates.includes(String(state))

  // 下の入力欄のチップから開いている設定のシート
  const [dockSheet, setDockSheet] = useState<GenerationMobileSheetKind | null>(
    null,
  )

  // 生成を頼んだらシートを閉じて、送信中・生成中のカードを見せる
  useEffect(() => {
    const onSending = (event: Event) => {
      const detail = (event as CustomEvent<{ count?: number }>).detail
      if ((detail?.count ?? 0) > 0) {
        setDockSheet(null)
        window.scrollTo({ top: 0 })
      }
    }
    window.addEventListener("generation:task-sending", onSending)
    return () => {
      window.removeEventListener("generation:task-sending", onSending)
    }
  }, [])

  const [sheet, setSheet] = useState<SheetKind | null>(null)

  const [hasOpenedSheet, setHasOpenedSheet] = useState(false)

  const openSheet = (kind: SheetKind) => {
    setHasOpenedSheet(true)
    setSheet(kind)
  }

  // 下の生成ボタンの「残りのコイン」から開く
  useEffect(() => {
    const onOpen = () => openSheet("coins")
    window.addEventListener(openGenerationCoinSheetEvent, onOpen)
    return () => {
      window.removeEventListener(openGenerationCoinSheetEvent, onOpen)
    }
  }, [])

  return (
    // 送信欄はスマホの形（残りのコイン・丸い送信ボタン）で出す。「つくる / 履歴」の切り替えはもう無いので履歴のまま
    <GenerationMobileTabContext.Provider
      value={{ tab: "history", setTab: () => {} }}
    >
      <GenerationMobileDockContext.Provider
        value={{ sheet: dockSheet, setSheet: setDockSheet }}
      >
        <div className="flex flex-col pb-64">
          <GenerationAnnouncementBanner />
          <MemberThanksBanner />
          <PlanEndingNotice variant="banner" />
          <NewMemberGuide />
          <GenerationMobileHeader
            onOpenCoins={() => openSheet("coins")}
            onOpenCoinHistory={() => openSheet("coinHistory")}
            onOpenLogs={() => openSheet("logs")}
          />
          {authContext.isNotLoggedIn && !isSubState ? (
            <GenerationMobileGuide />
          ) : (
            <div className="min-h-[50vh] overflow-hidden">
              {isSubState && (
                <div className="px-3 pb-2">
                  <button
                    type="button"
                    className="inline-flex h-11 items-center gap-1.5 rounded-full bg-muted px-4 font-bold text-sm"
                    onClick={() => send({ type: "CLOSE" })}
                  >
                    <ArrowLeftIcon className="size-4" />
                    {t("履歴に戻る", "Back to history")}
                  </button>
                </div>
              )}
              {props.history}
            </div>
          )}
          <div className="px-4 pt-6">{props.footer}</div>
          {/* シートを開いている間は後ろを暗くする（押すと閉じる） */}
          {dockSheet !== null && (
            <button
              type="button"
              aria-label={t("設定を閉じる", "Close settings")}
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
              onClick={() => setDockSheet(null)}
            />
          )}
          {props.submission}
        </div>
        {hasOpenedSheet && (
          <Suspense fallback={null}>
            <LazyDrawer
              open={sheet !== null}
              onOpenChange={(open) => {
                if (!open) setSheet(null)
              }}
              shouldScaleBackground={false}
            >
              <LazyDrawerContent
                className={cn(
                  "pb-[env(safe-area-inset-bottom)]",
                  sheet !== "coins" && "h-[85dvh] max-h-[85dvh]",
                )}
              >
                <LazyDrawerTitle className="px-5 pt-3 text-lg">
                  {sheet === "coinHistory"
                    ? t("コイン履歴", "Coin history")
                    : sheet === "logs"
                      ? t("診断ログ", "Diagnostics logs")
                      : t("コイン", "Coins")}
                </LazyDrawerTitle>
                <LazyDrawerDescription className="sr-only">
                  {t("生成で使うコイン", "Coins for generation")}
                </LazyDrawerDescription>
                {sheet === "coins" && (
                  <GenerationMobileCoinSheet
                    onOpenCoinHistory={() => openSheet("coinHistory")}
                    onClose={() => setSheet(null)}
                  />
                )}
                {sheet === "coinHistory" && (
                  <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
                    {props.coinHistory}
                  </div>
                )}
                {sheet === "logs" && (
                  <div className="min-h-0 flex-1 overflow-hidden px-2 pb-4">
                    {props.logs}
                  </div>
                )}
              </LazyDrawerContent>
            </LazyDrawer>
          </Suspense>
        )}
      </GenerationMobileDockContext.Provider>
    </GenerationMobileTabContext.Provider>
  )
}

/**
 * 未ログインのときに生成結果の場所に出す短い案内
 */
function GenerationMobileGuide() {
  const t = useTranslation()

  const context = useGenerationContext()

  const userModelSelection = useUserModelSelection()

  const dock = useGenerationMobileDock()

  const models = context.imageModels.slice(0, 6)

  const steps = [
    t("書く", "Describe"),
    t("↑で生成", "Tap ↑"),
    t("保存・投稿", "Save · post"),
  ]

  return (
    <div className="flex flex-col gap-5 px-4 pt-4">
      <div className="space-y-2 text-center">
        <p className="font-bold text-xl">
          {t("どんなイラストを描きますか？", "What would you like to draw?")}
        </p>
        <ol className="flex items-center justify-center gap-1.5 text-muted-foreground text-xs">
          {steps.map((step, index) => (
            <li key={step} className="flex items-center gap-1.5">
              {index > 0 && <span aria-hidden>›</span>}
              <span className="whitespace-nowrap rounded-full bg-muted px-2.5 py-1 font-medium text-foreground/80">
                {index + 1}. {step}
              </span>
            </li>
          ))}
        </ol>
      </div>
      {models.length > 0 && (
        <section className="space-y-2">
          <p className="font-semibold text-muted-foreground text-xs">
            {t("モデルで絵柄が変わります", "Models change the style")}
          </p>
          <div className="grid grid-cols-3 gap-2.5">
            {models.map((model) => {
              const isSelected =
                userModelSelection.checkpoint === null &&
                context.config.modelId === model.id
              return (
                <button
                  key={model.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => {
                    // モデルライブラリで公式モデルを選んだときと同じ処理
                    if (userModelSelection.checkpoint) {
                      userModelSelection.clearCheckpoint({ restore: false })
                    }
                    context.updateModelId(model.id, model.type)
                    dock?.setSheet(null)
                  }}
                  className="group flex min-w-0 flex-col gap-1 text-left"
                >
                  <span
                    className={cn(
                      "relative block aspect-square overflow-hidden rounded-xl border-2 bg-muted",
                      isSelected
                        ? "border-fuchsia-500 dark:border-fuchsia-400"
                        : "border-transparent",
                    )}
                  >
                    {model.thumbnailImageURL && (
                      <img
                        src={toResizedImageUrl(model.thumbnailImageURL, 240)}
                        alt=""
                        className="size-full object-cover"
                        loading="lazy"
                        draggable={false}
                      />
                    )}
                  </span>
                  <span
                    className={cn(
                      "truncate text-[11px]",
                      isSelected
                        ? "font-semibold text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {model.displayName ?? model.name}
                  </span>
                </button>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}

const usePlanLabel = () => {
  const context = useGenerationContext()
  const t = useTranslation()
  const type = context.currentPass?.type
  if (type === "LITE") return t("ライトプラン", "LITE plan")
  if (type === "STANDARD") return t("スタンダードプラン", "STANDARD plan")
  if (type === "PREMIUM") return t("プレミアムプラン", "PREMIUM plan")
  if (type === "TWO_DAYS") return t("お試しプラン", "Trial plan")
  return t("無料プラン", "Free plan")
}

/**
 * 見出し（タイトル・プラン・コイン残高・その他）
 */
function GenerationMobileHeader(props: {
  onOpenCoins: () => void
  onOpenCoinHistory: () => void
  onOpenLogs: () => void
}) {
  const t = useTranslation()

  const planLabel = usePlanLabel()

  const authContext = useContext(AuthContext)

  return (
    // 縦を空けるため 1 行にまとめる（残りのコインは下の入力欄の上に出している）
    <div className="flex h-12 items-center gap-2 px-4">
      <h1 className="flex min-w-0 flex-1 items-baseline gap-2">
        <span className="shrink-0 font-black text-lg tracking-tight">
          {t("画像生成", "Image generation")}
        </span>
        <span className="truncate font-semibold text-muted-foreground text-xs">
          {planLabel}
        </span>
      </h1>
      <GenerationServerStatusBadge className="shrink-0" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={t("その他", "More")}
            className="-mr-2 flex size-11 shrink-0 items-center justify-center rounded-full text-foreground/80 active:bg-muted"
          >
            <EllipsisIcon className="size-5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-52">
          {!authContext.isNotLoggedIn && (
            <DropdownMenuItem onSelect={props.onOpenCoins}>
              <CoinIcon className="mr-2 size-4" />
              {t("コイン（残り・購入）", "Coins")}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onSelect={props.onOpenCoinHistory}>
            <ReceiptTextIcon className="mr-2 size-4" />
            {t("コイン履歴", "Coin history")}
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/generation/plans">
              <CrownIcon className="mr-2 size-4" />
              {t("プラン一覧", "Plans")}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/generation/about">
              <InfoIcon className="mr-2 size-4" />
              {t("生成機能について", "About image generation")}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/contact">
              <MailIcon className="mr-2 size-4" />
              {t("お問い合わせ", "Contact")}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={props.onOpenLogs}
            className="text-muted-foreground"
          >
            <ScrollTextIcon className="mr-2 size-4" />
            {t("診断ログ", "Diagnostics logs")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

/**
 * コインの内訳とプラン・購入への入口（アプリのコインのシートと同じ）
 */
function GenerationMobileCoinSheet(props: {
  onOpenCoinHistory: () => void
  onClose: () => void
}) {
  const t = useTranslation()

  const context = useGenerationContext()

  const coinSummary = useGenerationCoinSummaryValue()

  const planLabel = usePlanLabel()

  const isPaid = context.currentPass?.type != null

  // 「生成にプレミアムコインを使わない」設定（ここでも切り替えられる）
  const isPremiumCoinGenerationDisabled =
    usePremiumCoinGenerationSetting().isDisabled

  return (
    <div className="flex flex-col gap-3 px-5 pt-1 pb-4">
      <p className="text-muted-foreground text-sm">
        {isPremiumCoinGenerationDisabled
          ? t(
              "生成するとコインを使います。プレミアムコインは生成に使いません（フリーコインだけで生成します）。",
              "Generation uses coins. Premium coins are not used for generation (free coins only).",
            )
          : t(
              "生成するとコインを使います。フリーコインから先に使われます。",
              "Generation uses coins. Free coins are used first.",
            )}
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        <div className="rounded-2xl bg-linear-to-br from-amber-400 to-orange-500 p-3.5 text-white">
          <p className="flex items-center gap-1 font-bold text-xs">
            <CoinIcon className="size-3.5" />
            {t("フリーコイン", "Free coins")}
          </p>
          <p className="mt-1 font-black text-2xl tabular-nums">
            {coinSummary?.freeBalance.toLocaleString() ?? "-"}
          </p>
          <p className="text-[10.5px] opacity-85">
            {t("毎日付与・当日24:00まで", "Daily · until 24:00")}
          </p>
        </div>
        <div className="rounded-2xl bg-linear-to-br from-[#0170C8] via-[#6D5DF6] to-[#FF5C8A] p-3.5 text-white">
          <p className="flex items-center gap-1 font-bold text-xs">
            <PremiumCoinIcon className="size-3.5" />
            {t("プレミアムコイン", "Premium coins")}
          </p>
          <p className="mt-1 font-black text-2xl tabular-nums">
            {coinSummary?.premiumBalance.toLocaleString() ?? "-"}
          </p>
          <p className="text-[10.5px] opacity-85">
            {t("プラン・購入分", "Plan · purchased")}
          </p>
        </div>
      </div>
      <div className="rounded-2xl bg-muted/70 px-3.5">
        <PremiumCoinGenerationSwitchRow />
      </div>
      <div className="flex items-center justify-between rounded-2xl bg-muted/70 px-3.5 py-3 text-sm">
        <span className="text-muted-foreground">{t("プラン", "Plan")}</span>
        <span className="font-bold">{planLabel}</span>
      </div>
      <Link
        to="/plus#plans"
        onClick={() => {
          trackGrowthEvent("plus_nav_click", "gen_coin_sheet")
          props.onClose()
        }}
        className="flex h-12 items-center justify-center gap-2 rounded-full bg-linear-to-r from-[#0170C8] via-[#6D5DF6] to-[#FF5C8A] font-bold text-white shadow-[0_8px_20px_rgba(109,93,246,0.35)]"
      >
        <CrownIcon className="size-5" />
        {isPaid
          ? t("プランを確認する", "View my plan")
          : t("Aipictors+ でコインを増やす", "Get more coins with Aipictors+")}
      </Link>
      <Link
        to="/settings/points"
        onClick={props.onClose}
        className="flex h-11 items-center justify-center gap-2 rounded-full border font-bold text-sm"
      >
        <ShoppingCartIcon className="size-4" />
        {t("コインを買う", "Buy coins")}
      </Link>
      <button
        type="button"
        onClick={props.onOpenCoinHistory}
        className="flex h-10 items-center justify-center gap-2 font-semibold text-muted-foreground text-sm"
      >
        <ReceiptTextIcon className="size-4" />
        {t("コインの履歴を見る", "Coin history")}
      </button>
    </div>
  )
}
