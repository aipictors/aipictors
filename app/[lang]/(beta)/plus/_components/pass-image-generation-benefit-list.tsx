"use client"

import { PassType } from "@/__generated__/apollo"
import { toPassFeatures } from "@/app/[lang]/(beta)/plus/_utils/to-pass-features"

type Props = {
  passType: PassType
}

export const PassImageGenerationBenefitList = (props: Props) => {
  const features = toPassFeatures(props.passType)

  return (
    <ul className="space-y-2 ml-6 list-disc">
      {features.map((feature) => (
        <li key={feature}>{feature}</li>
      ))}
    </ul>
  )
}
