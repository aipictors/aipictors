import type { IntrospectionEnum } from "@/_lib/introspection-enum"
import { toPassFeatures } from "@/routes/($lang)._main.plus._index/_utils/to-pass-features"

type Props = {
  passType: IntrospectionEnum<"PassType">
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
