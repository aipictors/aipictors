import { useTranslation } from "~/hooks/use-translation"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { toPassFeatures } from "~/routes/($lang)._main.plus._index/utils/to-pass-features"

type Props = {
  passType: IntrospectionEnum<"PassType">
}

export function PassImageGenerationBenefitList (props: Props) {
  const t = useTranslation()
  const features = toPassFeatures(props.passType, t)

  return (
    <ul className="ml-6 list-disc space-y-2">
      {features.map((feature) => (
        <li key={feature}>{feature}</li>
      ))}
    </ul>
  )
}
