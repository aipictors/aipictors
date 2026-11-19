import type { IntrospectionEnum } from "~/lib/introspection-enum"

type ImageModel = {
  id: string
  modelName: string
  displayName: string
  explanation: string
  type: string
  style: IntrospectionEnum<"ImageStyle">
  thumbnailImageURL: string | null
}

/**
 * 画像生成のモデルの中から、このモデルと似ているモデルを選ぶ
 * - current: このモデル（生成機のモデル ID が同じもの、なければ名前が同じもの）
 * - related: 種類（SDXL など）とスタイルが同じものを先に、次に種類だけ同じもの
 */
export const findAiModelImageModels = (
  imageModels: ImageModel[],
  model: { name: string; generationModelId: string | null },
  limit: number,
) => {
  const current =
    imageModels.find((item) => item.id === model.generationModelId) ??
    imageModels.find((item) => item.modelName === model.name) ??
    null

  if (current === null) {
    return { current: null, related: [] }
  }

  const others = imageModels.filter(
    (item) =>
      item.id !== current.id &&
      item.modelName !== model.name &&
      item.type === current.type &&
      item.modelName.length > 0,
  )

  const related = [
    ...others.filter((item) => item.style === current.style),
    ...others.filter((item) => item.style !== current.style),
  ].slice(0, limit)

  return { current, related }
}
