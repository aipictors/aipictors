type Props = {
  type: string
  lang: string
}

/**
 * 作品の種別の文言を返す
 * @param
 */
export const toWorkTypeText = (props: Props) => {
  switch (props.type) {
    case "WORK":
      return props.lang === "ja" ? "画像" : "Image"
    case "VIDEO":
      return props.lang === "ja" ? "動画" : "Video"
    case "COLUMN":
      return props.lang === "ja" ? "コラム" : "Column"
    case "NOVEL":
      return props.lang === "ja" ? "小説" : "Novel"
    default:
      return props.lang === "ja" ? "画像" : "Image"
  }
}
