import { PassPlanDescription } from "@/app/[lang]/(beta)/plus/_components/pass-plan-description"
import { toPassFeatures } from "@/app/[lang]/(beta)/plus/_utils/to-pass-features"
import type { PassType } from "@/graphql/__generated__/graphql"

type Props = {
  isLoading: boolean
  onSelect(passType: PassType): Promise<void>
}

export const PassPlanList = (props: Props) => {
  return (
    <div className="flex flex-col space-y-2 lg:flex-row lg:space-x-2 lg:space-y-0">
      <div className="flex-1">
        <PassPlanDescription
          title="ライト"
          price={480}
          features={toPassFeatures("LITE")}
          isLoading={props.isLoading}
          onClick={() => props.onSelect("LITE")}
        />
      </div>
      <div className="flex-1">
        <PassPlanDescription
          isPrimary
          title="スタンダード"
          price={1980}
          features={toPassFeatures("STANDARD")}
          isLoading={props.isLoading}
          onClick={() => props.onSelect("STANDARD")}
        />
      </div>
      <div className="flex-1">
        <PassPlanDescription
          title="プレミアム"
          price={3980}
          features={toPassFeatures("PREMIUM")}
          isLoading={props.isLoading}
          onClick={() => props.onSelect("PREMIUM")}
        />
      </div>
    </div>
  )
}
