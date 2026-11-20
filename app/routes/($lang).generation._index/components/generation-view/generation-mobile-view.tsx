import {
  ArrowLeftIcon,
  CrownIcon,
  EllipsisIcon,
  InfoIcon,
  MailIcon,
  ReceiptTextIcon,
  ShoppingCartIcon,
  SparklesIcon,
} from "lucide-react"
import { Suspense, useEffect, useState } from "react"
import { appPillTabClassName } from "~/components/app/app-pill-tab"
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
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"
import { GenerationAnnouncementBanner } from "~/routes/($lang).generation._index/components/generation-announcement-banner"
import { GenerationConfigContext } from "~/routes/($lang).generation._index/contexts/generation-config-context"
import {
  type GenerationMobileTab,
  GenerationMobileTabContext,
} from "~/routes/($lang).generation._index/contexts/generation-mobile-tab-context"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { useGenerationQuery } from "~/routes/($lang).generation._index/hooks/use-generation-query"
import { useGenerationCoinSummaryValue } from "~/routes/($lang).generation._index/utils/generation-coin-store"
import {
  PremiumCoinGenerationSwitchRow,
  usePremiumCoinGenerationSetting,
} from "~/routes/($lang).settings/components/premium-coin-generation-setting"
import { trackGrowthEvent } from "~/utils/track-growth-event"

type Props = {
  /** つくる（モデル・プロンプト・設定のカード） */
  form: React.ReactNode
  /** 履歴（一覧・詳細・モデルの作品） */
  history: React.ReactNode
  /** 下に固定の生成ボタン（つくる・履歴のどちらでも出す） */
  submission: React.ReactNode
  footer: React.ReactNode
  coinHistory: React.ReactNode
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

type SheetKind = "coins" | "coinHistory"

/**
 * スマホの生成画面（アプリの生成タブと同じ構成）
 * 見出し（コイン）→「つくる / 履歴」→ つくる＝カードを縦に並べ、生成ボタンは下に固定
 */
export function GenerationMobileView(props: Props) {
  const t = useTranslation()

  const [tab, setTab] = useState<GenerationMobileTab>("create")

  const state = GenerationConfigContext.useSelector((snap) => snap.value)

  const { send } = GenerationConfigContext.useActorRef()

  const queryData = useGenerationQuery()

  const runningCount =
    (queryData.userStatus?.inProgressImageGenerationTasksCount ?? 0) +
    (queryData.userStatus?.inProgressImageGenerationReservedTasksCount ?? 0)

  const isSubState = asideSubStates.includes(String(state))

  const changeTab = (next: GenerationMobileTab) => {
    setTab(next)
    window.scrollTo({ top: 0 })
  }

  // 「このモデルの作品」などは履歴の場所に出すので、履歴に切り替える
  useEffect(() => {
    if (isSubState) changeTab("history")
  }, [isSubState])

  // 生成を頼んだら履歴に移って、送信中・生成中のカードを見せる
  useEffect(() => {
    const onSending = (event: Event) => {
      const detail = (event as CustomEvent<{ count?: number }>).detail
      if ((detail?.count ?? 0) > 0) changeTab("history")
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

  return (
    <GenerationMobileTabContext.Provider value={{ tab, setTab: changeTab }}>
      <div className="flex flex-col pb-4">
        <GenerationAnnouncementBanner />
        <MemberThanksBanner />
        <PlanEndingNotice variant="banner" />
        <NewMemberGuide />
        <GenerationMobileHeader
          onOpenCoins={() => openSheet("coins")}
          onOpenCoinHistory={() => openSheet("coinHistory")}
        />
        <div className="flex gap-2 px-4 pb-3" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "create"}
            className={appPillTabClassName(tab === "create")}
            onClick={() => changeTab("create")}
          >
            {t("つくる", "Create")}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "history"}
            className={appPillTabClassName(tab === "history")}
            onClick={() => {
              if (isSubState) send({ type: "CLOSE" })
              changeTab("history")
            }}
          >
            {runningCount > 0
              ? t(
                  `履歴・生成中 ${runningCount}`,
                  `History · ${runningCount} running`,
                )
              : t("履歴", "History")}
          </button>
        </div>
        {/* 切り替えても入力・一覧の状態が消えないよう、両方描いたまま隠す（一覧の読み込みも前と同じ回数） */}
        <div hidden={tab !== "create"} className="px-3 pb-44">
          {props.form}
          <div className="px-1 pt-6">{props.footer}</div>
        </div>
        <div
          hidden={tab !== "history"}
          className="min-h-[60vh] overflow-hidden pb-44"
        >
          {isSubState && (
            <div className="px-3 pb-2">
              <button
                type="button"
                className="inline-flex h-10 items-center gap-1.5 rounded-full bg-muted px-4 font-bold text-sm"
                onClick={() => send({ type: "CLOSE" })}
              >
                <ArrowLeftIcon className="size-4" />
                {t("履歴に戻る", "Back to history")}
              </button>
            </div>
          )}
          {props.history}
        </div>
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
            </LazyDrawerContent>
          </LazyDrawer>
        </Suspense>
      )}
    </GenerationMobileTabContext.Provider>
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
}) {
  const t = useTranslation()

  const coinSummary = useGenerationCoinSummaryValue()

  const planLabel = usePlanLabel()

  return (
    <div className="flex items-center gap-2 px-4 pt-2 pb-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-[#0170C8] via-[#6D5DF6] to-[#FF5C8A] text-white">
        <SparklesIcon className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <h1 className="font-black text-xl leading-tight tracking-tight">
          {t("画像生成", "Image generation")}
        </h1>
        <p className="truncate font-semibold text-muted-foreground text-xs">
          {planLabel}
        </p>
      </div>
      <button
        type="button"
        onClick={props.onOpenCoins}
        aria-label={t("コイン", "Coins")}
        className="flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-linear-to-br from-amber-400 to-orange-500 px-3.5 font-black text-sm text-white shadow-[0_4px_12px_rgba(245,158,11,0.35)] active:scale-95"
      >
        {coinSummary === null ? (
          <>
            <CoinIcon className="size-4" />
            <span className="h-3 w-7 animate-pulse rounded bg-white/40" />
          </>
        ) : (
          <>
            {/* フリーとプレミアムは価値が違うので分けて出す */}
            <CoinIcon className="size-4" />
            <span className="tabular-nums">
              {coinSummary.freeBalance.toLocaleString()}
            </span>
            <PremiumCoinIcon className="ml-1 size-4" />
            <span className="tabular-nums">
              {coinSummary.premiumBalance.toLocaleString()}
            </span>
          </>
        )}
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={t("その他", "More")}
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-foreground/80 active:scale-95"
          >
            <EllipsisIcon className="size-5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-52">
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
