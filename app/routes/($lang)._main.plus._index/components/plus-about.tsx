import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { config } from "~/config"
import { PassPlanList } from "~/routes/($lang)._main.plus._index/components/pass-plan-list"
import { getAnalytics, logEvent } from "firebase/analytics"
import { useState } from "react"
import { usePassCheckout } from "~/hooks/use-pass-checkout"
import type { BillingInterval } from "~/routes/($lang)._main.plus._index/utils/plan-specs"
import { trackGrowthEvent } from "~/utils/track-growth-event"

type Props = {
  showUpgradePlansOnly?: boolean
  hideSubmitButton?: boolean
  treatAsNoCurrentPass?: boolean
  showFreePlan?: boolean
  isLoggedOut?: boolean
}

export function PlusAbout (props: Props) {
  const checkout = usePassCheckout()

  const [interval, setBillingInterval] = useState<BillingInterval>("month")

  const onSelect = async (passType: IntrospectionEnum<"PassType">) => {
    if (passType !== "LITE" && passType !== "STANDARD" && passType !== "PREMIUM") return
    try {
      logEvent(getAnalytics(), config.logEvent.select_item, {
        item_list_id: passType,
        items: [{ item_id: passType, item_name: passType }],
      })
    } catch (_error) {
      // 計測に失敗しても決済は続ける
    }
    trackGrowthEvent(`plus_checkout_${passType}`, interval)
    await checkout.startCheckout(passType, interval)
  }

  return (
    <PassPlanList
      showUpgradePlansOnly={props.showUpgradePlansOnly}
      hideSubmitButton={props.hideSubmitButton}
      treatAsNoCurrentPass={props.treatAsNoCurrentPass}
      showFreePlan={props.showFreePlan}
      isLoggedOut={props.isLoggedOut}
      onSelect={onSelect}
      isLoading={checkout.isLoading}
      interval={interval}
      onIntervalChange={(next) => {
        trackGrowthEvent("plus_interval", next)
        setBillingInterval(next)
      }}
    />
  )
}
