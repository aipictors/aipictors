import type { IntrospectionEnum } from "~/lib/introspection-enum"

/**
 * プランごとのページング制限を取得する
 * @param passType ユーザーのプランタイプ
 * @returns 遡れるページ数の上限
 */
export function getMaxPagesByPlan(
  passType: IntrospectionEnum<"PassType"> | undefined | null,
): number {
  if (passType === "PREMIUM") {
    return 100
  }
  if (passType === "STANDARD") {
    return 50
  }
  if (passType === "LITE") {
    return 30
  }
  // 無料プラン
  return 20
}
