import { PassPlanDescription } from "@/[lang]/(main)/plus/_components/pass-plan-description"
import { toPassFeatures } from "@/[lang]/(main)/plus/_utils/to-pass-features"
import type { PassType } from "@/_graphql/__generated__/graphql"
import { viewerCurrentPassQuery } from "@/_graphql/queries/viewer/viewer-current-pass"
import { useSuspenseQuery } from "@apollo/client/index.js"

type Props = {
  isLoading: boolean
  showUpgradePlansOnly?: boolean
  hideSubmitButton?: boolean
  onSelect(passType: PassType): Promise<void>
}

export const PassPlanList = (props: Props) => {
  const { data } = useSuspenseQuery(viewerCurrentPassQuery, {})

  if (data.viewer === null) {
    return null
  }

  const isUpgradeOrEqualPlan = (
    currentPlan: PassType | undefined,
    targetPlan: PassType,
  ) => {
    if (currentPlan === undefined) {
      return true
    }
    if (
      currentPlan === "LITE" &&
      (targetPlan === "LITE" ||
        targetPlan === "STANDARD" ||
        targetPlan === "PREMIUM")
    ) {
      return true
    }
    if (
      currentPlan === "STANDARD" &&
      (targetPlan === "STANDARD" || targetPlan === "PREMIUM")
    ) {
      return true
    }
    if (currentPlan === "PREMIUM" && targetPlan === "PREMIUM") {
      return true
    }
    return false
  }

  const currentPass = data.viewer.currentPass

  return (
    <div className="flex flex-col space-y-2 lg:flex-row lg:space-x-2 lg:space-y-0">
      {(!props.showUpgradePlansOnly ||
        isUpgradeOrEqualPlan(currentPass?.type, "LITE")) && (
        <div className="flex-1">
          <PassPlanDescription
            title="ライト"
            price={480}
            features={toPassFeatures("LITE")}
            isLoading={props.isLoading}
            isHide={props.hideSubmitButton === true}
            isCurrent={currentPass?.type === "LITE"}
            onClick={() => props.onSelect("LITE")}
          />
        </div>
      )}
      {(!props.showUpgradePlansOnly ||
        isUpgradeOrEqualPlan(currentPass?.type, "STANDARD")) && (
        <div className="flex-1">
          <PassPlanDescription
            isPrimary
            title="スタンダード"
            price={1980}
            features={toPassFeatures("STANDARD")}
            isLoading={props.isLoading}
            isHide={props.hideSubmitButton === true}
            isCurrent={currentPass?.type === "STANDARD"}
            onClick={() => props.onSelect("STANDARD")}
          />
        </div>
      )}
      {(!props.showUpgradePlansOnly ||
        isUpgradeOrEqualPlan(currentPass?.type, "PREMIUM")) && (
        <div className="flex-1">
          <PassPlanDescription
            title="プレミアム"
            price={3980}
            features={toPassFeatures("PREMIUM")}
            isLoading={props.isLoading}
            isHide={props.hideSubmitButton === true}
            isCurrent={currentPass?.type === "PREMIUM"}
            onClick={() => props.onSelect("PREMIUM")}
          />
        </div>
      )}
    </div>
  )
}
