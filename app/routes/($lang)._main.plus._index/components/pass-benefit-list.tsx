import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  passType: IntrospectionEnum<"PassType">
}

export function PassBenefitList(props: Props) {
  const t = useTranslation()

  return (
    <ul className="ml-6 list-disc space-y-2">
      <li>{t("広告の非表示", "Ad-free")}</li>
      <li>{t("認証マークの表示", "Display of verification badge")}</li>
    </ul>
  )
}
