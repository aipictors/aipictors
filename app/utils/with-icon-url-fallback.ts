/**
 * アイコン画像のURLを返す
 */
export function withIconUrlFallback(
  iconUrl: string | null | undefined,
): string {
  return iconUrl ? iconUrl : "https://assets.aipictors.com/no-profile.webp"
}
