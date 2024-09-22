import { useTranslation } from "~/hooks/use-translation"

/**
 * 作品の種別の文言を返す
 * @param
 */
export const toWorkTypeText = (type: string) => {
  // TODO: Hookをなくす
  const t = useTranslation()

  switch (type) {
    case "WORK":
      return t("画像", "Image")
    case "VIDEO":
      return t("動画", "Video")
    case "COLUMN":
      return t("コラム", "Column")
    case "NOVEL":
      return t("小説", "Novel")
    default:
      return t("画像", "Image")
  }
}
