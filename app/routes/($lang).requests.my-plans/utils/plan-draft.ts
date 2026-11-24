/**
 * プランの書きかけを見分けるための文字列。
 *
 * プランを作る画面は枠の外を押すと閉じる作りで、書きかけの内容がそのまま消えていた。
 * 開いたときの内容と比べて、変わっているときだけ閉じるのを止める・たずねるために使う。
 * 項目の並び順で結果が変わらないよう、キーを並べ替えてから文字列にする。
 */
export const toDraftKey = (draft: Record<string, unknown>): string => {
  return JSON.stringify(
    Object.keys(draft)
      .sort()
      .map((key) => [key, draft[key]]),
  )
}
