import type { IntrospectionEnum } from "@/_lib/introspection-enum"

type Props = {
  passType: IntrospectionEnum<"PassType">
}

export const PassBenefitList = (props: Props) => {
  return (
    <ul className="ml-6 list-disc space-y-2">
      <li>{"広告の非表示"}</li>
      <li>{"認証マークの表示"}</li>
    </ul>
  )
}
