import { useLocation } from "@remix-run/react"
import { SparklesIcon, XIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { toFirstMonthPrice } from "~/hooks/use-first-month-offer"
import { usePlusStatus } from "~/hooks/use-plus-status"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { getPlanSpec } from "~/routes/($lang)._main.plus._index/utils/plan-specs"
import { buildLocalePath } from "~/utils/locale-path"
import { toMoneyNumberText } from "~/utils/to-money-number-text"
import {
  trackGrowthEvent,
  trackGrowthEventOnce,
} from "~/utils/track-growth-event"

const DISMISSED_STORAGE_KEY = "aipictors-plus-notice-dismissed-until"
const DISMISS_REMEMBER_MS = 30 * 24 * 60 * 60 * 1000

/**
 * 案内を出さないページ（プランのページ自身、入力中・手続き中のページ）
 */
const HIDDEN_PATH_PATTERN =
  /^\/(?:r\/)?(?:plus|new|settings|support|contact|terms|privacy|specified-commercial-transaction-act|generation|admin|app)(?:\/|$)/

const isDismissed = () => {
  try {
    const until = window.localStorage.getItem(DISMISSED_STORAGE_KEY)
    return until !== null && Number(until) > Date.now()
  } catch (_error) {
    return false
  }
}

const rememberDismissed = () => {
  try {
    window.localStorage.setItem(
      DISMISSED_STORAGE_KEY,
      String(Date.now() + DISMISS_REMEMBER_MS),
    )
  } catch (_error) {
    // 保存できなくても、この画面では閉じたままにする
  }
}

function usePlusEntryTarget() {
  const status = usePlusStatus()
  const { pathname } = useLocation()
  const isHiddenPath = HIDDEN_PATH_PATTERN.test(buildLocalePath("ja", pathname))
  // 今プランに入っていない人（未ログインも）は初月半額の対象
  return (status === "guest" || status === "free") && !isHiddenPath
}

/**
 * PC のヘッダーに置く Aipictors+ の入口（プランに入っていない人と未ログインの人だけ）
 */
export function PlusHeaderLink() {
  const t = useTranslation()
  const isTarget = usePlusEntryTarget()

  useEffect(() => {
    if (!isTarget) return
    // lg 未満では隠しているので数えない
    if (!window.matchMedia("(min-width: 1024px)").matches) return
    trackGrowthEventOnce("plus_nav_view", "header")
  }, [isTarget])

  if (!isTarget) return null

  return (
    <Link
      to="/plus"
      onClick={() => trackGrowthEvent("plus_nav_click", "header")}
      className="hidden h-9 items-center gap-1.5 whitespace-nowrap rounded-full border border-violet-500/40 bg-violet-500/5 px-3 font-semibold text-sm text-violet-700 transition-colors hover:bg-violet-500/15 lg:inline-flex dark:text-violet-300"
    >
      <SparklesIcon className="size-4" />
      {"Aipictors+"}
      <span className="rounded-full bg-fuchsia-600 px-1.5 py-0.5 font-bold text-[10px] text-white leading-none">
        {t("初月半額", "50% off")}
      </span>
    </Link>
  )
}

/**
 * スマホの画面下に出す Aipictors+ の小さな案内（プランに入っていない人と未ログインの人だけ）
 * 少しスクロールしてから出し、閉じたら 30 日は出さない。
 * 画面に重ねて出すので、出てもページの中身はずれない
 */
export function PlusMobileNotice() {
  const t = useTranslation()
  const isTarget = usePlusEntryTarget()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isClosed, setIsClosed] = useState(true)
  const lite = getPlanSpec("LITE")

  useEffect(() => {
    if (!isTarget) return
    if (!window.matchMedia("(max-width: 767px)").matches) return
    if (isDismissed()) return
    setIsClosed(false)
    const onScroll = () => {
      if (window.scrollY < 400) return
      setIsScrolled(true)
      window.removeEventListener("scroll", onScroll)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [isTarget])

  const isVisible = isTarget && isScrolled && !isClosed

  useEffect(() => {
    if (isVisible) trackGrowthEventOnce("plus_nav_view", "mobile_notice")
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[4.5rem] z-40 flex justify-center px-3 md:hidden">
      <div className="pointer-events-auto flex max-w-full items-center rounded-full border border-violet-500/40 bg-background/95 shadow-lg shadow-violet-500/20 backdrop-blur">
        <Link
          to="/plus"
          onClick={() => trackGrowthEvent("plus_nav_click", "mobile_notice")}
          className="flex min-w-0 items-center gap-1.5 py-2 pr-1 pl-3 text-xs"
        >
          <SparklesIcon className="size-4 shrink-0 text-violet-500" />
          <span className="truncate">
            <span className="font-bold">{"Aipictors+"}</span>
            <span className="ml-1.5">
              {t(
                `初月半額・ライトは初月¥${toMoneyNumberText(toFirstMonthPrice(lite.price))}`,
                `50% off first month · Lite ¥${toMoneyNumberText(toFirstMonthPrice(lite.price))}`,
              )}
            </span>
          </span>
          <span className="shrink-0 font-bold text-violet-700 dark:text-violet-300">
            {t("見る", "View")}
          </span>
        </Link>
        <button
          type="button"
          aria-label={t("この案内を閉じる", "Dismiss")}
          onClick={() => {
            rememberDismissed()
            setIsClosed(true)
            trackGrowthEvent("plus_nav_dismiss", "mobile_notice")
          }}
          className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
        >
          <XIcon className="size-4" />
        </button>
      </div>
    </div>
  )
}
