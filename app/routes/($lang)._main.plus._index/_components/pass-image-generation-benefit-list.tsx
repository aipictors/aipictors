import type { PassType } from "@/_graphql/__generated__/graphql"
import { toPassFeatures } from "@/routes/($lang)._main.plus._index/_utils/to-pass-features"

type Props = {
  passType: PassType
}

export const PassImageGenerationBenefitList = (props: Props) => {
  const features = toPassFeatures(props.passType)

  return (
    <ul className="ml-6 list-disc space-y-2">
      {features.map((feature) => (
        <li key={feature}>{feature}</li>
      ))}
    </ul>
  )
}
