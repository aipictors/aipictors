import {
  MAX_GENERATION_STATE_LENGTH,
  slimGenerationSnapshot,
} from "~/routes/($lang).generation._index/utils/persist-generation-snapshot"

/**
 * 保存済みの画像生成画面の状態を復元する
 * 廃止した画面（ホバープレビューなど）の状態が残っていると画面が真っ黒のまま戻らないため、
 * 存在しない状態はプロンプト入力画面に戻す。
 * 大きすぎる保存データ（以前の画像の data URL など）は大きい項目を捨てて読む
 * @param stateText localStorage に保存された状態
 * @param stateNames 現在の状態名の一覧
 */
export function restoreGenerationSnapshot(
  stateText: string | null,
  stateNames: string[],
) {
  if (!stateText) return undefined
  try {
    const parsed = JSON.parse(stateText)
    if (typeof parsed !== "object" || parsed === null) return undefined
    const snapshot =
      stateText.length > MAX_GENERATION_STATE_LENGTH
        ? slimGenerationSnapshot(parsed)
        : parsed
    if (
      typeof snapshot.value !== "string" ||
      !stateNames.includes(snapshot.value)
    ) {
      snapshot.value = "PROMPT_VIEW"
    }
    if (typeof snapshot.context === "object" && snapshot.context !== null) {
      snapshot.context = {
        ...snapshot.context,
        previewImageURL: null,
      }
    }
    return snapshot
  } catch (_error) {
    return undefined
  }
}
