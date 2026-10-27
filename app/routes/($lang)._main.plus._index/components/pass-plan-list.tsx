import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { cn } from "~/lib/utils"
import { PassPlanDescription } from "~/routes/($lang)._main.plus._index/components/pass-plan-description"
import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"

type Props = {
  isLoading: boolean
  showUpgradePlansOnly?: boolean
  hideSubmitButton?: boolean
  treatAsNoCurrentPass?: boolean
  /**
   * 無料プランのカードも並べる（加入中のプランがないときだけ表示）
   */
  showFreePlan?: boolean
  /**
   * 未ログイン（登録ボタンをログインに置き換える）
   */
  isLoggedOut?: boolean
  onSelect(passType: IntrospectionEnum<"PassType">): Promise<void>
}

export function PassPlanList (props: Props) {
  const { data } = useQuery(viewerCurrentPassQuery, {
    skip: props.isLoggedOut === true,
  })

  // if (data.viewer === null) {
  //   return null
  // }

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

  const currentPass = data
    ? data.viewer
      ? (data.viewer.currentPass ?? null)
      : null
    : null

  const effectiveCurrentPass = props.treatAsNoCurrentPass ? null : currentPass

  const isFreePlanVisible =
    props.showFreePlan === true && effectiveCurrentPass === null

  const isVisible = (passType: "LITE" | "STANDARD" | "PREMIUM") =>
    !props.showUpgradePlansOnly ||
    isUpgradeOrEqualPlan(effectiveCurrentPass?.type, passType)

  const visibleCount =
    (isFreePlanVisible ? 1 : 0) +
    (["LITE", "STANDARD", "PREMIUM"] as const).filter(isVisible).length

  return (
    <div className="@container">
      <div
        className={cn(
          "grid grid-cols-1 gap-4 pt-3",
          visibleCount === 1 && "max-w-md",
          visibleCount >= 2 && "@xl:grid-cols-2",
          visibleCount === 3 && "@3xl:grid-cols-3",
          visibleCount >= 4 && "@4xl:grid-cols-4",
        )}
      >
        {isFreePlanVisible && (
          <PassPlanDescription
            plan="FREE"
            isLoading={props.isLoading}
            isHide={props.hideSubmitButton === true}
            onClick={async () => {}}
          />
        )}
        {isVisible("LITE") && (
          <PassPlanDescription
            plan="LITE"
            isLoading={props.isLoading}
            isHide={props.hideSubmitButton === true}
            isLoggedOut={props.isLoggedOut}
            isCurrent={effectiveCurrentPass?.type === "LITE"}
            onClick={() => props.onSelect("LITE")}
          />
        )}
        {isVisible("STANDARD") && (
          <PassPlanDescription
            isPrimary
            plan="STANDARD"
            isLoading={props.isLoading}
            isHide={props.hideSubmitButton === true}
            isLoggedOut={props.isLoggedOut}
            isCurrent={effectiveCurrentPass?.type === "STANDARD"}
            onClick={() => props.onSelect("STANDARD")}
          />
        )}
        {isVisible("PREMIUM") && (
          <PassPlanDescription
            plan="PREMIUM"
            isLoading={props.isLoading}
            isHide={props.hideSubmitButton === true}
            isLoggedOut={props.isLoggedOut}
            isCurrent={effectiveCurrentPass?.type === "PREMIUM"}
            onClick={() => props.onSelect("PREMIUM")}
          />
        )}
      </div>
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
