import { PassType } from "@/__generated__/apollo"

type Props = {
  passType: PassType
}

export const PassBenefitList = (props: Props) => {
  return (
    <ul className="space-y-2 ml-6 list-disc">
      <li>{"広告の非表示"}</li>
      <li>{"認証マークの表"}示</li>
    </ul>
  )
}
