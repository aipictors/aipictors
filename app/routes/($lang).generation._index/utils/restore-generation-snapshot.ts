/**
 * 保存済みの画像生成画面の状態を復元する
 * 廃止した画面（ホバープレビューなど）の状態が残っていると画面が真っ黒のまま戻らないため、
 * 存在しない状態はプロンプト入力画面に戻す
 * @param stateText localStorage に保存された状態
 * @param stateNames 現在の状態名の一覧
 */
export function restoreGenerationSnapshot(
  stateText: string | null,
  stateNames: string[],
) {
  if (!stateText) return undefined
  try {
    const snapshot = JSON.parse(stateText)
    if (typeof snapshot !== "object" || snapshot === null) return undefined
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
