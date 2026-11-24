import details from "~/lib/model-details/model-details.json"
import type { ModelDetail } from "~/lib/model-details/model-detail"

/**
 * 生成機のモデルの紹介をモデル ID で引く（画面の表示時に外へ取りに行かず、同梱の JSON から返す）
 * サーバーだけで読み込み、ローダーはそのモデルの 1 件だけを画面に渡す
 */
const detailMap = new Map(
  (details as ModelDetail[]).map((detail) => [
    String(detail.generatorId),
    detail,
  ]),
)

export const findModelDetail = (
  generatorId: string | null | undefined,
): ModelDetail | null => {
  if (generatorId === null || generatorId === undefined) {
    return null
  }
  return detailMap.get(String(generatorId)) ?? null
}
