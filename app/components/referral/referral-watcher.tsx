import { useLocation } from "@remix-run/react"
import { GiftIcon, XIcon } from "lucide-react"
import { useContext, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { LoginDialogButton } from "~/components/login-dialog-button"
import { Button } from "~/components/ui/button"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import {
  REFERRAL_COIN_TTL_DAYS,
  REFERRAL_REWARDS,
  referralCtaClassName,
} from "~/lib/referral/referral-rewards"
import {
  clearStoredReferral,
  countReferralAttempt,
  dismissReferralBanner,
  fetchReferralEnabled,
  getReferralDeviceId,
  isReferralBannerDismissed,
  readStoredReferral,
  REFERRAL_PARAM,
  saveReferral,
  stripReferralParam,
  toReferralCode,
} from "~/lib/referral/referral-storage"
import { cn } from "~/lib/utils"
import { getViewerRequestHeaders } from "~/lib/viewer-request-headers"
import type { ReferralAttachResult } from "~/routes/api.referral.attach/route"
import {
  trackGrowthEvent,
  trackGrowthEventOnce,
} from "~/utils/track-growth-event"

/** 紹介ページ（/invite）では、ページの中に同じ案内があるので下の案内は出さない */
const INVITE_PATH = /^\/(?:en\/|ja\/)?invite\/?$/

/** 登録の直後はアカウントの記録がまだ読めないことがあるので、少し待って試し直す */
const RETRY_DELAYS_MS = [4000, 10000]

/**
 * 紹介リンク（?ref=<コード>）を覚えて、登録したあとでひも付ける
 * - リンクから来た未ログインの人には「登録するとコイン」の案内を出す
 * - ページは URL ごとにキャッシュされるので、ref はブラウザだけで読み、読んだら URL から外す
 */
export function ReferralWatcher() {
  const authContext = useContext(AuthContext)
  const location = useLocation()
  const t = useTranslation()
  const [hasReferral, setHasReferral] = useState(false)
  const [isDismissed, setIsDismissed] = useState(true)
  const isAttaching = useRef(false)
  // 紹介特典を受け付けているか（案内を出すときだけ確かめる。確かめるまでは案内を出さない）
  const [isEnabled, setIsEnabled] = useState<boolean | null>(null)

  // リンクから来たときに覚える。ログイン中の人（すでにアカウントがある）は対象外なので覚えない
  useEffect(() => {
    if (authContext.isLoading) return
    const code = toReferralCode(
      new URLSearchParams(window.location.search).get(REFERRAL_PARAM),
    )
    // 画面は読み込み直さずに URL だけ書き換える（Remix の履歴の状態は残す）
    const strip = () => {
      const stripped = stripReferralParam(window.location.href)
      if (stripped !== null) {
        window.history.replaceState(window.history.state, "", stripped)
      }
    }
    strip()
    // ほかの処理が履歴を書き直して ref が戻ることがあるので、少しあとでもう一度外す
    const timers = [1500, 5000].map((delay) => window.setTimeout(strip, delay))
    if (code !== null && authContext.isNotLoggedIn) {
      saveReferral(code)
      trackGrowthEventOnce(
        "ref_landing_view",
        INVITE_PATH.test(window.location.pathname) ? "invite" : "other",
      )
    }
    setHasReferral(readStoredReferral() !== null)
    setIsDismissed(isReferralBannerDismissed())
    return () => {
      for (const timer of timers) window.clearTimeout(timer)
    }
  }, [
    authContext.isLoading,
    authContext.isNotLoggedIn,
    location.pathname,
    location.search,
  ])

  // ログインしたら、覚えていた紹介コードにひも付ける（新しいアカウントかどうかはサーバーが確かめる）
  useEffect(() => {
    if (!authContext.isLoggedIn || isAttaching.current) return
    if (readStoredReferral() === null) return
    isAttaching.current = true
    let isCancelled = false

    const attach = async (retryIndex: number) => {
      const referral = readStoredReferral()
      if (referral === null || isCancelled) return
      countReferralAttempt(referral)
      const response = await fetch("/api/referral/attach", {
        method: "POST",
        headers: await getViewerRequestHeaders({ includeJsonContentType: true }),
        body: JSON.stringify({
          code: referral.code,
          deviceId: getReferralDeviceId(),
        }),
      })
      const json = (await response.json().catch(() => null)) as {
        data: ReferralAttachResult | null
      } | null
      const result = json?.data ?? null
      // 通信の失敗は、次にページを開いたときにもう一度試す（回数の上限まで）
      if (!response.ok || result === null) return
      if (result.retry === true) {
        const delay = RETRY_DELAYS_MS[retryIndex]
        if (delay !== undefined) {
          await new Promise((resolve) => setTimeout(resolve, delay))
          await attach(retryIndex + 1)
        }
        return
      }
      // 受け付けを止めている間は、覚えたままにして次に開いたときにもう一度試す（回数の上限まで）
      if (result.reason === "disabled") return
      clearStoredReferral()
      setHasReferral(false)
      trackGrowthEvent("ref_attach", result.reason)
      if (result.attached) {
        toast(
          t(
            `🎁 招待特典のフリーコイン${result.grantedCoins}枚を受け取りました（${REFERRAL_COIN_TTL_DAYS}日間有効）`,
            `🎁 You received ${result.grantedCoins} free coins as an invite bonus (valid for ${REFERRAL_COIN_TTL_DAYS} days)`,
          ),
        )
      }
    }

    attach(0)
      .catch(() => {
        // 失敗しても画面の操作には影響させない
      })
      .finally(() => {
        isAttaching.current = false
      })
    return () => {
      isCancelled = true
    }
  }, [authContext.isLoggedIn])

  const isBannerTarget =
    hasReferral &&
    !isDismissed &&
    authContext.isNotLoggedIn &&
    !INVITE_PATH.test(location.pathname)

  useEffect(() => {
    if (!isBannerTarget || isEnabled !== null) return
    let isCancelled = false
    fetchReferralEnabled().then((value) => {
      if (!isCancelled) setIsEnabled(value)
    })
    return () => {
      isCancelled = true
    }
  }, [isBannerTarget, isEnabled])

  if (!isBannerTarget || isEnabled === null) {
    return null
  }

  const closeButton = (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-10 shrink-0 text-muted-foreground"
      aria-label={t("閉じる", "Close")}
      onClick={() => {
        dismissReferralBanner()
        setIsDismissed(true)
      }}
    >
      <XIcon className="size-4" />
    </Button>
  )

  if (!isEnabled) {
    return (
      <aside
        aria-label={t("招待特典", "Invite bonus")}
        className="fixed inset-x-3 bottom-16 z-40 mx-auto flex max-w-md items-center gap-3 rounded-2xl border bg-background/95 p-3 shadow-xl backdrop-blur md:inset-x-auto md:right-6 md:bottom-6 md:mx-0"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <GiftIcon className="size-5" />
        </span>
        <p className="min-w-0 flex-1 text-sm leading-snug">
          {t(
            "招待特典は、現在は受け付けていません。登録は今までどおり無料でできます。",
            "The invite bonus isn't available right now. You can still sign up for free.",
          )}
        </p>
        {closeButton}
      </aside>
    )
  }

  return (
    <aside
      aria-label={t("招待特典", "Invite bonus")}
      className="fixed inset-x-3 bottom-16 z-40 mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-violet-500/30 bg-background/95 p-3 shadow-violet-500/20 shadow-xl backdrop-blur md:inset-x-auto md:right-6 md:bottom-6 md:mx-0"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-sky-500 text-white">
        <GiftIcon className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-bold text-[11px] text-violet-600 leading-tight dark:text-violet-300">
          {t("招待特典", "Invite bonus")}
        </p>
        <p className="font-bold text-sm leading-tight">
          {t(
            `登録でフリーコイン${REFERRAL_REWARDS.signup}枚`,
            `${REFERRAL_REWARDS.signup} free coins when you sign up`,
          )}
        </p>
        <p className="mt-0.5 hidden text-muted-foreground text-xs leading-snug sm:block">
          {t(
            "無料で登録すると、画像生成に使えるコインを受け取れます",
            "Sign up free and get coins for AI image generation",
          )}
        </p>
      </div>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: 中のボタンのクリックを数えるだけ */}
      <div onClickCapture={() => trackGrowthEvent("ref_register_click", "banner")}>
        <LoginDialogButton
          label={t("無料で登録", "Sign up")}
          className={cn(referralCtaClassName, "h-10 px-3 text-sm")}
        />
      </div>
      {closeButton}
    </aside>
  )
}
