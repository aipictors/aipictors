import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { config } from "~/config"
import { PassPlanList } from "~/routes/($lang)._main.plus._index/components/pass-plan-list"
import { PlusStickyCta } from "~/routes/($lang)._main.plus._index/components/plus-sticky-cta"
import { getAnalytics, logEvent } from "firebase/analytics"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { useLiteOffer } from "~/hooks/use-lite-offer"
import { usePassCheckout } from "~/hooks/use-pass-checkout"
import { useTranslation } from "~/hooks/use-translation"
import {
  savePendingCheckout,
  takePendingCheckout,
} from "~/routes/($lang)._main.plus._index/utils/pending-checkout"
import {
  type BillingInterval,
  getPlanSpec,
} from "~/routes/($lang)._main.plus._index/utils/plan-specs"
import {
  trackGrowthEvent,
  trackGrowthEventOnce,
} from "~/utils/track-growth-event"

/** お試しの決済を始めた場所（trial_checkout の src） */
const TRIAL_SOURCE: Record<string, string> = {
  plus_checkout: "plus_card",
  plus_sticky_checkout: "plus_sticky",
  plus_resume_checkout: "plus_resume",
}

type Props = {
  showUpgradePlansOnly?: boolean
  hideSubmitButton?: boolean
  treatAsNoCurrentPass?: boolean
  showFreePlan?: boolean
  isLoggedOut?: boolean
  /**
   * スマホの画面下に申込みボタンを固定で出す（今プランに入っていない人・未ログインの人の一覧だけ）
   */
  showStickyCta?: boolean
  /**
   * 未ログインのときに選んだプランの決済を、ログイン後に続けてよい
   * （加入中・未払い・休止中でないことを確かめてから true にする）
   */
  canResumeCheckout?: boolean
}

export function PlusAbout (props: Props) {
  const t = useTranslation()

  const checkout = usePassCheckout()

  const [interval, setBillingInterval] = useState<BillingInterval>("month")

  // ライトの月払いは、はじめての人には 7 日間無料お試し（それ以外は初月半額）
  const liteOffer = useLiteOffer()

  const isPlanListForNewMember =
    props.showStickyCta === true && props.treatAsNoCurrentPass !== true

  // お試しの案内が出た回数・対象外だった回数（ブラウザを開いている間に 1 回）
  useEffect(() => {
    if (!isPlanListForNewMember) return
    if (liteOffer.offer === "trial") {
      trackGrowthEventOnce("trial_view", liteOffer.isGuest ? "plus_guest" : "plus")
    }
    if (liteOffer.offer === "half") {
      trackGrowthEventOnce("trial_ineligible", "plus")
    }
  }, [liteOffer.offer, liteOffer.isGuest, isPlanListForNewMember])

  const startCheckout = async (
    passType: "LITE" | "STANDARD" | "PREMIUM",
    billingInterval: BillingInterval,
    event: string,
  ) => {
    try {
      logEvent(getAnalytics(), config.logEvent.select_item, {
        item_list_id: passType,
        items: [{ item_id: passType, item_name: passType }],
      })
    } catch (_error) {
      // 計測に失敗しても決済は続ける
    }
    // お試しの対象の人がライトの月払いを選んだら、お試しの手続きへ
    if (
      passType === "LITE" &&
      billingInterval === "month" &&
      liteOffer.offer === "trial" &&
      !liteOffer.isGuest
    ) {
      trackGrowthEvent("trial_checkout", TRIAL_SOURCE[event] ?? "plus")
      await checkout.startTrialCheckout()
      return
    }
    // plus_checkout_LITE など、前からある名前は変えない（前後で比べるため）。新しい名前は小文字にそろえる
    trackGrowthEvent(
      event === "plus_checkout"
        ? `${event}_${passType}`
        : `${event}_${passType.toLowerCase()}`,
      billingInterval,
    )
    await checkout.startCheckout(passType, billingInterval)
  }

  const onSelect = async (passType: IntrospectionEnum<"PassType">) => {
    if (passType !== "LITE" && passType !== "STANDARD" && passType !== "PREMIUM") return
    await startCheckout(passType, interval, "plus_checkout")
  }

  const onLoginClick = (passType: "LITE" | "STANDARD" | "PREMIUM", source: string) => {
    savePendingCheckout({ passType, interval })
    if (passType === "LITE" && interval === "month" && liteOffer.offer === "trial") {
      trackGrowthEvent("trial_click", `plus_${source}_guest`)
    }
    trackGrowthEvent(`plus_login_${passType.toLowerCase()}`, source)
  }

  // ログイン前に選んだプランの決済へ、ログイン後そのまま進む
  const hasResumedRef = useRef(false)

  useEffect(() => {
    if (props.canResumeCheckout !== true || hasResumedRef.current) return
    // お試しにできるかが分かってから進む（はじめての人はお試し、以前入っていた人は初月半額の決済へ）
    if (liteOffer.offer === "unknown") return
    hasResumedRef.current = true
    const pending = takePendingCheckout()
    if (pending === null) return
    setBillingInterval(pending.interval)
    const spec = getPlanSpec(pending.passType)
    toast(
      t(
        `${spec.name}の決済画面へ進みます…`,
        `Taking you to checkout for ${spec.enName}…`,
      ),
    )
    void startCheckout(pending.passType, pending.interval, "plus_resume_checkout")
  }, [props.canResumeCheckout, liteOffer.offer])

  return (
    <>
      <PassPlanList
        showUpgradePlansOnly={props.showUpgradePlansOnly}
        hideSubmitButton={props.hideSubmitButton}
        treatAsNoCurrentPass={props.treatAsNoCurrentPass}
        showFreePlan={props.showFreePlan}
        isLoggedOut={props.isLoggedOut}
        onSelect={onSelect}
        onLoginClick={(passType) => onLoginClick(passType, "card")}
        isLoading={checkout.isLoading}
        interval={interval}
        onIntervalChange={(next) => {
          trackGrowthEvent("plus_interval", next)
          setBillingInterval(next)
        }}
      />
      {props.showStickyCta && (
        <PlusStickyCta
          interval={interval}
          isLoggedOut={props.isLoggedOut === true}
          isLoading={checkout.isLoading}
          onSelect={(passType) => startCheckout(passType, interval, "plus_sticky_checkout")}
          onLoginClick={(passType) => onLoginClick(passType, "sticky")}
        />
      )}
    </>
  )
}
