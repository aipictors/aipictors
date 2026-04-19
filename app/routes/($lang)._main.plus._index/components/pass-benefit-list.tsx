import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { useTranslation } from "~/hooks/use-translation"
import { getVideoUploadLimits } from "~/utils/video-upload-limit"

type Props = {
  passType: IntrospectionEnum<"PassType">
}

export function PassBenefitList (props: Props) {
  const t = useTranslation()
  const videoUploadLimits = getVideoUploadLimits(props.passType)

  return (
    <ul className="ml-6 list-disc space-y-2">
      <li>{t("広告の非表示", "Ad-free")}</li>
      <li>{t("認証マークの表示", "Display of verification badge")}</li>
      <li>
        {t(
          `動画投稿の上限が${videoUploadLimits.maxDurationSeconds}秒・1日${videoUploadLimits.dailyUploadLimit}本に拡張`,
          `Video posting expands to ${videoUploadLimits.maxDurationSeconds} seconds and ${videoUploadLimits.dailyUploadLimit} uploads per day`,
        )}
      </li>
    </ul>
  )
}
