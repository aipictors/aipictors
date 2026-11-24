/**
 * モデル名を比べるための形（大文字小文字・空白・記号・拡張子・ハッシュの違いを無視する）
 * 例: "Z-Image Turbo" と "z-image turbo"、"MOSS Image" と "MOSS-Image" を同じものとして扱う
 */
export const normalizeAiModelName = (value: string) => {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\[[0-9a-f]+\]/g, "")
    .trim()
    .replace(/\.safetensors$/, "")
    .replace(/[\s_\-.・]/g, "")
    .trim()
}

type ImageModel = {
  id: string
  modelName: string
  displayName: string
}

/**
 * URL の /models/:model が作品のモデル名（ai_models.name）と一致しなかったときの行き先
 * - redirect: 正しい名前のページへ移す（生成機の番号 /models/730・表示名・大文字小文字違いなど）
 * - generator: 作品のモデルはまだ無いが、生成機のモデルとして中身のあるページを出す
 * - null: どのモデルでもない（404）
 */
export const resolveAiModelParam = (props: {
  param: string
  imageModels: ImageModel[]
  aiModelNames: string[]
}):
  | { kind: "redirect"; name: string }
  | { kind: "generator"; imageModel: ImageModel }
  | null => {
  const param = props.param.trim()

  const key = normalizeAiModelName(param)

  if (key.length === 0) {
    return null
  }

  const findAiModelName = (value: string) => {
    const valueKey = normalizeAiModelName(value)
    return (
      props.aiModelNames.find((name) => name === value) ??
      props.aiModelNames.find(
        (name) => normalizeAiModelName(name) === valueKey,
      ) ??
      null
    )
  }

  const imageModel =
    (/^\d+$/.test(param)
      ? props.imageModels.find((item) => item.id === param)
      : undefined) ??
    props.imageModels.find(
      (item) =>
        normalizeAiModelName(item.displayName) === key ||
        (item.modelName.length > 0 &&
          normalizeAiModelName(item.modelName) === key),
    ) ??
    null

  if (imageModel !== null) {
    const name =
      imageModel.modelName.length > 0
        ? imageModel.modelName
        : findAiModelName(imageModel.displayName)
    if (name !== null && name !== param) {
      return { kind: "redirect", name }
    }
    if (name === null && imageModel.displayName !== param) {
      return { kind: "redirect", name: imageModel.displayName }
    }
    return { kind: "generator", imageModel }
  }

  const name = findAiModelName(param)

  if (name !== null && name !== param) {
    return { kind: "redirect", name }
  }

  return null
}
