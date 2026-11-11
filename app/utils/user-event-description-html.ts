const ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
}

/**
 * ユーザー企画（ユーザー主催のお題）の説明を、HTML として埋め込んでも安全な形にする。
 * 説明は利用者が書いた文なので、HTML として扱わず文字のまま見せる（<br> と </p> だけ改行に直す）。
 * 公式イベントの説明（運営が書いた HTML）には使わない
 */
export const toSafeUserEventDescriptionHtml = (
  description: string | null | undefined,
) => {
  if (!description) return ""
  const text = description
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]*>/g, "")
  return text
    .replace(/[&<>"']/g, (ch) => ESCAPES[ch] ?? ch)
    .replace(/\n/g, "<br>")
}
