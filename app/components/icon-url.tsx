/**
 * アイコン画像のURLを返す
 * TODO_2024_08: コンポーネントではないのでutilsに移動する
 */
export function IconUrl(iconUrl: string | null | undefined) {
  return iconUrl ? iconUrl : "https://assets.aipictors.com/no-profile.jpg"
}
