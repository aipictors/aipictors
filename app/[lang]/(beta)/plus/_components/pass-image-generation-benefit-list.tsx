import { toPassFeatures } from "@/app/[lang]/(beta)/plus/_utils/to-pass-features"
import type { PassType } from "@/graphql/__generated__/graphql"

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
