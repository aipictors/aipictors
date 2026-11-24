import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { normalizeAiModelName } from "~/routes/($lang)._main.models.$model/ai-model-resolve"

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
 * - current: このモデル（生成機のモデル ID が同じもの、なければ名前が同じもの。名前は大文字小文字・記号の違いを無視して表示名とも比べる）
 * - related: 種類（SDXL など）とスタイルが同じものを先に、次に種類だけ同じもの
 */
export const findAiModelImageModels = (
  imageModels: ImageModel[],
  model: { name: string; generationModelId: string | null },
  limit: number,
) => {
  const key = normalizeAiModelName(model.name)

  const current =
    imageModels.find((item) => item.id === model.generationModelId) ??
    imageModels.find((item) => item.modelName === model.name) ??
    imageModels.find(
      (item) =>
        item.modelName.length === 0 &&
        normalizeAiModelName(item.displayName) === key,
    ) ??
    null

  if (current === null) {
    return { current: null, related: [] }
  }

  const others = imageModels.filter(
    (item) =>
      item.id !== current.id &&
      item.modelName !== model.name &&
      item.type === current.type &&
      (item.modelName.length > 0 || item.displayName.length > 0),
  )

  const related = [
    ...others.filter((item) => item.style === current.style),
    ...others.filter((item) => item.style !== current.style),
  ].slice(0, limit)

  return { current, related }
}
