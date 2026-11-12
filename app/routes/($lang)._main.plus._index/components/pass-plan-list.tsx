import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { cn } from "~/lib/utils"
import { PassPlanDescription } from "~/routes/($lang)._main.plus._index/components/pass-plan-description"
import { useQuery } from "@apollo/client/index"
import { BillingIntervalToggle } from "~/routes/($lang)._main.plus._index/components/billing-interval-toggle"
import type { BillingInterval } from "~/routes/($lang)._main.plus._index/utils/plan-specs"
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
  /**
   * 未ログインの人が登録ボタン（ログイン）を押したとき
   */
  onLoginClick?(passType: "LITE" | "STANDARD" | "PREMIUM"): void
  /**
   * 月払い・年払い（onIntervalChange を渡したときだけ切り替えを出す。加入中の人には出さない）
   */
  interval?: BillingInterval
  onIntervalChange?(interval: BillingInterval): void
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

  // 年払いは今どのプランにも入っていない人だけ（加入中は二重の契約になるため）
  const isIntervalToggleVisible =
    props.onIntervalChange !== undefined && currentPass === null
  const interval = isIntervalToggleVisible ? (props.interval ?? "month") : "month"

  return (
    <div className="@container">
      {isIntervalToggleVisible && props.onIntervalChange && (
        <BillingIntervalToggle
          value={interval}
          onChange={props.onIntervalChange}
        />
      )}
      {/* スマホ（1 列）では、おすすめのスタンダード・最安のライト・プレミアム・無料の順に並べる */}
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
            className="@xl:order-none order-4"
            isLoading={props.isLoading}
            isHide={props.hideSubmitButton === true}
            onClick={async () => {}}
          />
        )}
        {isVisible("LITE") && (
          <PassPlanDescription
            plan="LITE"
            interval={interval}
            isLoading={props.isLoading}
            isHide={props.hideSubmitButton === true}
            isLoggedOut={props.isLoggedOut}
            isCurrent={effectiveCurrentPass?.type === "LITE"}
            className="@xl:order-none order-2"
            onLoginClick={() => props.onLoginClick?.("LITE")}
            onClick={() => props.onSelect("LITE")}
          />
        )}
        {isVisible("STANDARD") && (
          <PassPlanDescription
            isPrimary
            plan="STANDARD"
            interval={interval}
            isLoading={props.isLoading}
            isHide={props.hideSubmitButton === true}
            isLoggedOut={props.isLoggedOut}
            isCurrent={effectiveCurrentPass?.type === "STANDARD"}
            className="@xl:order-none order-1"
            onLoginClick={() => props.onLoginClick?.("STANDARD")}
            onClick={() => props.onSelect("STANDARD")}
          />
        )}
        {isVisible("PREMIUM") && (
          <PassPlanDescription
            plan="PREMIUM"
            interval={interval}
            isLoading={props.isLoading}
            isHide={props.hideSubmitButton === true}
            isLoggedOut={props.isLoggedOut}
            isCurrent={effectiveCurrentPass?.type === "PREMIUM"}
            className="@xl:order-none order-3"
            onLoginClick={() => props.onLoginClick?.("PREMIUM")}
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
