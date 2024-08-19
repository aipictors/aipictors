import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { PassPlanDescription } from "~/routes/($lang)._main.plus._index/components/pass-plan-description"
import { toPassFeatures } from "~/routes/($lang)._main.plus._index/utils/to-pass-features"
import { useSuspenseQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"

type Props = {
  isLoading: boolean
  showUpgradePlansOnly?: boolean
  hideSubmitButton?: boolean
  onSelect(passType: IntrospectionEnum<"PassType">): Promise<void>
}

export function PassPlanList(props: Props) {
  const { data } = useSuspenseQuery(viewerCurrentPassQuery, {})

  if (data.viewer === null) {
    return null
  }

  const isUpgradeOrEqualPlan = (
    currentPlan: IntrospectionEnum<"PassType"> | undefined,
    targetPlan: IntrospectionEnum<"PassType">,
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

const viewerCurrentPassQuery = graphql(
  `query ViewerCurrentPass {
    viewer {
      id
      currentPass {
        id
        type
      }
    }
  }`,
)
