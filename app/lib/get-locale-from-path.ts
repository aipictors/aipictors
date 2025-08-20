// 現在のパスからロケールを判定する純粋関数
// en 以外は ja を返す（将来言語追加時は配列に拡張）
export function getLocaleFromPath(path: string): "ja" | "en" {
  if (path.startsWith("/en")) return "en"
  return "ja"
}
