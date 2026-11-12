import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { config } from "~/config"
import { PassPlanList } from "~/routes/($lang)._main.plus._index/components/pass-plan-list"
import { PlusStickyCta } from "~/routes/($lang)._main.plus._index/components/plus-sticky-cta"
import { getAnalytics, logEvent } from "firebase/analytics"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
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
import { trackGrowthEvent } from "~/utils/track-growth-event"

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
    trackGrowthEvent(`plus_login_${passType.toLowerCase()}`, source)
  }

  // ログイン前に選んだプランの決済へ、ログイン後そのまま進む
  const hasResumedRef = useRef(false)

  useEffect(() => {
    if (props.canResumeCheckout !== true || hasResumedRef.current) return
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
  }, [props.canResumeCheckout])

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
