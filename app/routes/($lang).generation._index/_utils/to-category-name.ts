export const toCategoryName = (category: string | null) => {
  if (category === "ILLUSTRATION_GIRL") {
    return "美少女イラスト"
  }

  if (category === "ANIMAL") {
    return "獣系"
  }

  if (category === "BIKINI_MODEL") {
    return "グラビア"
  }

  if (category === "ILLUSTRATION_BOY") {
    return "美男子イラスト"
  }

  if (category === "FIGURE") {
    return "美少女フィギュア"
  }

  if (category === "BACKGROUND") {
    return "背景"
  }

  return "全て"
}
