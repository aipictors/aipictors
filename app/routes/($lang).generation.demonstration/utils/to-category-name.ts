import { useTranslation } from "~/hooks/use-translation"

export function toCategoryName(category: string | null) {
  const t = useTranslation()

  if (category === "UNIVERSAL") {
    return t("汎用", "Universal")
  }

  if (category === "ILLUSTRATION_GIRL") {
    return t("美少女イラスト", "Illustration: Girl")
  }

  if (category === "ANIME_GIRL") {
    return t("美少女アニメ", "Anime: Girl")
  }

  if (category === "ANIMAL") {
    return t("獣系", "Animal")
  }

  if (category === "BIKINI_MODEL") {
    return t("グラビア", "Bikini Model")
  }

  if (category === "ILLUSTRATION_BOY") {
    return t("美男子イラスト", "Illustration: Boy")
  }

  if (category === "FIGURE") {
    return t("美少女フィギュア", "Figure: Girl")
  }

  if (category === "BACKGROUND") {
    return t("背景", "Background")
  }

  return t("全て", "All")
}
